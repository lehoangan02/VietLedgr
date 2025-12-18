from datetime import timedelta, datetime
from typing import Annotated, Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.crud import batch
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.models import Batch
from app.schemas import batch as batch_schema

router = APIRouter(
    prefix="/batches",
    tags=["batches"]
)

@router.get("/{batch_id}", response_model=batch_schema.BatchResponse)
def get_batch_by_id(
    *,
    session: SessionDep,
    batch_id: uuid.UUID
) -> Any:
    """
    Retrieve a batch by its ID
    """
    db_batch = batch.get_batch_by_id(db=session, batch_id=batch_id)
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch

@router.post("/", response_model=batch_schema.BatchResponse)
def create_batch(
    *,
    session: SessionDep,
    batch_in: batch.BatchCreate
) -> Any:
    """
    Create a new batch
    """
    db_batch = batch.create_batch(db=session, batch=batch_in)
    if not db_batch:
        raise HTTPException(status_code=400, detail="Batch could not be created")
    return db_batch

@router.put("/{batch_id}", response_model=batch_schema.BatchResponse)
def update_batch(
    session: SessionDep,
    batch_id: uuid.UUID,
    batch_in: batch.BatchUpdate
) -> Any:
    """
    Update a batch
    """
    db_batch = batch.update_batch(db=session, batch_id=batch_id, batch=batch_in)
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch

@router.get("/", response_model=list[batch_schema.BatchResponse])
def get_batches(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve multiple batches with pagination
    """
    db_batches = batch.get_batches(db=session, skip=skip, limit=limit)
    return db_batches

@router.delete("/{batch_id}", response_model=dict)
def delete_batch(
    *, 
    session: SessionDep,
    batch_id: uuid.UUID
) -> Any:
    """
    Delete a batch
    """
    db_batch = batch.get_batch_by_id(db=session, batch_id=batch_id)
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    session.delete(db_batch)
    session.commit()
    
    return {"detail": "Batch deleted successfully"}

