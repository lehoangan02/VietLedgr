from __future__ import annotations

import uuid
from typing import List, Optional

from app import models
from app.schemas.batch import BatchCreate, BatchUpdate
from sqlalchemy.orm import Session, joinedload


def create_batch(db: Session, batch: BatchCreate) -> models.Batch:
    """
    Create a batch. If supplier_id is provided, validate it exists.
    """
    payload = batch.model_dump()

    supplier_id = payload.get("supplier_id")
    if supplier_id is not None:
        supplier = db.get(models.Supplier, supplier_id)
        if supplier is None:
            raise ValueError("Supplier not found")

    db_batch = models.Batch(**payload)
    db.add(db_batch)
    db.commit()

    # Reload with supplier relationship so API can return supplier_name if needed
    db_batch = (
        db.query(models.Batch)
        .options(joinedload(models.Batch.supplier))
        .filter(models.Batch.batch_id == db_batch.batch_id)
        .first()
    )
    return db_batch


def update_batch(
    db: Session, batch_id: uuid.UUID, batch: BatchUpdate
) -> Optional[models.Batch]:
    """
    Update an existing batch with provided fields.
    """
    db_batch = get_batch_by_id(db, batch_id=batch_id)
    if db_batch is None:
        return None

    update_data = batch.model_dump(exclude_unset=True)

    # Validate supplier_id if being updated
    if "supplier_id" in update_data:
        supplier_id = update_data["supplier_id"]
        if supplier_id is not None:
            supplier = db.get(models.Supplier, supplier_id)
            if supplier is None:
                raise ValueError("Supplier not found")

    for field, value in update_data.items():
        setattr(db_batch, field, value)

    db.add(db_batch)
    db.commit()

    # Reload with supplier relationship
    db_batch = (
        db.query(models.Batch)
        .options(joinedload(models.Batch.supplier))
        .filter(models.Batch.batch_id == batch_id)
        .first()
    )
    return db_batch


def get_batch_by_id(db: Session, batch_id: uuid.UUID) -> Optional[models.Batch]:
    """
    Retrieve a batch by batch_id (with supplier relationship).
    """
    return (
        db.query(models.Batch)
        .options(joinedload(models.Batch.supplier))
        .filter(models.Batch.batch_id == batch_id)
        .first()
    )


def get_batches(db: Session, skip: int = 0, limit: int = 100) -> List[models.Batch]:
    """
    Retrieve multiple batches with pagination (with supplier relationship).
    """
    return (
        db.query(models.Batch)
        .options(joinedload(models.Batch.supplier))
        .offset(skip)
        .limit(limit)
        .all()
    )


def delete_batch(db: Session, batch_id: uuid.UUID) -> bool:
    """
    Delete a batch by batch_id
    """
    db_batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if db_batch is None:
        return False

    db.delete(db_batch)
    db.commit()
    return True
