# Pydantic Schemas Implementation Plan

## Overview
This document details the implementation of all Pydantic schemas for request/response validation in the VietLedgr API.

---

## Schema Organization

### Directory Structure
```
src/backend/app/schemas/
├── __init__.py                  # Export all schemas
├── base.py                      # Base schemas (timestamps, common fields)
├── store.py                     # Store schemas
├── role.py                      # Role schemas
├── product.py                   # Product schemas
├── category.py                  # Category schemas
├── tax.py                       # Tax detail schemas
├── warehouse.py                 # Warehouse schemas
├── batch.py                     # Batch schemas
├── transaction.py               # Transaction schemas
├── expense.py                   # Expense schemas
└── ledger.py                    # Ledger entry schemas
```

---

## Schema Naming Convention

### Standard Pattern
- **`{Model}Base`** - Common fields for all operations
- **`{Model}Create`** - Request schema for creation (POST)
- **`{Model}Update`** - Request schema for updates (PUT/PATCH)
- **`{Model}Response`** - Response schema (GET)
- **`{Model}List`** - Response schema for list operations

### Example
```python
class ProductBase(BaseModel):
    """Shared fields"""
    name: str
    sku: str

class ProductCreate(ProductBase):
    """For POST requests"""
    store_id: UUID
    category_id: UUID | None = None

class ProductUpdate(BaseModel):
    """For PUT requests - all fields optional"""
    name: str | None = None
    category_id: UUID | None = None

class ProductResponse(ProductBase):
    """For GET responses"""
    product_id: UUID
    store_id: UUID
    category_id: UUID | None = None
    created_at: datetime
    updated_at: datetime

class ProductList(BaseModel):
    """For list responses"""
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
```

---

## Phase 2.2 Schemas (Products & Inventory)

### 2.2.1 Base Schema (`schemas/base.py`)

**File:** `src/backend/app/schemas/base.py`

**Purpose:** Common base classes and utilities

```python
from pydantic import BaseModel
from datetime import datetime

class TimestampMixin(BaseModel):
    """Mixin for schemas with timestamps"""
    created_at: datetime
    updated_at: datetime | None = None

class PaginationParams(BaseModel):
    """Standard pagination parameters"""
    skip: int = 0
    limit: int = 100
    
    class Config:
        gt = 0
        le = 1000

class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response"""
    items: list[T]
    total: int
    skip: int
    limit: int
```

**Status:** TODO  
**Estimated Time:** 30 minutes

---

### 2.2.2 Store Schemas (`schemas/store.py`)

**File:** `src/backend/app/schemas/store.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class StoreBase(BaseModel):
    """Base store information"""
    name: str = Field(..., min_length=1, max_length=255, description="Store name")
    address: str | None = Field(None, max_length=500, description="Store address")
    phone: str | None = Field(None, max_length=20, regex=r"^\+?1?\d{9,15}$", description="Phone number")
    email: str | None = Field(None, regex=r"^[\w\.-]+@[\w\.-]+\.\w+$", description="Email address")

class StoreCreate(StoreBase):
    """Create store request"""
    pass

class StoreUpdate(BaseModel):
    """Update store request - all fields optional"""
    name: str | None = Field(None, min_length=1, max_length=255)
    address: str | None = Field(None, max_length=500)
    phone: str | None = Field(None, max_length=20)
    email: str | None = Field(None)

class StoreResponse(StoreBase):
    """Store response"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StoreList(BaseModel):
    """Paginated store list"""
    items: list[StoreResponse]
    total: int
    skip: int
    limit: int
```

**Status:** TODO  
**Estimated Time:** 1 hour

---

### 2.2.3 Tax Detail Schemas (`schemas/tax.py`)

**File:** `src/backend/app/schemas/tax.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from uuid import UUID

class TaxDetailBase(BaseModel):
    """Base tax information"""
    tax_name: str = Field(..., min_length=1, max_length=100, description="Tax name")
    tax_rate: Decimal = Field(..., ge=0, le=100, decimal_places=2, description="Tax rate percentage")
    tax_description: str | None = Field(None, max_length=500, description="Tax description")

class TaxDetailCreate(TaxDetailBase):
    """Create tax detail request"""
    pass

class TaxDetailUpdate(BaseModel):
    """Update tax detail request"""
    tax_name: str | None = Field(None, min_length=1, max_length=100)
    tax_rate: Decimal | None = Field(None, ge=0, le=100, decimal_places=2)
    tax_description: str | None = Field(None, max_length=500)

class TaxDetailResponse(TaxDetailBase):
    """Tax detail response"""
    tax_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class TaxDetailList(BaseModel):
    """Paginated tax list"""
    items: list[TaxDetailResponse]
    total: int
```

