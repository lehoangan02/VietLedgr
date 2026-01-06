import uuid

from app.api.deps import SessionDep
from app.crud import supplier as supplier_crud
from app.schemas.supplier import (SupplierCreate, SupplierResponse,
                                  SupplierUpdate)
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("", response_model=list[SupplierResponse])
def list_suppliers(session: SessionDep, skip: int = 0, limit: int = 100):
    return supplier_crud.list_suppliers(session, skip=skip, limit=limit)


@router.post("", response_model=SupplierResponse)
def create_supplier(session: SessionDep, payload: SupplierCreate):
    obj = supplier_crud.create_supplier(session, payload)
    session.commit()
    return obj


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    session: SessionDep, supplier_id: uuid.UUID, payload: SupplierUpdate
):
    obj = supplier_crud.update_supplier(session, supplier_id, payload)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplier not found")
    session.commit()
    return obj


@router.delete("/{supplier_id}", response_model=dict)
def delete_supplier(session: SessionDep, supplier_id: uuid.UUID):
    ok = supplier_crud.delete_supplier(session, supplier_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Supplier not found")
    session.commit()
    return {"detail": "Deleted"}
