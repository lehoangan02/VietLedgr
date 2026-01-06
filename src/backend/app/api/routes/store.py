from datetime import timedelta, datetime
from typing import Annotated, Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Body, Query
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.crud import store
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.models import Store
from app.schemas import store as store_schema
from app.api.deps import CurrentUser

from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/stores",
    tags=["stores"]
)


@router.get("/", response_model=list[store_schema.StoreResponse])
def list_stores(
    session: SessionDep,
    current_user: CurrentUser,
    mine: bool = Query(False, description="If true, return only the current user's store"),
):
    """
    List stores. Admins see all stores; otherwise return current user's store or all if mine=false.
    """
    db: Session = session
    # simple role check: if user role name is 'Admin', return all
    try:
        role_name = current_user.role.name.lower() if current_user and current_user.role else ""
    except Exception:
        role_name = ""

    if mine:
        s = db.query(Store).filter(Store.id == current_user.store_id).all()
        return s

    if role_name == "admin":
        return db.query(Store).all()

    # default: return only user's store
    s = db.query(Store).filter(Store.id == current_user.store_id).all()
    return s

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