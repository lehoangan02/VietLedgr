from app.api.routes import auth, user, product, store, warehouse, batch, expenses, ledger, transactions, invite_codes
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(product.router)
api_router.include_router(store.router)
api_router.include_router(warehouse.router)
api_router.include_router(batch.router)
api_router.include_router(expenses.router)
api_router.include_router(ledger.router)
api_router.include_router(transactions.router)
api_router.include_router(invite_codes.router)