from app.api.routes import auth, user
from fastapi import FastAPI, Depends, APIRouter, HTTPException
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.orm import Session

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(user.router)