**Status:** TODO  
**Estimated Time:** 1 hour

---

### 2.2.4 Category Schemas (`schemas/category.py`)

**File:** `src/backend/app/schemas/category.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from .tax import TaxDetailResponse

class ProductCategoryBase(BaseModel):
    """Base category information"""
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    description: str | None = Field(None, max_length=500, description="Category description")
    tax_id: UUID | None = Field(None, description="Associated tax detail")

class ProductCategoryCreate(ProductCategoryBase):
    """Create category request"""
    pass

class ProductCategoryUpdate(BaseModel):
    """Update category request"""
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    tax_id: UUID | None = Field(None)

class ProductCategoryResponse(ProductCategoryBase):
    """Category response"""
    category_id: UUID
    created_at: datetime
    tax: TaxDetailResponse | None = None
    
    class Config:
        from_attributes = True

class ProductCategoryList(BaseModel):
    """Paginated category list"""
    items: list[ProductCategoryResponse]
    total: int
```

**Status:** TODO  
**Estimated Time:** 1 hour

---

### 2.2.5 Product Schemas (`schemas/product.py`)

**File:** `src/backend/app/schemas/product.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from .category import ProductCategoryResponse

class ProductBase(BaseModel):
    """Base product information"""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: str | None = Field(None, max_length=1000, description="Product description")
    sku: str = Field(..., min_length=1, max_length=100, description="Stock Keeping Unit")
    category_id: UUID | None = Field(None, description="Product category")

class ProductCreate(ProductBase):
    """Create product request"""
    store_id: UUID = Field(..., description="Store ID")

class ProductUpdate(BaseModel):
    """Update product request"""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    category_id: UUID | None = Field(None)

class ProductResponse(ProductBase):
    """Product response"""
    product_id: UUID
    store_id: UUID
    created_at: datetime
    updated_at: datetime
    category: ProductCategoryResponse | None = None
    
    class Config:
        from_attributes = True

class ProductWithBatches(ProductResponse):
    """Product with batch information"""
    total_stock: int = Field(..., description="Total stock across all batches")
    average_cost: float | None = None
    average_sale_price: float | None = None

class ProductList(BaseModel):
    """Paginated product list"""
    items: list[ProductResponse]
    total: int
    skip: int
    limit: int

class BulkProductCreate(BaseModel):
    """Bulk product import"""
    store_id: UUID
    products: list[ProductCreate]
```

**Status:** TODO  
**Estimated Time:** 1.5 hours

---

### 2.2.6 Warehouse Schemas (`schemas/warehouse.py`)

**File:** `src/backend/app/schemas/warehouse.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class WarehouseBase(BaseModel):
    """Base warehouse information"""
    name: str = Field(..., min_length=1, max_length=255, description="Warehouse name")
    location: str | None = Field(None, max_length=500, description="Physical location")
    store_id: UUID = Field(..., description="Store ID")

class WarehouseCreate(WarehouseBase):
    """Create warehouse request"""
    pass

class WarehouseUpdate(BaseModel):
    """Update warehouse request"""
    name: str | None = Field(None, min_length=1, max_length=255)
    location: str | None = Field(None, max_length=500)

class WarehouseResponse(WarehouseBase):
    """Warehouse response"""
    warehouse_id: UUID
    created_at: datetime
    total_items: int = Field(..., description="Total items in warehouse")
    
    class Config:
        from_attributes = True

class WarehouseList(BaseModel):
    """Paginated warehouse list"""
    items: list[WarehouseResponse]
    total: int
```

**Status:** TODO  
**Estimated Time:** 1 hour

---

### 2.2.7 Batch Schemas (`schemas/batch.py`)

