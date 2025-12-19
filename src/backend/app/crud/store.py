from typing import Any, Dict, Optional, List
from sqlalchemy.orm import Session
from app import models
from ..schemas.store import StoreCreate, StoreUpdate
import uuid

def create_store(
    db: Session,
    store: StoreCreate
) -> models.Store:
    """
    Validate incoming data with StoreCreate (pydantic) and create a new store. (Store)
    """
    payload = store.model_dump()
    db_store = models.Store(**payload)
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

def update_store(
        db: Session,
        store_id: uuid.UUID,
        store: StoreUpdate
) -> models.Store:
    """
    Update an existing store with provided fields.
    """
    db_store = get_store_by_id(db, store_id=store_id)
    if not db_store:
        return None

    update_data = store.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_store, field):
            setattr(db_store, field, value)

    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

def get_store_by_id(
        db: Session,
        store_id: uuid.UUID
) -> models.Store:
    """
    Retrieve a store by id
    """
    return db.query(models.Store).filter(models.Store.id == store_id).first()

def delete_store(
        db: Session,
        store_id: uuid.UUID
) -> bool:
    """
    Delete a store by id
    """
    db_store = get_store_by_id(db, store_id=store_id)
    if not db_store:
        return False

    db.delete(db_store)
    db.commit()
    return True