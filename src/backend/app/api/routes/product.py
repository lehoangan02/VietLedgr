from datetime import timedelta, datetime
from typing import Annotated, Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.crud import product
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.models import Product
from app.schemas import product as product_schema

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/{product_id}", response_model=product_schema.ProductResponse)
def get_product_by_id(
    *,
    session: SessionDep,
    product_id: uuid.UUID
) -> Any:
    """
    Retrieve a product by its ID
    """
    db_product = product.get_product_by_id(db=session, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get("/sku/{sku}", response_model=product_schema.ProductResponse)
def get_product_by_sku(
    *,
    session: SessionDep,
    sku: str
) -> Any:
    """
    Retrieve a product by its SKU
    """
    db_product = product.get_product_by_sku(db=session, sku=sku)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.post("/", response_model=product_schema.ProductResponse)
def create_product(
    *,
    session: SessionDep,
    product_in: product.ProductCreate
) -> Any:
    """
    Create a new product
    """
    db_product = product.create_product(db=session, product=product_in)
    if not db_product:
        raise HTTPException(status_code=400, detail="Failed to create product")
    return db_product

@router.put("/{product_id}", response_model=dict)
def update_product(
    *,
    session: SessionDep,
    product_id: uuid.UUID,
    product_in: product.ProductUpdate
) -> Any:
    """
    Update an existing product
    """
    db_product = product.update_product(
        db=session,
        product_id=product_id,
        product_in=product_in
    )
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found or failed to update")
    return {"product": db_product}

@router.delete("/{id}", response_model=dict)
def delete_product(
    *,
    session: SessionDep,
    product_id: uuid.UUID
) -> Any:
    """
    Delete a product by its ID
    """
    db_product = product.get_product_by_id(db=session, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    session.delete(db_product)
    session.commit()
    
    return {"detail": "Product deleted successfully"}

@router.get("/", response_model=list[product_schema.ProductResponse])
def list_products(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    store_id: Optional[uuid.UUID] = None,
    category_id: Optional[uuid.UUID] = None,
) -> Any:
    """
    List products with pagination
    """
    products = product.list_products(db=session, skip=skip, limit=limit)
    return products