**File:** `src/backend/app/schemas/batch.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from .product import ProductResponse

class BatchBase(BaseModel):
    """Base batch information"""
    product_id: UUID = Field(..., description="Product ID")
    warehouse_id: UUID = Field(..., description="Warehouse ID")
    stock: int = Field(..., ge=0, description="Current stock quantity")
    cost: Decimal = Field(..., gt=0, decimal_places=2, description="Cost per unit")
    sale_price: Decimal = Field(..., gt=0, decimal_places=2, description="Sale price per unit")
    supplier_name: str | None = Field(None, max_length=255, description="Supplier name")
    expire_date: datetime | None = Field(None, description="Expiration date")

class BatchCreate(BatchBase):
    """Create batch request"""
    import_date: datetime | None = Field(None, description="Import date")

class BatchUpdate(BaseModel):
    """Update batch request"""
    stock: int | None = Field(None, ge=0)
    cost: Decimal | None = Field(None, gt=0, decimal_places=2)
    sale_price: Decimal | None = Field(None, gt=0, decimal_places=2)
    supplier_name: str | None = Field(None, max_length=255)
    expire_date: datetime | None = Field(None)

class BatchResponse(BatchBase):
    """Batch response"""
    batch_id: UUID
    import_date: datetime
    created_at: datetime
    updated_at: datetime
    profit_margin: Decimal = Field(..., description="Sale price - cost")
    profit_margin_percent: Decimal = Field(..., description="Profit margin percentage")
    
    class Config:
        from_attributes = True

class BatchWithProduct(BatchResponse):
    """Batch with product details"""
    product: ProductResponse

class BatchList(BaseModel):
    """Paginated batch list"""
    items: list[BatchResponse]
    total: int

class ExpiringBatch(BatchResponse):
    """Batch information for expiring items"""
    days_to_expire: int = Field(..., description="Days until expiration")
    urgency: str = Field(..., description="expired, urgent, soon, or normal")

class LowStockBatch(BatchResponse):
    """Batch information for low stock items"""
    stock_level: str = Field(..., description="low, critical, or warning")
    reorder_quantity: int = Field(..., description="Suggested reorder quantity")
```

**Status:** TODO  
**Estimated Time:** 1.5 hours

---

## Implementation Order

### Week 2 - Phase 2.2 Implementation Schedule

**Day 1: Base Schemas**
- [ ] Create `schemas/base.py` with base classes
- [ ] Create `schemas/__init__.py` with imports
- **Time:** 30 minutes

**Day 1-2: Tax & Category Schemas**
- [ ] Create `schemas/tax.py`
- [ ] Create `schemas/category.py`
- [ ] Test schemas with Pydantic
- **Time:** 2 hours

**Day 2: Store & Product Schemas**
- [ ] Create `schemas/store.py`
- [ ] Create `schemas/product.py`
- [ ] Add validation examples
- **Time:** 2 hours

**Day 3: Warehouse & Batch Schemas**
- [ ] Create `schemas/warehouse.py`
- [ ] Create `schemas/batch.py`
- [ ] Add complex field calculations
- **Time:** 2 hours

**Day 3-4: Integration & Testing**
- [ ] Integration test all schemas
- [ ] Test nested relationships
- [ ] Validate error responses
- [ ] Documentation
- **Time:** 2 hours

---

## Pydantic Configuration Best Practices

### Config Class Settings

```python
class Config:
    # Enable ORM mode - convert SQLAlchemy models to Pydantic
    from_attributes = True
    
    # JSON schema generation
    json_schema_extra = {
        "example": {
            "name": "Example Name",
            "created_at": "2025-01-01T00:00:00Z"
        }
    }
    
    # Validation
    validate_assignment = True
    validate_default = True
    
    # Serialization
    populate_by_name = True
```

---

## Validation Rules Summary

| Field Type | Rules | Example |
|-----------|-------|---------|
| **String fields** | min_length, max_length, regex | `name: str = Field(..., min_length=1, max_length=255)` |
| **Decimal (Money)** | ge=0, decimal_places=2 | `price: Decimal = Field(..., gt=0, decimal_places=2)` |
| **Integer (Stock)** | ge=0, le=max_value | `stock: int = Field(..., ge=0)` |
| **Dates** | datetime, optional | `expire_date: datetime \| None = None` |
| **UUIDs** | UUID type | `product_id: UUID` |
| **Phone** | regex pattern | `phone: str = Field(..., regex=r"^\+?1?\d{9,15}$")` |
| **Email** | regex pattern | `email: str = Field(..., regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")` |
| **Percentages** | 0-100, decimal | `tax_rate: Decimal = Field(..., ge=0, le=100)` |

