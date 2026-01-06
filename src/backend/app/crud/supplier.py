import uuid

from app.models import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


def list_suppliers(db: Session, skip: int = 0, limit: int = 100) -> list[Supplier]:
    stmt = select(Supplier).order_by(Supplier.name.asc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


def get_supplier(db: Session, supplier_id: uuid.UUID) -> Supplier | None:
    return db.get(Supplier, supplier_id)


def create_supplier(db: Session, supplier_in: SupplierCreate) -> Supplier:
    obj = Supplier(**supplier_in.model_dump())
    db.add(obj)
    db.flush()
    db.refresh(obj)
    return obj


def update_supplier(
    db: Session, supplier_id: uuid.UUID, supplier_in: SupplierUpdate
) -> Supplier | None:
    obj = db.get(Supplier, supplier_id)
    if not obj:
        return None
    data = supplier_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    db.add(obj)
    db.flush()
    db.refresh(obj)
    return obj


def delete_supplier(db: Session, supplier_id: uuid.UUID) -> bool:
    obj = db.get(Supplier, supplier_id)
    if not obj:
        return False
    db.delete(obj)
    return True
