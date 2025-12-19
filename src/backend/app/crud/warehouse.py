from typing import Any, Dict, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from ..schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseList
import uuid


def create_warehouse(
    db: Session,
    warehouse: WarehouseCreate
) -> models.Warehouse:
    """
    Validate incoming data with WarehouseCreate (pydantic) and create a new warehouse. (Warehouse)
    """
    payload = warehouse.model_dump()
    db_warehouse = models.Warehouse(**payload)
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)

    # attach total_items so response model can read it
    setattr(db_warehouse, "total_items", 0)
    return db_warehouse

def update_warehouse(
        db: Session,
        warehouse_id: uuid.UUID,
        warehouse: WarehouseUpdate
) -> models.Warehouse:
    """
    Update an existing warehouse with provided fields.
    """
    db_warehouse = get_warehouse_by_id(db, warehouse_id=warehouse_id)
    if not db_warehouse:
        return None

    update_data = warehouse.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_warehouse, field):
            setattr(db_warehouse, field, value)

    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

def get_warehouse_by_id(
        db: Session,
        warehouse_id: uuid.UUID
) -> models.Warehouse:
    """
    Retrieve a warehouse by id
    """
    db_warehouse = db.query(models.Warehouse).filter(models.Warehouse.warehouse_id == warehouse_id).first()
    if not db_warehouse:
        return None

    # compute total items from related batches
    total = db.query(func.coalesce(func.sum(models.Batch.stock), 0)).filter(models.Batch.warehouse_id == db_warehouse.warehouse_id).scalar()
    setattr(db_warehouse, "total_items", int(total or 0))
    return db_warehouse

def get_warehouses(
        db: Session,
        skip: int = 0,
        limit: int = 100
) -> List[models.Warehouse]:
    """
    Retrieve multiple warehouses with pagination
    """
    db_warehouses = db.query(models.Warehouse).offset(skip).limit(limit).all()

    # fetch sums in one query to avoid N+1
    rows = db.query(models.Batch.warehouse_id, func.coalesce(func.sum(models.Batch.stock), 0))\
             .group_by(models.Batch.warehouse_id).all()
    counts = {r[0]: int(r[1] or 0) for r in rows}

    for w in db_warehouses:
        setattr(w, "total_items", counts.get(w.warehouse_id, 0))

    return db_warehouses

def delete_warehouse(
        db: Session,
        warehouse_id: uuid.UUID
) -> bool:
    """
    Delete a warehouse by id
    """
    db_warehouse = get_warehouse_by_id(db, warehouse_id=warehouse_id)
    if not db_warehouse:
        return False

    db.delete(db_warehouse)
    db.commit()
    return True