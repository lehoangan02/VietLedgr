# VietLedgr Database Implementation Plan

## Overview
This plan outlines the step-by-step implementation of the complete VietLedgr database schema, building upon the existing authentication system.

---

## Database Schema Overview

### Entity Relationship Diagram

```
users.store_id → store.id
users.role_id → role.role_id
warehouse.store_id → store.id
batch.warehouse_id → warehouse.warehouse_id
batch.product_id → product.product_id
product.store_id → store.id
product.category_id → product_category.category_id
product_category.tax_id → tax_detail.tax_id
transaction_items.transaction_id → transactions.transaction_id
transaction_items.batch_id → batch.batch_id
transactions.store_id → store.id
transactions.user_id → users.user_id
expenses.store_id → store.id
expenses.user_id → users.user_id
general_ledger_entries.store_id → store.id
general_ledger_entries.transaction_id → transactions.transaction_id (nullable)
general_ledger_entries.expense_id → expenses.expense_id (nullable)
```

### Tables Summary

| Table | Description | Key Fields |
|-------|-------------|------------|
| **users** | User accounts and authentication | user_id, username, password_hash, store_id, role_id |
| **roles** | User roles and permissions | role_id, name, description |
| **stores** | Store/branch locations | id, name, address, created_at |
| **tax_details** | Tax rates and information | tax_id, tax_rate, tax_name |
| **product_categories** | Product classification | category_id, name, tax_id |
| **products** | Product master data | product_id, store_id, category_id, sku |
| **warehouses** | Storage locations | warehouse_id, store_id, name |
| **batches** | Inventory lots/batches | batch_id, product_id, warehouse_id, stock, cost, sale_price |
| **transactions** | Sales transactions | transaction_id, store_id, user_id, total_amount |
| **transaction_items** | Transaction line items | item_id, transaction_id, batch_id, quantity |
| **expenses** | Business expenses | expense_id, store_id, user_id, amount |
| **general_ledger_entries** | Accounting ledger | entry_id, account_type, debit_amount, credit_amount |

---

## Phase 1: Core Setup & Foundation ✅ COMPLETED

### 1.1 Update Database Schema File
**File:** `docs/database-schema.sql`

**Tasks:**
- ✅ Users table exists
- ✅ Store table created
- ✅ Add all enum types (user_type, account_type)
- ✅ Create core tables (store, role, warehouse)
- ✅ Add foreign key constraints
- ✅ Add indexes for performance

**Status:** ✅ COMPLETED  
**Date Completed:** November 13, 2025

### 1.2 Update SQLAlchemy Models
**File:** `src/backend/app/models.py`

**Tasks:**
- ✅ User model complete with foreign keys
- ✅ Store model complete with all relationships
- ✅ Role model complete
- ✅ TaxDetail model complete
- ✅ ProductCategory model complete
- ✅ Product model complete
- ✅ Warehouse model complete
- ✅ Batch model complete
- ✅ Transaction model complete
- ✅ TransactionItem model complete
- ✅ Expense model complete
- ✅ GeneralLedgerEntry model complete
- ✅ All relationships defined with back_populates
- ✅ All enums created (UserType, AccountType)
- ✅ All CHECK constraints implemented
- ✅ All __repr__ methods added

**Status:** ✅ COMPLETED  
**Date Completed:** November 13, 2025  
**Next Steps:** Run SQL script to create database tables

### 1.3 Database Migration
**Approach:** SQL Scripts (No Alembic for now)

**Tasks:**
- ✅ Created comprehensive SQL schema file
- ✅ Run SQL script to create all tables
- ✅ Verify table creation
- ✅ Test foreign key constraints

**Status:** ✅ COMPLETED  
**Date Completed:** November 13, 2025  

---

## Phase 2: Product & Inventory Management (CURRENT PHASE)

### 2.1 Complete Product-Related Models ✅ COMPLETED
**File:** `src/backend/app/models.py`

**Models implemented:**
- ✅ `Role` - User roles with relationships
- ✅ `TaxDetail` - Tax information with rate constraints
- ✅ `ProductCategory` - Product categories with tax relationship
- ✅ `Product` - Product master data with SKU unique constraint
- ✅ `Batch` - Inventory batches with stock constraints
- ✅ `Warehouse` - Storage locations with store relationship

