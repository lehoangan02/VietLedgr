# VietLedgr Pydantic Schemas Guide

## Overview

This document describes the Pydantic schema implementations for the VietLedgr API. These schemas define the request/response contracts for all API endpoints, providing automatic validation, serialization, and documentation.

**Version:** 1.0  
**Date:** November 14, 2025  
**Pydantic Version:** 2.x

---

## Table of Contents

1. [Schema Architecture](#schema-architecture)
2. [Schema Patterns](#schema-patterns)
3. [Validation Rules](#validation-rules)
4. [Store Schemas](#store-schemas)
5. [Tax Schemas](#tax-schemas)
6. [Category Schemas](#category-schemas)
7. [Product Schemas](#product-schemas)
8. [Warehouse Schemas](#warehouse-schemas)
9. [Batch Schemas](#batch-schemas)
10. [Usage Examples](#usage-examples)
11. [Testing](#testing)

---

## Schema Architecture

### Design Philosophy

The schema layer follows these principles:

1. **Separation of Concerns**: Schemas are separate from database models
2. **Type Safety**: Full type hints with strict validation
3. **Reusability**: Base classes shared across related schemas
4. **Clarity**: Explicit naming (Create, Update, Response)
5. **Documentation**: Field descriptions for auto-generated API docs

### Schema Hierarchy

```
BaseModel (Pydantic)
    ↓
SchemaBase (e.g., ProductBase)
    ↓
├── SchemaCreate (for POST requests)
├── SchemaUpdate (for PUT/PATCH requests)
└── SchemaResponse (for API responses)
```

### Directory Structure

```
src/backend/app/schemas/
├── __init__.py          # Export all schemas
├── base.py              # Base classes and utilities
├── store.py             # Store schemas
├── tax.py               # Tax detail schemas
├── category.py          # Product category schemas
├── product.py           # Product schemas
├── warehouse.py         # Warehouse schemas
└── batch.py             # Batch/inventory schemas
```

---

## Schema Patterns

### 1. Base Schema Pattern

**Purpose:** Define common fields shared across Create, Update, and Response schemas.

```python
class ProductBase(BaseModel):
    """Base product information - shared fields"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    sku: str = Field(..., min_length=1, max_length=100)
    category_id: UUID | None = None
```

**Use Case:** Reduces duplication, ensures consistency

---

### 2. Create Schema Pattern

**Purpose:** Define required fields for resource creation (POST requests).

```python
class ProductCreate(ProductBase):
    """Create product request"""
    store_id: UUID = Field(..., description="Store ID")
```

**Use Case:**
- POST `/api/products/` endpoint
- Validates all required fields for new products
- Inherits validation from ProductBase

**Example Request:**
```json
{
  "name": "Coca Cola 330ml",
  "sku": "COKE-330",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

### 3. Update Schema Pattern

**Purpose:** Define optional fields for partial updates (PUT/PATCH requests).

```python
class ProductUpdate(BaseModel):
    """Update product request - all fields optional"""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    category_id: UUID | None = None
```

**Use Case:**
- PUT/PATCH `/api/products/{id}` endpoint
- All fields optional for partial updates
- Still validates values if provided

**Example Request:**
```json
{
  "name": "Coca Cola 330ml Can",
  "description": "Updated description"
}
```

---

### 4. Response Schema Pattern

**Purpose:** Define fields returned in API responses (GET requests).

```python
class ProductResponse(ProductBase):
    """Product response"""
    product_id: UUID
    store_id: UUID
    created_at: datetime
    updated_at: datetime
    category: ProductCategoryResponse | None = None
    
    model_config = ConfigDict(from_attributes=True)
```

**Use Case:**
- GET `/api/products/{id}` endpoint
- Automatic serialization from SQLAlchemy models
- Includes computed/relationship fields
- `from_attributes=True` enables ORM object conversion

**Example Response:**
```json
{
  "product_id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "Coca Cola 330ml",
  "sku": "COKE-330",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z",
  "category": {
    "category_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Beverages",
    "created_at": "2025-11-01T08:00:00Z"
  }
}
```

---

### 5. List/Pagination Schema Pattern

**Purpose:** Wrap collections with pagination metadata.

```python
class ProductList(BaseModel):
    """Paginated product list"""
    items: list[ProductResponse]
    total: int
    skip: int
    limit: int
```

**Use Case:**
- GET `/api/products/?skip=0&limit=20` endpoint
- Provides pagination info for client
- Standard across all list endpoints

**Example Response:**
```json
{
  "items": [
    { "product_id": "...", "name": "Product 1", ... },
    { "product_id": "...", "name": "Product 2", ... }
  ],
  "total": 150,
  "skip": 0,
  "limit": 20
}
```

---

## Validation Rules

### Field Constraints

| Constraint | Purpose | Example |
|------------|---------|---------|
| `min_length` | Minimum string length | `Field(..., min_length=1)` |
| `max_length` | Maximum string length | `Field(..., max_length=255)` |
| `pattern` | Regex validation | `Field(..., pattern=r"^\+?1?\d{9,15}$")` |
| `ge` | Greater than or equal | `Field(..., ge=0)` |
| `le` | Less than or equal | `Field(..., le=100)` |
| `gt` | Greater than | `Field(..., gt=0)` |
| `lt` | Less than | `Field(..., lt=1000)` |
| `decimal_places` | Decimal precision | `Field(..., decimal_places=2)` |

### Common Validation Patterns

**1. Required Non-Empty String:**
```python
name: str = Field(..., min_length=1, max_length=255)
```

**2. Optional String with Max Length:**
```python
description: str | None = Field(None, max_length=500)
```

**3. Phone Number Validation:**
```python
phone: str | None = Field(None, pattern=r"^\+?1?\d{9,15}$")
```

**4. Email Validation:**
```python
email: str | None = Field(None, pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
```

**5. Percentage (0-100):**
```python
tax_rate: Decimal = Field(..., ge=0, le=100, decimal_places=2)
```

**6. Positive Integer:**
```python
stock: int = Field(..., ge=0)
```

**7. Positive Decimal:**
```python
cost: Decimal = Field(..., gt=0, decimal_places=2)
```

---

## Store Schemas

### Purpose
Manage store/branch information.

### Schemas

#### StoreBase
```python
class StoreBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    address: str | None = Field(None, max_length=500)
    phone: str | None = Field(None, pattern=r"^\+?1?\d{9,15}$")
    email: str | None = Field(None, pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
```

#### StoreCreate
```python
class StoreCreate(StoreBase):
    """POST /api/stores/"""
    pass
```

#### StoreUpdate
```python
class StoreUpdate(BaseModel):
    """PUT /api/stores/{id}"""
    name: str | None = Field(None, min_length=1, max_length=255)
    address: str | None = Field(None, max_length=500)
    phone: str | None = Field(None, max_length=20)
    email: str | None = None
```

#### StoreResponse
```python
class StoreResponse(StoreBase):
    """GET /api/stores/{id}"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
```

### Use Cases

**1. Create New Store:**
```python
# POST /api/stores/
store_data = StoreCreate(
    name="Downtown Branch",
    address="123 Main St, HCMC",
    phone="+84901234567",
    email="downtown@store.com"
)
```

**2. Update Store Info:**
```python
# PUT /api/stores/{id}
update_data = StoreUpdate(
    phone="+84907654321",
    email="newemail@store.com"
)
```

**3. Get Store Details:**
```python
# GET /api/stores/{id}
# Returns StoreResponse with all fields
```

---

## Tax Schemas

### Purpose
Manage tax rates and information.

### Schemas

#### TaxDetailBase
```python
class TaxDetailBase(BaseModel):
    tax_name: str = Field(..., min_length=1, max_length=100)
    tax_rate: Decimal = Field(..., ge=0, le=100, decimal_places=2)
    tax_description: str | None = Field(None, max_length=500)
```

**Validation:**
- Tax rate must be 0-100 (percentage)
- Decimal with 2 decimal places (e.g., 10.50)

### Use Cases

**1. Create VAT Rate:**
```python
vat = TaxDetailCreate(
    tax_name="VAT Standard",
    tax_rate=Decimal("10.00"),
    tax_description="Standard VAT rate for most goods"
)
```

**2. Create Zero-Rated Tax:**
```python
no_tax = TaxDetailCreate(
    tax_name="Tax Exempt",
    tax_rate=Decimal("0.00"),
    tax_description="For tax-exempt items"
)
```

---

## Category Schemas

### Purpose
Manage product categories with optional tax associations.

### Schemas

#### ProductCategoryBase
```python
class ProductCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    tax_id: UUID | None = None
```

#### ProductCategoryResponse
```python
class ProductCategoryResponse(ProductCategoryBase):
    category_id: UUID
    created_at: datetime
    tax: TaxDetailResponse | None = None  # Nested tax details
    
    model_config = ConfigDict(from_attributes=True)
```

### Use Cases

**1. Create Category with Tax:**
```python
category = ProductCategoryCreate(
    name="Beverages",
    description="All drink products",
    tax_id="tax-uuid-here"
)
```

**2. Nested Response:**
```json
{
  "category_id": "...",
  "name": "Beverages",
  "tax_id": "...",
  "tax": {
    "tax_id": "...",
    "tax_name": "VAT Standard",
    "tax_rate": 10.00
  }
}
```

---

## Product Schemas

### Purpose
Manage product master data.

### Schemas

#### ProductBase
```python
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    sku: str = Field(..., min_length=1, max_length=100)
    category_id: UUID | None = None
```

**Key Fields:**
- `sku`: Stock Keeping Unit (must be unique in database)
- `category_id`: Optional link to category

#### ProductResponse
```python
class ProductResponse(ProductBase):
    product_id: UUID
    store_id: UUID
    created_at: datetime
    updated_at: datetime
    category: ProductCategoryResponse | None = None
```

**Features:**
- Includes nested category with tax information
- Timestamps for audit trail

### Use Cases

**1. Create Product with Category:**
```python
product = ProductCreate(
    name="Coca Cola 330ml",
    sku="COKE-330",
    description="Classic Coca Cola Can",
    store_id="store-uuid",
    category_id="beverage-category-uuid"
)
```

**2. Find by SKU:**
```python
# GET /api/products/sku/COKE-330
# Returns ProductResponse
```

**3. List Products with Filtering:**
```python
# GET /api/products/?category_id=xxx&skip=0&limit=20
# Returns ProductList
```

---

## Warehouse Schemas

### Purpose
Manage storage locations within stores.

### Schemas

#### WarehouseBase
```python
class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str | None = Field(None, max_length=500)
    store_id: UUID
```

#### WarehouseResponse
```python
class WarehouseResponse(WarehouseBase):
    warehouse_id: UUID
    created_at: datetime
    total_items: int = Field(..., description="Total items in warehouse")
```

**Note:** `total_items` is typically calculated from batch stock totals.

### Use Cases

**1. Create Warehouse:**
```python
warehouse = WarehouseCreate(
    name="Main Storage",
    location="Building A, Floor 2",
    store_id="store-uuid"
)
```

**2. Get Warehouse Info:**
```json
{
  "warehouse_id": "...",
  "name": "Main Storage",
  "store_id": "...",
  "total_items": 5432,
  "created_at": "2025-11-01T08:00:00Z"
}
```

---

## Batch Schemas

### Purpose
Manage inventory batches/lots with cost and pricing.

### Schemas

#### BatchBase
```python
class BatchBase(BaseModel):
    product_id: UUID
    warehouse_id: UUID
    stock: int = Field(..., ge=0)
    cost: Decimal = Field(..., gt=0, decimal_places=2)
    sale_price: Decimal = Field(..., gt=0, decimal_places=2)
    supplier_name: str | None = Field(None, max_length=255)
    expire_date: datetime | None = None
```

**Validation:**
- Stock must be >= 0 (cannot be negative)
- Cost and sale_price must be > 0
- Both prices have 2 decimal places

#### BatchResponse (with Computed Fields)
```python
class BatchResponse(BatchBase):
    batch_id: UUID
    import_date: datetime
    created_at: datetime
    updated_at: datetime
    
    @computed_field
    @property
    def profit_margin(self) -> Decimal:
        """Calculate profit margin (sale_price - cost)"""
        return (self.sale_price - self.cost).quantize(Decimal("0.01"))
    
    @computed_field
    @property
    def profit_margin_percent(self) -> Decimal:
        """Calculate profit margin percentage"""
        if self.cost == 0:
            return Decimal("0.00")
        return ((self.sale_price - self.cost) / self.cost * 100).quantize(Decimal("0.01"))
```

**Computed Fields:**
- `profit_margin`: Absolute profit per unit
- `profit_margin_percent`: Percentage profit margin

### Special Schemas

#### ExpiringBatch
```python
class ExpiringBatch(BatchResponse):
    days_to_expire: int
    urgency: str  # "expired", "urgent", "soon", "normal"
```

**Use Case:** Alert system for perishable inventory

#### LowStockBatch
```python
class LowStockBatch(BatchResponse):
    stock_level: str  # "critical", "low", "warning"
    reorder_quantity: int
```

**Use Case:** Reorder alerts and inventory planning

### Use Cases

**1. Create Batch:**
```python
batch = BatchCreate(
    product_id="product-uuid",
    warehouse_id="warehouse-uuid",
    stock=100,
    cost=Decimal("10.00"),
    sale_price=Decimal("15.00"),
    supplier_name="Coca Cola Co",
    expire_date=datetime(2026, 12, 31),
    import_date=datetime.now()
)
```

**2. Get Batch with Profit:**
```json
{
  "batch_id": "...",
  "product_id": "...",
  "stock": 100,
  "cost": 10.00,
  "sale_price": 15.00,
  "profit_margin": 5.00,
  "profit_margin_percent": 50.00,
  "expire_date": "2026-12-31T00:00:00Z"
}
```

**3. Find Expiring Batches:**
```python
# GET /api/batches/expiring?days=30
# Returns list[ExpiringBatch]
```

---

## Usage Examples

### In FastAPI Endpoints

#### Create Resource
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import product
from app.crud import product as crud_product
from app.api.deps import get_db

router = APIRouter()

@router.post("/products/", response_model=product.ProductResponse)
def create_product(
    product_data: product.ProductCreate,
    db: Session = Depends(get_db)
):
    """Create new product"""
    return crud_product.create_product(db, product_data)
```

#### Update Resource
```python
@router.put("/products/{product_id}", response_model=product.ProductResponse)
def update_product(
    product_id: UUID,
    product_data: product.ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update product"""
    return crud_product.update_product(db, product_id, product_data)
```

#### List Resources
```python
@router.get("/products/", response_model=product.ProductList)
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List products with pagination"""
    items = crud_product.get_products(db, skip=skip, limit=limit)
    total = crud_product.count_products(db)
    return product.ProductList(items=items, total=total, skip=skip, limit=limit)
```

### In CRUD Operations

#### Create with Schema Validation
```python
from app import models, schemas

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    """Create product - schema already validated"""
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product  # Auto-converts to ProductResponse
```

#### Update with Partial Data
```python
def update_product(
    db: Session, 
    product_id: UUID, 
    product: schemas.ProductUpdate
) -> models.Product:
    """Update product with partial data"""
    db_product = get_product(db, product_id)
    if db_product:
        # Only update provided fields
        update_data = product.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db.commit()
        db.refresh(db_product)
    return db_product
```

---

## Testing

### Test Coverage

All schemas have comprehensive test coverage (50 tests total):

- **Store Tests (10)**: Valid/invalid creation, updates, pagination
- **Tax Tests (6)**: Rate validation (0-100), edge cases
- **Category Tests (5)**: Creation, tax relationships, validation
- **Product Tests (9)**: SKU validation, category nesting, lists
- **Warehouse Tests (6)**: Creation, validation, totals
- **Batch Tests (14)**: Stock/price constraints, profit calculations, expiring/low stock
- **Integration Tests (2)**: Nested relationships, data consistency

### Test Examples

#### Valid Creation Test
```python
def test_product_create_valid():
    data = {
        "name": "Coca Cola",
        "sku": "COKE-001",
        "store_id": uuid4(),
        "category_id": uuid4()
    }
    product_obj = product.ProductCreate(**data)
    assert product_obj.name == "Coca Cola"
    assert product_obj.sku == "COKE-001"
```

#### Validation Error Test
```python
def test_product_invalid_name_empty():
    with pytest.raises(ValidationError):
        product.ProductCreate(
            name="",  # Empty name should fail
            sku="TEST",
            store_id=uuid4()
        )
```

#### Computed Field Test
```python
def test_batch_profit_calculations():
    data = {
        "batch_id": uuid4(),
        "product_id": uuid4(),
        "warehouse_id": uuid4(),
        "stock": 100,
        "cost": Decimal("10.00"),
        "sale_price": Decimal("15.00"),
        "import_date": datetime.now(),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    batch_obj = batch.BatchResponse(**data)
    assert batch_obj.profit_margin == Decimal("5.00")
    assert batch_obj.profit_margin_percent == Decimal("50.00")
```

---

## Best Practices

### 1. Schema Design
- Keep Base schemas DRY (Don't Repeat Yourself)
- Use explicit naming (Create, Update, Response)
- Document all fields with descriptions
- Use type hints consistently

### 2. Validation
- Validate at schema level, not in CRUD
- Use field constraints for business rules
- Provide clear error messages
- Test edge cases thoroughly

### 3. Performance
- Use `model_dump(exclude_unset=True)` for partial updates
- Avoid deep nesting (max 2-3 levels)
- Use `defer()` for expensive computed fields if needed
- Consider pagination for all list endpoints

### 4. Maintenance
- Keep schemas in sync with database models
- Update tests when adding new fields
- Document breaking changes
- Version API if schema changes significantly

---

## Future Enhancements

### Planned Features

1. **Transaction Schemas**: Complete transaction with line items
2. **Expense Schemas**: Business expense tracking
3. **Ledger Schemas**: Accounting entry schemas
4. **User Role Schemas**: Role-based access schemas
5. **Report Schemas**: Financial and inventory reports
6. **Bulk Operations**: Bulk create/update schemas

### Schema Evolution

When adding new schemas:
1. Create Base, Create, Update, Response variants
2. Add field validation with constraints
3. Write comprehensive tests (minimum 6 per schema)
4. Update this documentation
5. Update API documentation

---

## Conclusion

The Pydantic schema layer provides:

✅ **Type Safety**: Automatic validation and type checking  
✅ **Documentation**: Self-documenting API contracts  
✅ **Consistency**: Standardized patterns across all endpoints  
✅ **Reliability**: Comprehensive test coverage  
✅ **Maintainability**: Clear separation from database models  

**Next Steps:**
1. Implement CRUD operations using these schemas
2. Build API endpoints with automatic validation
3. Generate OpenAPI documentation from schemas
4. Extend schemas for transaction and accounting features

---

## References

- **Pydantic Documentation**: https://docs.pydantic.dev/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Schema Files**: `src/backend/app/schemas/`
- **Test Files**: `src/backend/tests/test_schemas.py`
- **Implementation Plan**: `docs/database-implementation-plan.md`
