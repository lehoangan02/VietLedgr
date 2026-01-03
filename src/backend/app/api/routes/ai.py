from app.services.ai_service import AIAgent, AIRequest
from fastapi import APIRouter, Depends
from app.core.config import settings
from typing import Any
import uuid
from datetime import datetime, timedelta

from app.api.deps import SessionDep, get_current_user, CurrentUser
from app.models import Batch, Expense, Warehouse, Store, Product, TransactionItem, TaxDetail, User


router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)


@router.post("/generate-report", )
def generate_report(
    # current_user: CurrentUser,
    session: SessionDep,
    ai_agent: AIAgent = Depends(lambda: AIAgent(api_key=settings.GEMINI_API_KEY)),
    start_date: str | None = None,
    end_date: str | None = None,
) -> Any:
    u_id = uuid.UUID("179fbe00-ef57-4f1e-90cc-2f89ef63c7fc")
    user = session.query(User).filter(User.user_id == u_id).first()
    all_stores = []
    # Gather data from the database
    stores = session.query(Store).filter(Store.id == user.store_id).all()
    # parse date range if provided
    start_dt = None
    end_dt = None
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
        except Exception:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    if end_date:
        try:
            parsed_end = datetime.fromisoformat(end_date)
        except Exception:
            parsed_end = datetime.strptime(end_date, "%Y-%m-%d")
        # make end_dt inclusive to end of day if only a date was provided
        if len(end_date) <= 10:
            end_dt = parsed_end + timedelta(days=1) - timedelta(seconds=1)
        else:
            end_dt = parsed_end

    for store in stores:
        warehouses = session.query(Warehouse).filter(Warehouse.store_id == store.id).all()
        expenses = session.query(Expense).filter(Expense.store_id == store.id).all()
        all_data = {
            "store_info": {
                "store_name": store.name,
                "store_expense": [expense.amount for expense in expenses]
            },
            "batches": []
        }
        for warehouse in warehouses:
            batches = session.query(Batch).filter(Batch.warehouse_id == warehouse.warehouse_id).all()
            for batch in batches:
                batch_data = {}
                product = session.query(Product).filter(Product.product_id == batch.product_id).first()
                # tax = session.query(TaxDetail).filter(TaxDetail.product_id == product.product_id).first()
                # build filters for transaction items including optional date range
                tx_filters = [TransactionItem.batch_id == batch.batch_id]
                if start_dt:
                    tx_filters.append(TransactionItem.created_at >= start_dt)
                if end_dt:
                    tx_filters.append(TransactionItem.created_at <= end_dt)
                transaction_items = session.query(TransactionItem).filter(*tx_filters).all()
                batch_data["product_name"] = product.name if product else "Unknown"
                batch_data["stock"] = batch.stock
                batch_data["sales_price"] = str(batch.sale_price)
                batch_data["cost"] = str(batch.cost)
                batch_data["warehouse_name"] = warehouse.name
                batch_data["supplier"] = batch.supplier_name
                if transaction_items:
                    for item in transaction_items:
                        batch_data["transaction"] = {}
                        batch_data["transaction"]["units_sold"] = item.quantity
                        batch_data["transaction"]["batch_revenue"] = str(item.quantity * batch.sale_price - item.quantity * batch.cost)
                        # if tax:
                        #     batch_data["transaction"]["tax"] = str(tax.tax_rate)
                        # else:
                        #     batch_data["transaction"]["tax"] = "0"
                        batch_data["transaction"]["batch_date"] = item.created_at.strftime("%Y-%m-%d")
                all_data["batches"].append(batch_data)
        all_stores.append(all_data)

    print(all_stores)
    # pass the aggregated stores data to the AI prompt
    prompt = ai_agent.make_prompt(all_stores)
    ai_response = ai_agent.get_response(prompt)
    code, report = ai_agent.parse_output(ai_response.response_text)
    images = ai_agent.execute_analysis(code)

    return {
        "code": code,
        "images": images,
        "report": report
    }

