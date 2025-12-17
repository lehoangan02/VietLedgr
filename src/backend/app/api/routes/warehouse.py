from pydantic import BaseModel

from typing import Any, Optional
import uuid

from app.crud import warehouse
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.models import Warehouse
from app.schemas import warehouse as warehouse_schema

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(
    prefix = "/warehouses",
    tags=["warehouses"]
)


@router.get("/{warehouse_id}", response_model=warehouse_schema.WarehouseResponse)
def get_warehouse_by_id(
    *,
    session: SessionDep,
    warehouse_id: uuid.UUID
) -> Any:
    """
    Retrieve a warehouse by its ID
    """
    db_warehouse = warehouse.get_warehouse_by_id(db=session, warehouse_id=warehouse_id)
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return db_warehouse


@router.post("/", response_model=warehouse_schema.WarehouseResponse)
def create_warehouse(
    *,
    session: SessionDep,
    warehouse_in: warehouse.WarehouseCreate
) -> Any:
    """
    Create a new warehouse
    """
    db_warehouse = warehouse.create_warehouse(db=session, warehouse=warehouse_in)
    if not db_warehouse:
        raise HTTPException(status_code=400, detail="Warehouse could not be created")
    return db_warehouse


@router.put("/{warehouse_id}", response_model=warehouse_schema.WarehouseResponse)
def update_warehouse(
    session: SessionDep,
    warehouse_id: uuid.UUID,
    warehouse_in: warehouse.WarehouseUpdate
) -> Any:
    """
    Update a warehouse
    """
    db_warehouse = warehouse.update_warehouse(db=session, warehouse_id=warehouse_id, warehouse=warehouse_in)
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return db_warehouse

@router.get("/", response_model=warehouse_schema.WarehouseList)
def get_warehouses(
    *,
    session: SessionDep, 
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve multiple warehouses with pagination
    """
    db_warehouses = warehouse.get_warehouses(db=session, skip=skip, limit=limit)

    total = session.query(Warehouse).count()
    return {"items": db_warehouses, "total": total}

@router.delete("/{warehouse_id}", response_model=dict)
def delete_warehouse(
    *,
    session: SessionDep,
    warehouse_id: uuid.UUID
) -> Any:
    """
    Delete a warehouse
    """
    success = warehouse.delete_warehouse(db=session, warehouse_id=warehouse_id)
    if not success:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return {"detail": "Warehouse deleted successfully"}