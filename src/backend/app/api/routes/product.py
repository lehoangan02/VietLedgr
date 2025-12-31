import uuid
from typing import Any, Optional

from app.api.deps import SessionDep
from app.crud import product
from app.schemas.product import ProductResponse, ProductUpdate
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(*, session: SessionDep, product_id: uuid.UUID) -> Any:
    """
    Retrieve a product by its ID
    """
    db_product = product.get_product_by_id(db=session, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.get("/sku/{sku}", response_model=ProductResponse)
def get_product_by_sku(*, session: SessionDep, sku: str) -> Any:
    """
    Retrieve a product by its SKU
    """
    db_product = product.get_product_by_sku(db=session, sku=sku)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.post("/", response_model=ProductResponse)
def create_product(*, session: SessionDep, product_in: product.ProductCreate) -> Any:
    """
    Create a new product
    """
    db_product = product.create_product(db=session, product=product_in)
    if not db_product:
        raise HTTPException(status_code=400, detail="Failed to create product")
    return db_product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    *, session: SessionDep, product_id: uuid.UUID, product_in: ProductUpdate
) -> Any:
    """
    Update an existing product
    """
    db_product = product.update_product(
        db=session, product_id=product_id, product_in=product_in
    )
    if not db_product:
        raise HTTPException(
            status_code=404, detail="Product not found or failed to update"
        )
    return db_product


@router.delete("/{id}", response_model=None)
def delete_product(*, session: SessionDep, product_id: uuid.UUID) -> Any:
    """
    Delete a product by its ID
    """
    db_product = product.get_product_by_id(db=session, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    session.delete(db_product)
    session.commit()

    return {"detail": "Product deleted successfully"}


@router.get("/", response_model=list[ProductResponse])
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