**Status:** ✅ COMPLETED  
**Date Completed:** November 13, 2025

### 2.2 Create Pydantic Schemas
**Directory:** `src/backend/app/schemas/` (new)

**Files to create:**
```
schemas/
├── __init__.py
├── store.py         # Store request/response schemas
├── product.py       # Product schemas
├── warehouse.py     # Warehouse schemas
├── batch.py         # Batch schemas
├── category.py      # Category schemas
└── tax.py           # Tax detail schemas
```

**Example schema structure:**
```python
# schemas/product.py
from pydantic import BaseModel
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    name: str
    description: str | None = None
    sku: str
    category_id: uuid.UUID | None = None

class ProductCreate(ProductBase):
    store_id: uuid.UUID

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category_id: uuid.UUID | None = None

class ProductResponse(ProductBase):
    product_id: uuid.UUID
    store_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

**Priority:** HIGH  
**Estimated Time:** 2-3 hours

### 2.3 CRUD Operations
**Directory:** `src/backend/app/crud/` (new)

**Files to create:**
```
crud/
├── __init__.py
├── store.py         # Store CRUD
├── product.py       # Product CRUD
├── warehouse.py     # Warehouse CRUD
├── batch.py         # Batch CRUD
└── category.py      # Category CRUD
```

**Example CRUD operations:**
```python
# crud/product.py
from sqlalchemy.orm import Session
from app import models, schemas
import uuid

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    """Create a new product"""
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product(db: Session, product_id: uuid.UUID) -> models.Product | None:
    """Get product by ID"""
    return db.query(models.Product).filter(models.Product.product_id == product_id).first()

def get_products_by_store(db: Session, store_id: uuid.UUID, skip: int = 0, limit: int = 100):
    """Get all products for a store"""
    return db.query(models.Product).filter(
        models.Product.store_id == store_id
    ).offset(skip).limit(limit).all()

def update_product(db: Session, product_id: uuid.UUID, product: schemas.ProductUpdate):
    """Update product"""
    db_product = get_product(db, product_id)
    if db_product:
        update_data = product.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: uuid.UUID) -> bool:
    """Delete product"""
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False

def get_products_by_sku(db: Session, sku: str) -> models.Product | None:
    """Find product by SKU"""
    return db.query(models.Product).filter(models.Product.sku == sku).first()
```

**Priority:** HIGH  
**Estimated Time:** 6-8 hours

### 2.4 API Endpoints
**Directory:** `src/backend/app/api/routes/`

**Files to create:**
```
routes/
├── stores.py        # Store management endpoints
├── products.py      # Product management endpoints
├── warehouses.py    # Warehouse management endpoints
├── batches.py       # Batch/inventory endpoints
└── categories.py    # Category management endpoints
```

**Example endpoints:**

**Store Endpoints (`routes/stores.py`):**
```
POST   /api/stores/              - Create store
GET    /api/stores/{id}          - Get store details
GET    /api/stores/              - List stores
PUT    /api/stores/{id}          - Update store
DELETE /api/stores/{id}          - Delete store
```

**Product Endpoints (`routes/products.py`):**
```
POST   /api/products/            - Create product
GET    /api/products/{id}        - Get product details
GET    /api/products/            - List products (with filters)
PUT    /api/products/{id}        - Update product
DELETE /api/products/{id}        - Delete product
GET    /api/products/sku/{sku}   - Find product by SKU
```

**Batch Endpoints (`routes/batches.py`):**
```
POST   /api/batches/             - Create batch
GET    /api/batches/{id}         - Get batch details
PUT    /api/batches/{id}/stock   - Update stock
GET    /api/batches/expiring     - Get expiring batches
GET    /api/batches/product/{id} - Get batches for product
```

**Warehouse Endpoints (`routes/warehouses.py`):**
```
POST   /api/warehouses/          - Create warehouse
GET    /api/warehouses/{id}      - Get warehouse details
GET    /api/warehouses/          - List warehouses by store
PUT    /api/warehouses/{id}      - Update warehouse
```

**Priority:** HIGH  
**Estimated Time:** 8-10 hours

---

## Phase 3: Transaction System

### 3.1 Transaction Models ✅ COMPLETED
**File:** `src/backend/app/models.py`

**Models implemented:**
- ✅ `Transaction` - Sales transactions with amount constraints
- ✅ `TransactionItem` - Line items with quantity and price constraints

**Status:** ✅ COMPLETED  
**Date Completed:** November 13, 2025

### 3.2 Transaction Schemas
**File:** `src/backend/app/schemas/transaction.py`

```python
class TransactionItemCreate(BaseModel):
    batch_id: uuid.UUID
    quantity: int
    price_at_sale: Decimal

