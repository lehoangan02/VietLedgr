from typing import Any, Dict, Optional, List
from sqlalchemy.orm import Session
from app import models
from ..schemas.batch import BatchCreate, BatchUpdate, BatchList
import uuid


def create_batch(
    db: Session,
    batch: BatchCreate
) -> models.Batch:
    """
    Validate incoming data with BatchCreate (pydantic) and create a new batch. (Batch)
    """
    payload = batch.model_dump()
    db_batch = models.Batch(**payload)
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

def update_batch(
        db: Session,
        batch_id: uuid.UUID,
        batch: BatchUpdate
) -> models.Batch:
    """
    Update an existing batch with provided fields.
    """
    db_batch = get_batch_by_id(db, batch_id=batch_id)
    if not db_batch:
        return None

    update_data = batch.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_batch, field):
            setattr(db_batch, field, value)

    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch
    
def get_batch_by_id(
        db: Session,
        batch_id: uuid.UUID
) -> models.Batch:
    """
    Retrieve a batch by id
    """
    return db.query(models.Batch).filter(models.Batch.id == batch_id).first()


def get_batches(
        db: Session,
        skip: int = 0,
        limit: int = 100
) -> List[models.Batch]:
    """
    Retrieve multiple batches with pagination
    """
    return db.query(models.Batch).offset(skip).limit(limit).all()

def delete_batch(
        db: Session,
        batch_id: uuid.UUID
) -> bool:
    """
    Delete a batch by id
    """
    db_batch = get_batch_by_id(db, batch_id=batch_id)
    if not db_batch:
        return False

    db.delete(db_batch)
    db.commit()
    return True