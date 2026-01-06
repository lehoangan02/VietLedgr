from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.analytics import AnalyticsService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", summary="Get dashboard aggregates")
def get_dashboard(
    store_id: str = Query(..., description="Store UUID"),
    start: datetime | None = Query(None, description="Start datetime"),
    end: datetime | None = Query(None, description="End datetime"),
    db: Session = Depends(get_db),
):
    try:
        # default to current year range if not provided
        now = datetime.utcnow()
        if not start:
            start = datetime(now.year, 1, 1)
        if not end:
            end = datetime(now.year, 12, 31, 23, 59, 59)

        years = [now.year - 1, now.year]

        data = {
            "category_sales": AnalyticsService.category_sales(db, store_id, start, end),
            "monthly_performance": AnalyticsService.monthly_performance(db, store_id, years),
            "best_sellers": AnalyticsService.best_sellers(db, store_id, limit=10),
            "worst_sellers": AnalyticsService.worst_sellers(db, store_id, limit=10),
            "low_stock_items": AnalyticsService.low_stock_items(db, store_id, threshold=10),
            "expiring_items": AnalyticsService.expiring_items(db, store_id, within_days=7),
        }

        # totals
        total_tax = sum(item.get("tax", 0) for item in data["category_sales"]) if data["category_sales"] else 0
        total_profit = sum(item.get("profit", 0) for item in data["category_sales"]) if data["category_sales"] else 0
        data.update({"total_tax": total_tax, "total_profit": total_profit})
        print(f"Monthly Performance Data: {data['monthly_performance']}")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