---

## Error Response Schemas

### Standard Error Response

```python
class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str
    status_code: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    path: str | None = None

class ValidationError(BaseModel):
    """Validation error response"""
    detail: list[dict]  # Pydantic error details
    status_code: int = 422
```

---

## Testing Schemas

### Example Tests

```python
# tests/test_schemas.py
import pytest
from app.schemas import ProductCreate, ProductResponse
from decimal import Decimal
import uuid

def test_product_create_valid():
    """Test valid product creation"""
    data = {
        "name": "Test Product",
        "sku": "TEST001",
        "store_id": str(uuid.uuid4()),
    }
    schema = ProductCreate(**data)
    assert schema.name == "Test Product"

def test_product_create_invalid_sku():
    """Test invalid SKU"""
    data = {
        "name": "Test",
        "sku": "",  # Empty SKU
        "store_id": str(uuid.uuid4()),
    }
    with pytest.raises(ValueError):
        ProductCreate(**data)

def test_batch_response_calculations():
    """Test batch response calculated fields"""
    batch = {
        "batch_id": uuid.uuid4(),
        "product_id": uuid.uuid4(),
        "warehouse_id": uuid.uuid4(),
        "stock": 100,
        "cost": Decimal("10.00"),
        "sale_price": Decimal("15.00"),
        "import_date": datetime.now(),
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "supplier_name": "Supplier A",
        "expire_date": None,
    }
    schema = BatchResponse(**batch)
    assert schema.profit_margin == Decimal("5.00")
    assert schema.profit_margin_percent == Decimal("50.00")
```

---

## Integration with FastAPI

### Using Schemas in Endpoints

```python
# routes/products.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.api.deps import SessionDep
import uuid

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate,
    session: SessionDep
):
    """Create a new product"""
    # Check if product with same SKU exists
    if crud.get_product_by_sku(session, product.sku):
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    return crud.create_product(session, product)

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: uuid.UUID, session: SessionDep):
    """Get product by ID"""
    product = crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: uuid.UUID,
    product_update: schemas.ProductUpdate,
    session: SessionDep
):
    """Update product"""
    product = crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return crud.update_product(session, product_id, product_update)

@router.get("/", response_model=schemas.ProductList)
def list_products(
    skip: int = 0,
    limit: int = 100,
    store_id: uuid.UUID | None = None,
    session: SessionDep = None
):
    """List products with pagination"""
    products = crud.get_products(session, skip=skip, limit=limit, store_id=store_id)
    total = crud.count_products(session, store_id=store_id)
    
    return schemas.ProductList(
        items=products,
        total=total,
        skip=skip,
        limit=limit
    )
```

---

## Next Phase Dependencies

### Phase 2.3 - CRUD Operations Requires:
- ✅ All schemas defined
- Product CRUD operations
- Warehouse CRUD operations
- Batch CRUD operations

### Phase 2.4 - API Endpoints Requires:
- ✅ All schemas defined
- ✅ CRUD operations implemented
- Route setup
- Error handling
- Pagination utilities

---

## Success Criteria

- [ ] All 11 schema files created
- [ ] All validation rules implemented correctly
- [ ] All nested relationships properly configured
- [ ] All calculated fields working
- [ ] Pydantic validation tests passing
- [ ] Schema examples in docstrings
- [ ] Integration with FastAPI working
- [ ] Error handling configured
- [ ] Documentation complete

---

## Estimated Timeline

| Task | Time | Days |
|------|------|------|
| Base schemas | 30 min | 0.5 |
| Tax & Category | 2 hours | 0.5 |
| Store & Product | 2 hours | 0.5 |
| Warehouse & Batch | 2 hours | 0.5 |
| Testing & Integration | 2 hours | 0.5 |
| Documentation | 1 hour | 0.5 |
| **Total** | **9.5 hours** | **3 days** |

---

**Phase Status:** TODO  
**Estimated Start:** Week 2, Day 1  
**Estimated Completion:** Week 2, Day 3  
**Next Phase:** 2.3 CRUD Operations