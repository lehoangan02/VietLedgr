from app.api.routes import auth, user, product, store, warehouse, batch
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(product.router)
api_router.include_router(store.router)
api_router.include_router(warehouse.router)
api_router.include_router(batch.router)