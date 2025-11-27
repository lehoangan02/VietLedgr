import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app import models
from app.schemas.transaction import (
    TransactionCreate,
    TransactionSummary,
)


class TransactionCRUD:
    """CRUD operations for transactions"""

    @staticmethod
    def create_transaction_with_items(
        db: Session,
        transaction: TransactionCreate,
        user_id: uuid.UUID,
    ) -> models.Transaction:
        """
        Create transaction with items (atomic operation)
        - Validate stock availability
        - Deduct stock from batches
        - Calculate totals
        - Create transaction record
        - Create transaction items
        - Create ledger entries
        """
        try:
            # Step 1: Validate stock availability for all items
            items_data = []
            total_amount = Decimal("0")
            total_tax = Decimal("0")

            for item in transaction.items:
                batch = db.query(models.Batch).filter(
                    models.Batch.batch_id == item.batch_id
                ).first()

                if not batch:
                    raise ValueError(f"Batch {item.batch_id} not found")

                if batch.stock < item.quantity:
                    raise ValueError(
                        f"Insufficient stock for batch {item.batch_id}. "
                        f"Available: {batch.stock}, Requested: {item.quantity}"
                    )

                # Get product for tax calculation
                product = batch.product
                tax_rate = Decimal("0")
                if product.category and product.category.tax:
                    tax_rate = Decimal(str(product.category.tax.tax_rate)) / 100

                line_amount = item.price_at_sale * item.quantity
                line_tax = line_amount * tax_rate
                total_amount += line_amount
                total_tax += line_tax

                items_data.append({
                    "batch": batch,
                    "quantity": item.quantity,
                    "price_at_sale": item.price_at_sale,
                    "cost_at_sale": batch.cost,
                    "tax_amount": line_tax,
                })

            # Step 2: Create transaction record
            new_transaction = models.Transaction(
                store_id=transaction.store_id,
                user_id=user_id,
                device_id=transaction.device_id,
                total_amount=total_amount,
                total_tax=total_tax,
            )
            db.add(new_transaction)
            db.flush()  # Get the transaction_id without committing

            # Step 3: Create transaction items and update stock
            for item_data in items_data:
                batch = item_data["batch"]

                # Deduct stock from batch
                batch.stock -= item_data["quantity"]
                batch.updated_at = datetime.utcnow()

                # Create transaction item
                transaction_item = models.TransactionItem(
                    transaction_id=new_transaction.transaction_id,
                    batch_id=batch.batch_id,
                    quantity=item_data["quantity"],
                    price_at_sale=item_data["price_at_sale"],
                    cost_at_sale=item_data["cost_at_sale"],
                )
                db.add(transaction_item)

            db.flush()

            # Step 4: Create ledger entries (double-entry bookkeeping)
            # Debit: Accounts Receivable / Cash, Credit: Revenue
            revenue_entry = models.GeneralLedgerEntry(
                store_id=transaction.store_id,
                account_type=models.AccountType.REVENUE,
                transaction_id=new_transaction.transaction_id,
                description=f"Revenue from transaction {new_transaction.transaction_id}",
                debit_amount=Decimal("0"),
                credit_amount=total_amount,
            )
            db.add(revenue_entry)

            # Debit: Cost of Goods Sold, Credit: Inventory
            cogs_amount = sum(
                Decimal(str(item_data["cost_at_sale"])) * item_data["quantity"]
                for item_data in items_data
            )
            cogs_entry = models.GeneralLedgerEntry(
                store_id=transaction.store_id,
                account_type=models.AccountType.EXPENSE,
                transaction_id=new_transaction.transaction_id,
                description=f"Cost of goods sold for transaction {new_transaction.transaction_id}",
                debit_amount=cogs_amount,
                credit_amount=Decimal("0"),
            )
            db.add(cogs_entry)

            # Commit all changes
            db.commit()
            db.refresh(new_transaction)
            return new_transaction

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_transaction(
        db: Session,
        transaction_id: uuid.UUID,
    ) -> Optional[models.Transaction]:
        """Get a single transaction by ID"""
        return db.query(models.Transaction).filter(
            models.Transaction.transaction_id == transaction_id
        ).first()

    @staticmethod
    def get_transactions(
        db: Session,
        store_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[models.Transaction], int]:
        """Get paginated transactions for a store"""
        query = db.query(models.Transaction).filter(
            models.Transaction.store_id == store_id
        ).order_by(models.Transaction.created_at.desc())

        total = query.count()
        transactions = query.offset(skip).limit(limit).all()

        return transactions, total

    @staticmethod
    def get_transaction_summary(
        db: Session,
        store_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
    ) -> TransactionSummary:
        """Get transaction summary for reporting"""
        query = db.query(models.Transaction).filter(
            and_(
                models.Transaction.store_id == store_id,
                models.Transaction.created_at >= start_date,
                models.Transaction.created_at <= end_date,
            )
        )

        total_transactions = query.count()
        result = db.query(
            func.sum(models.Transaction.total_amount),
            func.sum(models.Transaction.total_tax),
        ).filter(
            and_(
                models.Transaction.store_id == store_id,
                models.Transaction.created_at >= start_date,
                models.Transaction.created_at <= end_date,
            )
        ).first()

        total_amount = result[0] or Decimal("0")
        total_tax = result[1] or Decimal("0")

        # Count total items
        total_items = db.query(func.sum(models.TransactionItem.quantity)).filter(
            models.TransactionItem.transaction_id.in_(
                db.query(models.Transaction.transaction_id).filter(
                    and_(
                        models.Transaction.store_id == store_id,
                        models.Transaction.created_at >= start_date,
                        models.Transaction.created_at <= end_date,
                    )
                )
            )
        ).scalar() or 0

        average_transaction = (
            total_amount / total_transactions if total_transactions > 0 else Decimal("0")
        )

        return TransactionSummary(
            total_transactions=total_transactions,
            total_amount=total_amount,
            total_tax=total_tax,
            total_items=total_items,
            average_transaction=average_transaction,
            date_range_start=start_date,
            date_range_end=end_date,
        )

    @staticmethod
    def void_transaction(
        db: Session,
        transaction_id: uuid.UUID,
    ) -> models.Transaction:
        """Void/cancel a transaction and restore stock"""
        try:
            transaction = db.query(models.Transaction).filter(
                models.Transaction.transaction_id == transaction_id
            ).first()

            if not transaction:
                raise ValueError(f"Transaction {transaction_id} not found")

            # Get all transaction items
            items = db.query(models.TransactionItem).filter(
                models.TransactionItem.transaction_id == transaction_id
            ).all()

            # Restore stock for all batches
            for item in items:
                batch = item.batch
                batch.stock += item.quantity
                batch.updated_at = datetime.utcnow()

            # Delete transaction items (cascade will handle ledger entries)
            for item in items:
                db.delete(item)

            # Delete transaction
            db.delete(transaction)
            db.commit()

            return transaction

        except Exception as e:
            db.rollback()
            raise e