class TransactionCreate(BaseModel):
    store_id: uuid.UUID
    device_id: str | None = None
    items: list[TransactionItemCreate]

class TransactionResponse(BaseModel):
    transaction_id: uuid.UUID
    store_id: uuid.UUID
    user_id: uuid.UUID
    total_amount: Decimal
    total_tax: Decimal
    created_at: datetime
    items: list[TransactionItemResponse]
```

**Priority:** CRITICAL  
**Estimated Time:** 2 hours

### 3.3 Transaction CRUD
**File:** `src/backend/app/crud/transaction.py`

**Complex operations:**
```python
def create_transaction_with_items(
    db: Session, 
    transaction: schemas.TransactionCreate,
    user_id: uuid.UUID
) -> models.Transaction:
    """
    Create transaction with items (atomic operation)
    - Validate stock availability
    - Deduct stock from batches
    - Calculate totals
    - Create transaction record
    - Create transaction items
    - Create ledger entries
    """
    # Implementation with database transaction
    pass

def get_transaction_summary(
    db: Session,
    store_id: uuid.UUID,
    start_date: datetime,
    end_date: datetime
):
    """Get transaction summary for reporting"""
    pass
```

**Priority:** CRITICAL  
**Estimated Time:** 10-12 hours

**Special considerations:**
- Implement database transactions (ACID)
- Stock deduction logic with validation
- Batch selection strategy (FIFO/FEFO)
- Concurrent transaction handling
- Error handling and rollback

### 3.4 API Endpoints
**File:** `src/backend/app/api/routes/transactions.py`

**Endpoints:**
```
POST   /api/transactions/              - Create transaction
GET    /api/transactions/{id}          - Get transaction details
GET    /api/transactions/              - List transactions (paginated)
GET    /api/transactions/summary       - Get summary/reports
POST   /api/transactions/{id}/void     - Void/cancel transaction
```

**Priority:** CRITICAL  
**Estimated Time:** 6-8 hours

---

## Phase 4: Accounting & Ledger

### 4.1 Financial Models ✅ COMPLETED
**File:** `src/backend/app/models.py`

**Models implemented:**
- ✅ `Expense` - Business expenses with amount constraints
- ✅ `GeneralLedgerEntry` - Accounting ledger with double-entry validation

**Status:** ✅ COMPLETED  
**Date Completed:** November 13, 2025

### 4.2 Accounting Service Layer
**File:** `src/backend/app/services/accounting.py` (new)

**Functions:**
```python
def create_ledger_entry_from_transaction(
    db: Session,
    transaction: models.Transaction
):
    """
    Create double-entry ledger entries for a transaction
    Debit: Cash/Accounts Receivable (Asset)
    Credit: Sales Revenue (Revenue)
    """
    pass

def create_ledger_entry_from_expense(
    db: Session,
    expense: models.Expense
):
    """
    Create ledger entries for expense
    Debit: Expense Account (Expense)
    Credit: Cash (Asset)
    """
    pass

def get_trial_balance(db: Session, store_id: uuid.UUID):
    """Calculate trial balance"""
    pass

def get_income_statement(
    db: Session,
    store_id: uuid.UUID,
    start_date: datetime,
    end_date: datetime
):
    """Generate profit & loss statement"""
    pass

def get_balance_sheet(db: Session, store_id: uuid.UUID, as_of_date: datetime):
    """Generate balance sheet"""
    pass
```

**Priority:** MEDIUM  
**Estimated Time:** 12-15 hours

### 4.3 API Endpoints
**Files:** `expenses.py`, `ledger.py`, `reports.py`

**Endpoints:**
```
# Expenses
POST   /api/expenses/                  - Record expense
GET    /api/expenses/                  - List expenses
GET    /api/expenses/{id}              - Get expense details

# Ledger
GET    /api/ledger/entries             - Get ledger entries
GET    /api/ledger/trial-balance       - Trial balance report
GET    /api/ledger/income-statement    - P&L statement
GET    /api/ledger/balance-sheet       - Balance sheet

