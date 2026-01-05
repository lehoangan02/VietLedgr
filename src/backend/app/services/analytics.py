from datetime import datetime, timedelta
from typing import List
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app import models


class AnalyticsService:
    @staticmethod
    def category_sales(db: Session, store_id, start_date: datetime, end_date: datetime) -> List[dict]:
        # Aggregate sales, tax and profit grouped by product category
        q = (
            db.query(
                models.ProductCategory.name.label("name"),
                func.coalesce(func.sum(models.TransactionItem.quantity * models.TransactionItem.price_at_sale), 0).label("sales"),
                func.coalesce(func.sum(models.TransactionItem.quantity * models.TransactionItem.price_at_sale * (models.TaxDetail.tax_rate / 100)), 0).label("tax"),
                func.coalesce(func.sum(models.TransactionItem.quantity * (models.TransactionItem.price_at_sale - models.TransactionItem.cost_at_sale)), 0).label("profit"),
            )
            .join(models.Product, models.Product.category_id == models.ProductCategory.category_id)
            .join(models.Batch, models.Batch.product_id == models.Product.product_id)
            .join(models.TransactionItem, models.TransactionItem.batch_id == models.Batch.batch_id)
            .join(models.Transaction, models.Transaction.transaction_id == models.TransactionItem.transaction_id)
            .outerjoin(models.TaxDetail, models.ProductCategory.tax_id == models.TaxDetail.tax_id)
            .filter(models.Transaction.store_id == store_id)
            .filter(models.Transaction.created_at >= start_date)
            .filter(models.Transaction.created_at <= end_date)
            .group_by(models.ProductCategory.name, models.TaxDetail.tax_rate)
        )

        return [
            {
                "name": row.name or "UNCATEGORIZED",
                "sales": float(row.sales),
                "tax": float(row.tax),
                "profit": float(row.profit),
            }
            for row in q.all()
        ]

    @staticmethod
    def monthly_performance(db: Session, store_id, years: List[int]) -> List[dict]:
        # Build base months list Jan..Dec
        months = [
            {"month": m, "rev": {y: 0.0 for y in years}, "prof": {y: 0.0 for y in years}}
            for m in ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        ]

        for y in years:
            start = datetime(y, 1, 1)
            end = datetime(y, 12, 31, 23, 59, 59)

            # Revenue per month (in millions)
            rev_q = (
                db.query(
                    extract("month", models.Transaction.created_at).label("m"),
                    func.coalesce(func.sum(models.Transaction.total_amount), 0).label("rev"),
                )
                .filter(models.Transaction.store_id == store_id)
                .filter(models.Transaction.created_at >= start)
                .filter(models.Transaction.created_at <= end)
                .group_by(extract("month", models.Transaction.created_at))
            )

            for row in rev_q.all():
                idx = int(row.m) - 1
                months[idx]["rev"][y] = float(row.rev) / 1_000_000

            # Profit per month based on transaction items
            prof_q = (
                db.query(
                    extract("month", models.Transaction.created_at).label("m"),
                    func.coalesce(func.sum(models.TransactionItem.quantity * (models.TransactionItem.price_at_sale - models.TransactionItem.cost_at_sale)), 0).label("prof"),
                )
                .join(models.Transaction, models.Transaction.transaction_id == models.TransactionItem.transaction_id)
                .filter(models.Transaction.store_id == store_id)
                .filter(models.Transaction.created_at >= start)
                .filter(models.Transaction.created_at <= end)
                .group_by(extract("month", models.Transaction.created_at))
            )

            for row in prof_q.all():
                idx = int(row.m) - 1
                months[idx]["prof"][y] = float(row.prof) / 1_000_000

        # Convert to required shape
        return [
            {
                "month": months[i]["month"],
                **{f"rev{y}": round(months[i]["rev"][y], 2) for y in years},
                **{f"prof{y}": round(months[i]["prof"][y], 2) for y in years},
            }
            for i in range(12)
        ]

    @staticmethod
    def best_sellers(db: Session, store_id, limit: int = 10) -> List[dict]:
        q = (
            db.query(
                models.Product.name.label("name"),
                func.coalesce(func.sum(models.TransactionItem.quantity), 0).label("units"),
            )
            .join(models.Batch, models.Batch.product_id == models.Product.product_id)
            .join(models.TransactionItem, models.TransactionItem.batch_id == models.Batch.batch_id)
            .join(models.Transaction, models.Transaction.transaction_id == models.TransactionItem.transaction_id)
            .filter(models.Transaction.store_id == store_id)
            .group_by(models.Product.name)
            .order_by(func.sum(models.TransactionItem.quantity).desc())
            .limit(limit)
        )

        return [{"name": r.name, "units": int(r.units)} for r in q.all()]

    @staticmethod
    def worst_sellers(db: Session, store_id, limit: int = 10) -> List[dict]:
        q = (
            db.query(
                models.Product.name.label("name"),
                func.coalesce(func.sum(models.TransactionItem.quantity), 0).label("units"),
            )
            .join(models.Batch, models.Batch.product_id == models.Product.product_id)
            .join(models.TransactionItem, models.TransactionItem.batch_id == models.Batch.batch_id)
            .join(models.Transaction, models.Transaction.transaction_id == models.TransactionItem.transaction_id)
            .filter(models.Transaction.store_id == store_id)
            .group_by(models.Product.name)
            .order_by(func.sum(models.TransactionItem.quantity).asc())
            .limit(limit)
        )

        return [{"name": r.name, "units": int(r.units)} for r in q.all()]

    @staticmethod
    def low_stock_items(db: Session, store_id, threshold: int = 10) -> List[dict]:
        # Sum stock per product and return items below threshold
        q = (
            db.query(
                models.Product.name.label("name"),
                func.coalesce(func.sum(models.Batch.stock), 0).label("stock"),
                models.ProductCategory.name.label("cat"),
            )
            .join(models.Batch, models.Batch.product_id == models.Product.product_id)
            .outerjoin(models.ProductCategory, models.Product.category_id == models.ProductCategory.category_id)
            .filter(models.Product.store_id == store_id)
            .group_by(models.Product.name, models.ProductCategory.name)
            .having(func.coalesce(func.sum(models.Batch.stock), 0) <= threshold)
        )

        return [{"name": r.name, "stock": int(r.stock), "cat": r.cat or "UNCATEGORIZED"} for r in q.all()]

    @staticmethod
    def expiring_items(db: Session, store_id, within_days: int = 7) -> List[dict]:
        now = datetime.utcnow()
        cutoff = now + timedelta(days=within_days)
        q = (
            db.query(
                models.Product.name.label("name"),
                func.coalesce(func.date_part('day', models.Batch.expire_date - func.now()), 0).label("days"),
                models.Batch.batch_id.label("batch"),
            )
            .join(models.Product, models.Product.product_id == models.Batch.product_id)
            .filter(models.Product.store_id == store_id)
            .filter(models.Batch.expire_date.isnot(None))
            .filter(models.Batch.expire_date <= cutoff)
            .order_by(models.Batch.expire_date.asc())
        )

        items = []
        for r in q.all():
            days = int(r.days) if r.days is not None else 0
            items.append({"name": r.name, "days": days, "batch": str(r.batch)[:8]})

        return items
