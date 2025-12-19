from datetime import timedelta, datetime
from typing import Annotated, Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.crud import store
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.models import Store
from app.schemas import store as store_schema

router = APIRouter(
    prefix="/stores",
    tags=["stores"]
)

@router.get("/{store_id}", response_model=store_schema.StoreResponse)
def get_store_by_id(
    *,
    session: SessionDep,
    store_id: uuid.UUID
):
    """
    Retrieve a store by its ID
    """
    db_store = store.get_store_by_id(db=session, store_id=store_id)
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    return db_store

@router.post("/", response_model=store_schema.StoreResponse)
def create_store(
    *,
    session: SessionDep,
    store_in: store.StoreCreate
) -> Any:
    """
    Create a new store
    """
    db_store = store.create_store(db=session, store=store_in)
    if not db_store:
        raise HTTPException(status_code=400, detail="Store could not be created")
    return db_store


@router.put("/{store_id}", response_model=store_schema.StoreResponse)
def update_store(
    session: SessionDep,
    store_id: uuid.UUID,
    store_in: store.StoreUpdate
) -> Any:
    """
    Update a store
    """
    db_store = store.update_store(db=session, store_id=store_id, store=store_in)
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    return db_store


@router.delete("/{store_id}", response_model=dict)
def delete_store(
    *, 
    session: SessionDep,
    store_id: uuid.UUID
) -> Any:
    """
    Delete a store
    """
    success = store.delete_store(db=session, store_id=store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Store not found")
    return {"detail": "Store deleted successfully"}