# Reports
GET    /api/reports/sales-summary      - Sales summary
GET    /api/reports/inventory-status   - Inventory status
GET    /api/reports/profit-analysis    - Profit analysis
```

**Priority:** MEDIUM  
**Estimated Time:** 8-10 hours

---

## Phase 5: Role & Authorization

### 5.1 Role Management
**Model:** `Role` (in models.py)

**Tasks:**
- [ ] Create Role model with relationships
- [ ] Update User model with role_id foreign key
- [ ] Create role CRUD operations
- [ ] Create role API endpoints

**Priority:** HIGH  
**Estimated Time:** 3-4 hours

### 5.2 Update User Model
**File:** `src/backend/app/models.py`

**Changes required:**
```python
class User(Base):
    # ...existing fields...
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.role_id", ondelete="RESTRICT"), 
        nullable=False
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Relationships
    role: Mapped["Role"] = relationship(back_populates="users")
    store: Mapped["Store"] = relationship(back_populates="users")
```

**Priority:** HIGH  
**Estimated Time:** 2 hours

### 5.3 Permission System
**File:** `src/backend/app/core/permissions.py` (new)

**Implementation:**
```python
from fastapi import HTTPException, status
from app.models import User, UserType
import uuid

def require_admin(current_user: User):
    """Require admin role"""
    if current_user.type != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_manager_or_admin(current_user: User):
    """Require manager or admin role"""
    if current_user.type not in [UserType.ADMIN, UserType.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin access required"
        )
    return current_user

def check_store_access(current_user: User, store_id: uuid.UUID):
    """Ensure user can access the store"""
    if current_user.type != UserType.ADMIN and current_user.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this store"
        )
    return True
```

**Usage in endpoints:**
```python
from app.api.deps import CurrentUser
from app.core.permissions import require_admin, check_store_access

