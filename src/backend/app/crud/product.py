from typing import Any, Dict, Optional, List
from sqlalchemy.orm import Session
from app import models
from ..schemas.product import ProductCreate, ProductUpdate
import uuid

def create_product(
    db: Session,
    product: ProductCreate
) -> models.Product:
    """
    Validate incoming data with ProductCreate (pydantic) and create a new product. (Product)
    """
    payload = product.model_dump()
    db_product = models.Product(**payload)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(
    db: Session,
    *,
    product_id: uuid.UUID,
    product_in: ProductUpdate
) -> Optional[models.Product]:
    """
    Validate incoming data with ProductUpdate (pydantic) and apply only provided fields.
    """
    db_product = get_product_by_id(db, product_id=product_id)
    if not db_product:
        return None

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_product, field):
            setattr(db_product, field, value)

    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product_by_id(
    db: Session,
    product_id: uuid.UUID
) -> Optional[models.Product]:
    """
    Retrieve a product by its product ID
    """
    return db.query(models.Product).filter(models.Product.product_id == product_id).first()

def get_product_by_sku(
    db: Session,
    sku: str
) -> Optional[models.Product]:
    """
    Retrieve a product by SKU
    """
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def list_products(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    store_id: Optional[uuid.UUID] = None,
    category_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None
) -> List[models.Product]:
    """
    List products with optional filters and pagination
    """
    query = db.query(models.Product)
    if store_id is not None:
        query = query.filter(models.Product.store_id == store_id)
    if category_id is not None:
        query = query.filter(models.Product.category_id == category_id)
    if search:
        term = f"%{search}%"
        query = query.filter(
            models.Product.name.ilike(term) |
            models.Product.description.ilike(term) |
            models.Product.sku.ilike(term)
        )
    return query.offset(skip).limit(limit).all()

def delete_product(
    db: Session,
    *,
    product_id: uuid.UUID
) -> bool:
    """
    Delete a product. Returns True if deleted, False if not found.
    """
    db_product = get_product_by_id(db, product_id=product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True