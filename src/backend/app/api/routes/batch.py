import uuid

from app.api.deps import SessionDep
from app.crud import batch
from app.models import Batch
from app.schemas import batch as batch_schema
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/batches", tags=["batches"])


@router.get("/{batch_id}", response_model=batch_schema.BatchResponse)
def get_batch_by_id(*, session: SessionDep, batch_id: uuid.UUID):
    db_batch = batch.get_batch_by_id(db=session, batch_id=batch_id)
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch


@router.post("/", response_model=batch_schema.BatchResponse)
def create_batch(*, session: SessionDep, batch_in: batch_schema.BatchCreate):
    try:
        db_batch = batch.create_batch(db=session, batch=batch_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return db_batch


@router.put("/{batch_id}", response_model=batch_schema.BatchResponse)
def update_batch(
    *, session: SessionDep, batch_id: uuid.UUID, batch_in: batch_schema.BatchUpdate
):
    try:
        db_batch = batch.update_batch(db=session, batch_id=batch_id, batch=batch_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch


@router.get("/", response_model=batch_schema.BatchList)
def get_batches(*, session: SessionDep, skip: int = 0, limit: int = 100):
    db_batches = batch.get_batches(db=session, skip=skip, limit=limit)
    total = session.query(Batch).count()
    return {"items": db_batches, "total": total}


@router.delete("/{batch_id}", response_model=dict)
def delete_batch(*, session: SessionDep, batch_id: uuid.UUID):
    ok = batch.delete_batch(db=session, batch_id=batch_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Batch not found")
    return {"detail": "Batch deleted successfully"}