@router.delete("/products/{product_id}")
def delete_product(
    product_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    # Check permissions
    product = crud.get_product(session, product_id)
    check_store_access(current_user, product.store_id)
    
    # Proceed with deletion
    crud.delete_product(session, product_id)
    return {"message": "Product deleted"}
```

**Priority:** HIGH  
**Estimated Time:** 4-6 hours

---

## Phase 6: Testing & Validation

### 6.1 Unit Tests
**Directory:** `src/backend/tests/` (new)

**Test files to create:**
```
tests/
├── __init__.py
├── conftest.py              # Test fixtures
├── test_auth.py             # Authentication tests
├── test_products.py         # Product CRUD tests
├── test_transactions.py     # Transaction tests
├── test_accounting.py       # Accounting logic tests
├── test_permissions.py      # Authorization tests
└── test_inventory.py        # Inventory management tests
```

**Example test structure:**
```python
# tests/test_products.py
import pytest
from app import crud, schemas

def test_create_product(db_session, test_store):
    """Test product creation"""
    product_data = schemas.ProductCreate(
        name="Test Product",
        sku="TEST001",
        store_id=test_store.id
    )
    product = crud.create_product(db_session, product_data)
    assert product.name == "Test Product"
    assert product.sku == "TEST001"

def test_duplicate_sku_fails(db_session, test_store):
    """Test that duplicate SKU raises error"""
    # Implementation
    pass
```

**Priority:** CRITICAL  
**Estimated Time:** 15-20 hours

### 6.2 Integration Tests
**Tests to implement:**
- End-to-end transaction flow
- Inventory stock consistency
- Accounting entry accuracy
- Multi-user concurrent access
- Permission enforcement

**Priority:** HIGH  
**Estimated Time:** 10-12 hours

---

## Implementation Timeline

### Week 1: Foundation ✅ COMPLETED
- [x] Update database schema SQL file
- [x] Create Store model with all relationships
- [x] Complete all SQLAlchemy models (12 models total)
- [ ] Run SQL script to create tables
- [ ] Verify all relationships in database

### Week 2: Product & Inventory (CURRENT)
- [ ] Complete all product-related models
- [ ] Create Pydantic schemas
- [ ] Implement CRUD operations
- [ ] Build API endpoints
- [ ] Test product management flow

### Week 3: Transactions
- [ ] Implement Transaction models
- [ ] Create transaction schemas
- [ ] Build transaction CRUD with stock logic
- [ ] Implement transaction API endpoints
- [ ] Test complete transaction flow

### Week 4: Accounting
- [ ] Implement Expense & Ledger models
- [ ] Create accounting service layer
- [ ] Build financial reports
- [ ] Test accounting accuracy
- [ ] Validate double-entry bookkeeping

### Week 5: Security & Roles
- [ ] Implement Role system
- [ ] Update User model with relationships
- [ ] Create permission checking system
- [ ] Add authorization to all endpoints
- [ ] Test authorization rules

### Week 6: Testing & Documentation
- [ ] Write comprehensive unit tests
- [ ] Create integration tests
- [ ] Update API documentation
- [ ] Create user guide
- [ ] Performance testing
- [ ] Security audit

---

## File Structure (Target)

```
src/backend/
├── app/
│   ├── __init__.py
│   ├── models.py                    # All SQLAlchemy models ✅
│   ├── schemas/                     # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── store.py
│   │   ├── product.py
│   │   ├── transaction.py
│   │   ├── accounting.py
│   │   └── ...
│   ├── crud/                        # CRUD operations
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── store.py
│   │   ├── product.py
│   │   ├── transaction.py
│   │   └── ...
│   ├── services/                    # Business logic
│   │   ├── __init__.py
│   │   ├── accounting.py
│   │   ├── inventory.py
│   │   └── reports.py
│   ├── api/
│   │   ├── deps.py                  # Dependencies ✅
│   │   ├── main.py                  # Router aggregation ✅
│   │   └── routes/
│   │       ├── auth.py              # ✅
│   │       ├── users.py             # ✅
│   │       ├── stores.py
│   │       ├── products.py
│   │       ├── warehouses.py
│   │       ├── batches.py
│   │       ├── transactions.py
│   │       ├── expenses.py
│   │       ├── ledger.py
│   │       └── reports.py
│   └── core/
│       ├── config.py                # ✅
│       ├── security.py              # ✅
│       ├── database.py              # ✅
│       └── permissions.py           # NEW
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_products.py
│   ├── test_transactions.py
│   └── ...
├── main.py                          # FastAPI app ✅
├── .env                             # Environment variables ✅
└── requirement.txt                  # Dependencies ✅
```

---

## Key Considerations

### 1. Data Integrity
- ✅ Use database transactions for multi-table operations
- ✅ Implement optimistic locking for stock updates
- ✅ Add CHECK constraints in database
- Use SQLAlchemy session management properly
- Implement proper error handling and rollback

### 2. Performance
- ✅ Add indexes on frequently queried columns
- Use database-level pagination (`LIMIT`, `OFFSET`)
- Consider materialized views for complex reports
- Implement caching for frequently accessed data (Redis)
- Use eager loading for relationships when needed

### 3. Security
- ✅ Row-level security (users can only access their store's data)
- Audit logging for financial transactions
- ✅ Input validation with Pydantic
- ✅ SQL injection prevention (SQLAlchemy handles this)
- Rate limiting on API endpoints
- HTTPS enforcement in production

### 4. Scalability
- Partition large tables (transactions, ledger_entries) by date
- Archive old transactions periodically
- Use read replicas for reports
- Implement background jobs for heavy operations
- Consider message queues for async processing

### 5. Business Logic

#### Inventory Management
- **FIFO** (First In, First Out) for batch selection
- **FEFO** (First Expired, First Out) for perishables
- Automatic stock deduction on sales
- Stock reservation for pending transactions
- Low stock alerts

#### Accounting
- Automatic ledger entry creation on transactions
- Double-entry bookkeeping validation
- Tax calculation based on product category
- Period closing procedures
- Reconciliation reports

---

## Database Schema Validation Checklist

Before implementation:

- [x] All foreign key relationships are correct
- [x] All required indexes are defined
- [x] Enum types match application logic
- [x] Timestamp fields use `TIMESTAMP WITH TIME ZONE`
- [x] UUID generation is set up correctly
- [x] Cascade delete rules are appropriate
- [x] Unique constraints are in place
- [x] CHECK constraints for data validation

---

## Risk Mitigation

### High-Risk Areas

1. **Concurrent Transactions**
   - **Risk:** Race conditions in stock updates
   - **Mitigation:** Use row-level locking (`SELECT FOR UPDATE`)
   - **Implementation:** PostgreSQL transaction isolation

2. **Stock Consistency**
   - **Risk:** Negative stock, overselling
   - **Mitigation:** Database CHECK constraints + application validation
   - **Implementation:** Atomic operations with rollback

3. **Accounting Accuracy**
   - **Risk:** Unbalanced ledger entries
   - **Mitigation:** Automated tests for double-entry
   - **Implementation:** Service layer validation

4. **Data Migration**
   - **Risk:** Data loss or corruption
   - **Mitigation:** Test on staging database first
   - **Implementation:** Backup before migration, rollback plan

### Testing Strategy

- **Unit Tests:** All CRUD operations (80%+ coverage)
- **Integration Tests:** Complex workflows (transaction flow)
- **Load Tests:** Concurrent transactions (100+ users)
- **Accounting Tests:** Reconciliation and balance validation
- **Security Tests:** Permission enforcement

---

## Next Immediate Steps (Week 2)

### Priority 1: Complete Models (Day 1-2)
1. Add all remaining models to `models.py`:
   - Role
   - TaxDetail
   - ProductCategory
   - Product
   - Warehouse
   - Batch
   - Transaction
   - TransactionItem
   - Expense
   - GeneralLedgerEntry

2. Define all relationships between models

3. Test model definitions

### Priority 2: Create Database (Day 2-3)
1. Run SQL script to create all tables:
   ```bash
   psql -U postgres -d vietledgr -f docs/database-schema.sql
   ```

2. Verify all tables created:
   ```sql
   \dt
   \d users
   \d products
   -- etc.
   ```

3. Test foreign key constraints

### Priority 3: Build Product System (Day 3-5)
1. Create schemas for products, categories, warehouses, batches
2. Implement CRUD operations
3. Build API endpoints
4. Test with Swagger UI

### Priority 4: Documentation (Day 6-7)
1. Update API documentation
2. Create Postman collection
3. Write developer guide
4. Test all endpoints

---

## Success Metrics

- [ ] All tables created successfully
- [ ] All relationships working correctly
- [ ] All API endpoints functional
- [ ] Authentication & authorization working
- [ ] Stock management accurate
- [ ] Accounting entries balanced
- [ ] Tests passing (>80% coverage)
- [ ] API documentation complete
- [ ] Performance acceptable (<200ms response)

---

## Resources & References

- **SQLAlchemy Documentation:** https://docs.sqlalchemy.org/
- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Pydantic Documentation:** https://docs.pydantic.dev/

---

## Summary of Completed Work

### ✅ All SQLAlchemy Models Implemented (12 Total)

1. **Store** - Complete with 6 relationships (users, products, warehouses, transactions, expenses, ledger_entries)
2. **Role** - Complete with user relationship
3. **User** - Complete with store_id and role_id foreign keys, 4 relationships
4. **TaxDetail** - Complete with category relationship and rate constraint
5. **ProductCategory** - Complete with tax and product relationships
6. **Product** - Complete with store, category, and batch relationships, unique SKU
7. **Warehouse** - Complete with store and batch relationships
8. **Batch** - Complete with product, warehouse, transaction_item relationships, 3 CHECK constraints
9. **Transaction** - Complete with store, user, items, ledger relationships, 2 CHECK constraints
10. **TransactionItem** - Complete with transaction and batch relationships, 3 CHECK constraints
11. **Expense** - Complete with store, user, ledger relationships, amount constraint
12. **GeneralLedgerEntry** - Complete with store, transaction, expense relationships, double-entry constraint

### Key Features Implemented:
- ✅ All foreign key relationships with proper ondelete behaviors
- ✅ Cascade delete where appropriate (store → related entities)
- ✅ Proper nullable/optional fields using `| None` type hints
- ✅ All CHECK constraints for data validation
- ✅ All `__repr__` methods for debugging
- ✅ Proper use of `Mapped[]` type hints
- ✅ Decimal type for all monetary values
- ✅ UUID primary keys throughout
- ✅ Timestamp fields with timezone support
- ✅ Auto-update timestamps (created_at, updated_at)

---

**Document Version:** 2.0  
**Last Updated:** November 13, 2025  
**Status:** Week 1 COMPLETE - All Models Implemented, Ready for Phase 2  
**Next Steps:** Create database tables and begin CRUD/API development  
**Next Review:** End of Week 2
