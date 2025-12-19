from app.services.ai_service import AIAgent, AIRequest
from fastapi import APIRouter, Depends
from app.core.config import settings
from typing import Any

from app.api.deps import SessionDep, get_current_user, CurrentUser
from app.models import Batch, Expense, Warehouse, Store, Product, TransactionItem, TaxDetail


router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)


@router.post("/generate-report", )
def generate_report(
    current_user: CurrentUser,
    session: SessionDep,
    ai_agent: AIAgent = Depends(lambda: AIAgent(api_key=settings.GEMINI_API_KEY))
) -> Any:
    u_id = current_user.user_id
    all_data = {}
    # Gather data from the database
    stores = session.query(Store).filter(Store.id == u_id).all()
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
                tax = session.query(TaxDetail).filter(TaxDetail.product_id == product.product_id).first()
                transaction_items = session.query(TransactionItem).filter(TransactionItem.batch_id == batch.batch_id).all()
                batch_data["product_name"] = product.name if product else "Unknown"
                batch_data["stock"] = batch.stock
                batch_data["sales_price"] = str(batch.sale_price)
                batch_data["cost"] = str(batch.cost)
                if transaction_items:
                    for item in transaction_items:
                        batch_data["transaction"] = {}
                        batch_data["transaction"]["units_sold"] = item.quantity
                        batch_data["transaction"]["batch_revenue"] = str(item.quantity * batch.sale_price) - str(item.quantity * batch.cost)
                        if tax:
                            batch_data["transaction"]["tax"] = str(tax.tax_rate)
                        else:
                            batch_data["transaction"]["tax"] = "0"
                        batch_data["transaction"]["batch_date"] = item.transaction_date.strftime("%Y-%m-%d")
                    all_data["batches"].append(batch_data)
    print(all_data)
    # prompt = ai_agent.make_prompt(all_data)
    # ai_response = ai_agent.get_response(prompt)
    # code, report = ai_agent.parse_output(ai_response.response_text)

    return all_data

