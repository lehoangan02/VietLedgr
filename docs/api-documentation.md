# VietLedgr API Documentation

## Overview

This document provides comprehensive API documentation for the VietLedgr backend. All endpoints follow RESTful principles and return JSON responses. Authentication is required for all endpoints (except login).

**Base URL:** `http://localhost:8000/api`  
**Version:** 1.0  
**Date:** November 14, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Store Endpoints](#store-endpoints)
3. [Warehouse Endpoints](#warehouse-endpoints)
4. [Batch Endpoints](#batch-endpoints)
5. [Product Endpoints](#product-endpoints)
6. [Tax Endpoints](#tax-endpoints)
7. [Category Endpoints](#category-endpoints)
8. [Error Handling](#error-handling)
9. [Response Codes](#response-codes)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

All endpoints require Bearer token authentication (except `/api/auth/login`).

**Header Format:**
```
Authorization: Bearer {token}
```

### Login
`POST /api/auth/login`

Authenticate and receive an access token.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

## Store Endpoints

Store endpoints manage branch/location information within VietLedgr.

### Create Store
`POST /api/stores/`

Create a new store/branch.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Downtown Branch",
  "address": "123 Main Street, HCMC",
  "phone": "+84901234567",
  "email": "downtown@vietledgr.com"
}
```

**Schema:** [`StoreCreate`](../src/backend/app/schemas/store.py)

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-255 characters |
| address | string | No | Max 500 characters |
| phone | string | No | Pattern: `^\+?1?\d{9,15}$` |
| email | string | No | Valid email format |

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Downtown Branch",
  "address": "123 Main Street, HCMC",
  "phone": "+84901234567",
  "email": "downtown@vietledgr.com",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "name"],
      "msg": "String should have at least 1 character",
      "input": ""
    }
  ]
}
```

---

### Get Store by ID
`GET /api/stores/{store_id}`

Retrieve a specific store by its ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| store_id | UUID | The store's unique identifier |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Downtown Branch",
  "address": "123 Main Street, HCMC",
  "phone": "+84901234567",
  "email": "downtown@vietledgr.com",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Store not found"
}
```

---

### List Stores
`GET /api/stores/`

Retrieve all stores with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |

**Example Request:**
```
GET /api/stores/?skip=0&limit=20
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Downtown Branch",
      "address": "123 Main Street, HCMC",
      "phone": "+84901234567",
      "email": "downtown@vietledgr.com",
      "created_at": "2025-11-14T10:30:00Z",
      "updated_at": "2025-11-14T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Uptown Branch",
      "address": "456 Oak Avenue, HCMC",
      "phone": "+84907654321",
      "email": "uptown@vietledgr.com",
      "created_at": "2025-11-13T15:45:00Z",
      "updated_at": "2025-11-13T15:45:00Z"
    }
  ],
  "total": 2,
  "skip": 0,
  "limit": 20
}
```

---

### Update Store
`PUT /api/stores/{store_id}`

Update an existing store. All fields are optional.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| store_id | UUID | The store's unique identifier |

**Request Body:**
```json
{
  "phone": "+84909876543",
  "email": "newemail@vietledgr.com"
}
```

**Schema:** [`StoreUpdate`](../src/backend/app/schemas/store.py)

**Validation Rules:**
- Same as `StoreCreate`, but all fields optional
- Only provided fields will be updated

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Downtown Branch",
  "address": "123 Main Street, HCMC",
  "phone": "+84909876543",
  "email": "newemail@vietledgr.com",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T11:45:00Z"
}
```

---

### Delete Store
`DELETE /api/stores/{store_id}`

Delete a store permanently.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| store_id | UUID | The store's unique identifier |

**Response (200 OK):**
```json
{
  "detail": "Store deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Store not found"
}
```

---

## Warehouse Endpoints

Warehouse endpoints manage storage locations within stores.

### Create Warehouse
`POST /api/warehouses/`

Create a new warehouse within a store.

**Request Body:**
```json
{
  "name": "Main Storage",
  "location": "Building A, Floor 2",
  "store_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Schema:** [`WarehouseCreate`](../src/backend/app/schemas/warehouse.py)

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-255 characters |
| location | string | No | Max 500 characters |
| store_id | UUID | Yes | Must reference existing store |

**Response (201 Created):**
```json
{
  "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Main Storage",
  "location": "Building A, Floor 2",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-11-14T10:30:00Z",
  "total_items": 0
}
```

---

### Get Warehouse by ID
`GET /api/warehouses/{warehouse_id}`

Retrieve a specific warehouse by its ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| warehouse_id | UUID | The warehouse's unique identifier |

**Response (200 OK):**
```json
{
  "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Main Storage",
  "location": "Building A, Floor 2",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-11-14T10:30:00Z",
  "total_items": 5432
}
```

**Note:** `total_items` is calculated as the sum of stock across all batches in the warehouse.

---

### List Warehouses
`GET /api/warehouses/`

Retrieve all warehouses with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |

**Example Request:**
```
GET /api/warehouses/?skip=0&limit=50
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Main Storage",
      "location": "Building A, Floor 2",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-11-14T10:30:00Z",
      "total_items": 5432
    },
    {
      "warehouse_id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Cold Storage",
      "location": "Building B, Floor 1",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-11-13T08:15:00Z",
      "total_items": 1200
    }
  ],
  "total": 2
}
```

---

### Update Warehouse
`PUT /api/warehouses/{warehouse_id}`

Update an existing warehouse.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| warehouse_id | UUID | The warehouse's unique identifier |

**Request Body:**
```json
{
  "name": "Main Storage - Updated",
  "location": "Building A, Floor 3"
}
```

**Schema:** [`WarehouseUpdate`](../src/backend/app/schemas/warehouse.py)

**Response (200 OK):**
```json
{
  "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Main Storage - Updated",
  "location": "Building A, Floor 3",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-11-14T10:30:00Z",
  "total_items": 5432
}
```

---

### Delete Warehouse
`DELETE /api/warehouses/{warehouse_id}`

Delete a warehouse permanently. This will also delete all associated batches.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| warehouse_id | UUID | The warehouse's unique identifier |

**Response (200 OK):**
```json
{
  "detail": "Warehouse deleted successfully"
}
```

---

## Batch Endpoints

Batch endpoints manage inventory batches/lots with cost and pricing information.

### Create Batch
`POST /api/batches/`

Create a new inventory batch.

**Request Body:**
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
  "stock": 100,
  "cost": "10.00",
  "sale_price": "15.00",
  "supplier_name": "Coca Cola Co",
  "expire_date": "2026-12-31T00:00:00Z",
  "import_date": "2025-11-14T10:30:00Z"
}
```

**Schema:** [`BatchCreate`](../src/backend/app/schemas/batch.py)

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| product_id | UUID | Yes | Must reference existing product |
| warehouse_id | UUID | Yes | Must reference existing warehouse |
| stock | integer | Yes | >= 0 (non-negative) |
| cost | decimal | Yes | > 0, 2 decimal places |
| sale_price | decimal | Yes | > 0, 2 decimal places |
| supplier_name | string | No | Max 255 characters |
| expire_date | datetime | No | ISO 8601 format |
| import_date | datetime | No | ISO 8601 format, defaults to now |

**Response (201 Created):**
```json
{
  "batch_id": "990e8400-e29b-41d4-a716-446655440004",
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
  "stock": 100,
  "cost": "10.00",
  "sale_price": "15.00",
  "supplier_name": "Coca Cola Co",
  "expire_date": "2026-12-31T00:00:00Z",
  "import_date": "2025-11-14T10:30:00Z",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z",
  "profit_margin": "5.00",
  "profit_margin_percent": "50.00"
}
```

**Computed Fields:**
- `profit_margin`: Sale price - Cost = $15.00 - $10.00 = $5.00
- `profit_margin_percent`: ((Sale price - Cost) / Cost) × 100 = (5 / 10) × 100 = 50%

**Error Response (400 Bad Request):**
```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "cost"],
      "msg": "Input should be greater than 0",
      "input": "0"
    }
  ]
}
```

---

### Get Batch by ID
`GET /api/batches/{batch_id}`

Retrieve a specific batch by its ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| batch_id | UUID | The batch's unique identifier |

**Response (200 OK):**
```json
{
  "batch_id": "990e8400-e29b-41d4-a716-446655440004",
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
  "stock": 100,
  "cost": "10.00",
  "sale_price": "15.00",
  "supplier_name": "Coca Cola Co",
  "expire_date": "2026-12-31T00:00:00Z",
  "import_date": "2025-11-14T10:30:00Z",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z",
  "profit_margin": "5.00",
  "profit_margin_percent": "50.00"
}
```

---

### List Batches
`GET /api/batches/`

Retrieve all batches with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |

**Example Request:**
```
GET /api/batches/?skip=0&limit=50
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "batch_id": "990e8400-e29b-41d4-a716-446655440004",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
      "stock": 100,
      "cost": "10.00",
      "sale_price": "15.00",
      "supplier_name": "Coca Cola Co",
      "expire_date": "2026-12-31T00:00:00Z",
      "import_date": "2025-11-14T10:30:00Z",
      "created_at": "2025-11-14T10:30:00Z",
      "updated_at": "2025-11-14T10:30:00Z",
      "profit_margin": "5.00",
      "profit_margin_percent": "50.00"
    }
  ],
  "total": 1
}
```

---

### Update Batch
`PUT /api/batches/{batch_id}`

Update an existing batch. All fields are optional.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| batch_id | UUID | The batch's unique identifier |

**Request Body:**
```json
{
  "stock": 95,
  "cost": "10.50"
}
```

**Schema:** [`BatchUpdate`](../src/backend/app/schemas/batch.py)

**Response (200 OK):**
```json
{
  "batch_id": "990e8400-e29b-41d4-a716-446655440004",
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
  "stock": 95,
  "cost": "10.50",
  "sale_price": "15.00",
  "supplier_name": "Coca Cola Co",
  "expire_date": "2026-12-31T00:00:00Z",
  "import_date": "2025-11-14T10:30:00Z",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T11:50:00Z",
  "profit_margin": "4.50",
  "profit_margin_percent": "42.86"
}
```

---

### Delete Batch
`DELETE /api/batches/{batch_id}`

Delete a batch permanently.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| batch_id | UUID | The batch's unique identifier |

**Response (200 OK):**
```json
{
  "detail": "Batch deleted successfully"
}
```

---

### Get Expiring Batches
`GET /api/batches/expiring?days=30`

Retrieve batches expiring within a specified number of days.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | integer | 30 | Days until expiration to check |
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |

**Response (200 OK):**
```json
{
  "items": [
    {
      "batch_id": "990e8400-e29b-41d4-a716-446655440004",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
      "stock": 100,
      "cost": "10.00",
      "sale_price": "15.00",
      "supplier_name": "Coca Cola Co",
      "expire_date": "2025-12-10T00:00:00Z",
      "import_date": "2025-11-14T10:30:00Z",
      "created_at": "2025-11-14T10:30:00Z",
      "updated_at": "2025-11-14T10:30:00Z",
      "profit_margin": "5.00",
      "profit_margin_percent": "50.00",
      "days_to_expire": 26,
      "urgency": "soon"
    }
  ],
  "total": 1
}
```

**Urgency Levels:**
- `expired`: expire_date has passed
- `urgent`: expires within 5 days
- `soon`: expires within 30 days
- `normal`: expires after 30 days

---

### Get Low Stock Batches
`GET /api/batches/low-stock`

Retrieve batches with low inventory levels.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| threshold | integer | 50 | Stock level threshold |
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |

**Response (200 OK):**
```json
{
  "items": [
    {
      "batch_id": "990e8400-e29b-41d4-a716-446655440004",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "warehouse_id": "770e8400-e29b-41d4-a716-446655440002",
      "stock": 25,
      "cost": "10.00",
      "sale_price": "15.00",
      "supplier_name": "Coca Cola Co",
      "expire_date": "2026-12-31T00:00:00Z",
      "import_date": "2025-11-14T10:30:00Z",
      "created_at": "2025-11-14T10:30:00Z",
      "updated_at": "2025-11-14T10:30:00Z",
      "profit_margin": "5.00",
      "profit_margin_percent": "50.00",
      "stock_level": "low",
      "reorder_quantity": 100
    }
  ],
  "total": 1
}
```

**Stock Level Indicators:**
- `critical`: stock < 10
- `low`: stock between 10-50
- `warning`: stock between 50-100

---

## Product Endpoints

Product endpoints manage product master data.

### Create Product
`POST /api/products/`

Create a new product.

**Request Body:**
```json
{
  "name": "Coca Cola 330ml",
  "sku": "COKE-330",
  "description": "Classic Coca Cola Can",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Schema:** `ProductCreate` (defined in [product.py](../src/backend/app/schemas/product.py))

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-255 characters |
| sku | string | Yes | 1-100 characters, unique per store |
| description | string | No | Max 1000 characters |
| store_id | UUID | Yes | Must reference existing store |
| category_id | UUID | No | Must reference existing category |

**Response (201 Created):**
```json
{
  "product_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Coca Cola 330ml",
  "sku": "COKE-330",
  "description": "Classic Coca Cola Can",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z",
  "category": {
    "category_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Beverages",
    "description": "All drink products",
    "tax_id": "bb0e8400-e29b-41d4-a716-446655440006",
    "created_at": "2025-11-01T08:00:00Z",
    "tax": {
      "tax_id": "bb0e8400-e29b-41d4-a716-446655440006",
      "tax_name": "VAT Standard",
      "tax_rate": "10.00",
      "tax_description": "Standard VAT rate"
    }
  }
}
```

---

### Get Product by ID
`GET /api/products/{product_id}`

Retrieve a specific product by its ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| product_id | UUID | The product's unique identifier |

**Response (200 OK):**
```json
{
  "product_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Coca Cola 330ml",
  "sku": "COKE-330",
  "description": "Classic Coca Cola Can",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z",
  "category": { ... }
}
```

---

### Get Product by SKU
`GET /api/products/sku/{sku}`

Retrieve a product by its Stock Keeping Unit (SKU).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sku | string | The product's SKU |

**Response (200 OK):**
```json
{
  "product_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Coca Cola 330ml",
  "sku": "COKE-330",
  ...
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Product not found"
}
```

---

### List Products
`GET /api/products/`

Retrieve all products with pagination and optional filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |
| category_id | UUID | None | Filter by category |
| store_id | UUID | None | Filter by store |

**Example Request:**
```
GET /api/products/?skip=0&limit=20&category_id=660e8400-e29b-41d4-a716-446655440001
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "product_id": "aa0e8400-e29b-41d4-a716-446655440005",
      "name": "Coca Cola 330ml",
      "sku": "COKE-330",
      "description": "Classic Coca Cola Can",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "category_id": "660e8400-e29b-41d4-a716-446655440001",
      "created_at": "2025-11-14T10:30:00Z",
      "updated_at": "2025-11-14T10:30:00Z",
      "category": { ... }
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

---

### Update Product
`PUT /api/products/{product_id}`

Update an existing product.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| product_id | UUID | The product's unique identifier |

**Request Body:**
```json
{
  "name": "Coca Cola 330ml Can",
  "description": "Classic Coca Cola in aluminum can"
}
```

**Schema:** `ProductUpdate` (defined in [product.py](../src/backend/app/schemas/product.py))

**Response (200 OK):**
```json
{
  "product_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "Coca Cola 330ml Can",
  "sku": "COKE-330",
  "description": "Classic Coca Cola in aluminum can",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T11:55:00Z",
  "category": { ... }
}
```

---

### Delete Product
`DELETE /api/products/{product_id}`

Delete a product permanently. Associated batches must be deleted first.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| product_id | UUID | The product's unique identifier |

**Response (200 OK):**
```json
{
  "detail": "Product deleted successfully"
}
```

---

## Tax Endpoints

Tax endpoints manage tax rates and information.

### Create Tax
`POST /api/taxes/`

Create a new tax rate.

**Request Body:**
```json
{
  "tax_name": "VAT Standard",
  "tax_rate": "10.00",
  "tax_description": "Standard VAT rate for most goods"
}
```

**Schema:** `TaxDetailCreate` (defined in [tax.py](../src/backend/app/schemas/tax.py))

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| tax_name | string | Yes | 1-100 characters |
| tax_rate | decimal | Yes | 0-100, 2 decimal places |
| tax_description | string | No | Max 500 characters |

**Response (201 Created):**
```json
{
  "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "tax_name": "VAT Standard",
  "tax_rate": "10.00",
  "tax_description": "Standard VAT rate for most goods",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

---

### Get Tax by ID
`GET /api/taxes/{tax_id}`

Retrieve a specific tax rate by its ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tax_id | UUID | The tax's unique identifier |

**Response (200 OK):**
```json
{
  "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "tax_name": "VAT Standard",
  "tax_rate": "10.00",
  "tax_description": "Standard VAT rate for most goods",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

---

### List Taxes
`GET /api/taxes/`

Retrieve all tax rates with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |

**Response (200 OK):**
```json
{
  "items": [
    {
      "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
      "tax_name": "VAT Standard",
      "tax_rate": "10.00",
      "tax_description": "Standard VAT rate for most goods",
      "created_at": "2025-11-14T10:30:00Z",
      "updated_at": "2025-11-14T10:30:00Z"
    },
    {
      "tax_id": "dd0e8400-e29b-41d4-a716-446655440008",
      "tax_name": "Tax Exempt",
      "tax_rate": "0.00",
      "tax_description": "For tax-exempt items",
      "created_at": "2025-11-13T09:00:00Z",
      "updated_at": "2025-11-13T09:00:00Z"
    }
  ],
  "total": 2,
  "skip": 0,
  "limit": 100
}
```

---

### Update Tax
`PUT /api/taxes/{tax_id}`

Update an existing tax rate.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tax_id | UUID | The tax's unique identifier |

**Request Body:**
```json
{
  "tax_rate": "8.00",
  "tax_description": "Updated VAT rate"
}
```

**Schema:** `TaxDetailUpdate` (defined in [tax.py](../src/backend/app/schemas/tax.py))

**Response (200 OK):**
```json
{
  "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "tax_name": "VAT Standard",
  "tax_rate": "8.00",
  "tax_description": "Updated VAT rate",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T12:00:00Z"
}
```

---

### Delete Tax
`DELETE /api/taxes/{tax_id}`

Delete a tax rate.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tax_id | UUID | The tax's unique identifier |

**Response (200 OK):**
```json
{
  "detail": "Tax deleted successfully"
}
```

---

## Category Endpoints

Category endpoints manage product categories with optional tax associations.

### Create Category
`POST /api/categories/`

Create a new product category.

**Request Body:**
```json
{
  "name": "Beverages",
  "description": "All drink products",
  "tax_id": "cc0e8400-e29b-41d4-a716-446655440007"
}
```

**Schema:** `ProductCategoryCreate` (defined in [category.py](../src/backend/app/schemas/category.py))

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-100 characters |
| description | string | No | Max 500 characters |
| tax_id | UUID | No | Must reference existing tax |

**Response (201 Created):**
```json
{
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Beverages",
  "description": "All drink products",
  "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "created_at": "2025-11-01T08:00:00Z",
  "tax": {
    "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
    "tax_name": "VAT Standard",
    "tax_rate": "10.00",
    "tax_description": "Standard VAT rate for most goods"
  }
}
```

---

### Get Category by ID
`GET /api/categories/{category_id}`

Retrieve a specific category by its ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category_id | UUID | The category's unique identifier |

**Response (200 OK):**
```json
{
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Beverages",
  "description": "All drink products",
  "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "created_at": "2025-11-01T08:00:00Z",
  "tax": { ... }
}
```

---

### List Categories
`GET /api/categories/`

Retrieve all product categories with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 100 | Maximum records to return |

**Response (200 OK):**
```json
{
  "items": [
    {
      "category_id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Beverages",
      "description": "All drink products",
      "tax_id": "cc0e8400-e29b-41d4-a716-446655440007",
      "created_at": "2025-11-01T08:00:00Z",
      "tax": { ... }
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

---

### Update Category
`PUT /api/categories/{category_id}`

Update an existing category.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category_id | UUID | The category's unique identifier |

**Request Body:**
```json
{
  "name": "Cold Beverages",
  "tax_id": "dd0e8400-e29b-41d4-a716-446655440008"
}
```

**Schema:** `ProductCategoryUpdate` (defined in [category.py](../src/backend/app/schemas/category.py))

**Response (200 OK):**
```json
{
  "category_id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Cold Beverages",
  "description": "All drink products",
  "tax_id": "dd0e8400-e29b-41d4-a716-446655440008",
  "created_at": "2025-11-01T08:00:00Z",
  "tax": { ... }
}
```

---

### Delete Category
`DELETE /api/categories/{category_id}`

Delete a category permanently.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category_id | UUID | The category's unique identifier |

**Response (200 OK):**
```json
{
  "detail": "Category deleted successfully"
}
```

---

# VietLedgr API Documentation (Continued)

## Transaction Endpoints

Transaction endpoints manage sales transactions with complete double-entry accounting integration.

### Create Transaction
`POST /api/transactions/`

Create a new sales transaction with items. This operation:
- Validates stock availability across all items
- Deducts inventory from batches (FIFO)
- Calculates tax based on product categories
- Creates double-entry ledger entries automatically
- Maintains transaction atomicity

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "device_id": "POS-001",
  "items": [
    {
      "batch_id": "990e8400-e29b-41d4-a716-446655440004",
      "quantity": 5,
      "price_at_sale": "15.00"
    },
    {
      "batch_id": "aa0e8400-e29b-41d4-a716-446655440005",
      "quantity": 3,
      "price_at_sale": "25.00"
    }
  ]
}
```

**Schema:** [`TransactionCreate`](../src/backend/app/schemas/transaction.py)

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| store_id | UUID | Yes | Must reference existing store |
| device_id | string | No | Max 100 characters (e.g., POS terminal ID) |
| items | array | Yes | At least 1 item required |
| items[].batch_id | UUID | Yes | Must reference existing batch |
| items[].quantity | integer | Yes | >= 1 |
| items[].price_at_sale | decimal | Yes | > 0, 2 decimal places |

**Transaction Item Validation:**
- Stock availability: quantity <= batch.stock
- Price validation: price_at_sale > 0
- Batch exists and belongs to same store

**Response (201 Created):**
```json
{
  "transaction_id": "bb0e8400-e29b-41d4-a716-446655440009",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
  "device_id": "POS-001",
  "total_amount": "150.00",
  "total_tax": "15.00",
  "created_at": "2025-11-14T14:30:00Z",
  "items": [
    {
      "transaction_item_id": "dd0e8400-e29b-41d4-a716-446655440011",
      "batch_id": "990e8400-e29b-41d4-a716-446655440004",
      "quantity": 5,
      "price_at_sale": "15.00",
      "cost_at_sale": "10.00",
      "line_amount": "75.00",
      "tax_amount": "7.50",
      "subtotal": "82.50"
    },
    {
      "transaction_item_id": "ee0e8400-e29b-41d4-a716-446655440012",
      "batch_id": "aa0e8400-e29b-41d4-a716-446655440005",
      "quantity": 3,
      "price_at_sale": "25.00",
      "cost_at_sale": "15.00",
      "line_amount": "75.00",
      "tax_amount": "7.50",
      "subtotal": "82.50"
    }
  ],
  "ledger_entries": [
    {
      "entry_id": "ff0e8400-e29b-41d4-a716-446655440013",
      "account_type": "ASSET",
      "description": "Cash received from transaction bb0e8400-e29b-41d4-a716-446655440009",
      "debit_amount": "150.00",
      "credit_amount": "0.00"
    },
    {
      "entry_id": "gg0e8400-e29b-41d4-a716-446655440014",
      "account_type": "REVENUE",
      "description": "Sales revenue from transaction bb0e8400-e29b-41d4-a716-446655440009",
      "debit_amount": "0.00",
      "credit_amount": "150.00"
    },
    {
      "entry_id": "hh0e8400-e29b-41d4-a716-446655440015",
      "account_type": "EXPENSE",
      "description": "Cost of goods sold for transaction bb0e8400-e29b-41d4-a716-446655440009",
      "debit_amount": "65.00",
      "credit_amount": "0.00"
    },
    {
      "entry_id": "ii0e8400-e29b-41d4-a716-446655440016",
      "account_type": "ASSET",
      "description": "Inventory reduction for transaction bb0e8400-e29b-41d4-a716-446655440009",
      "debit_amount": "0.00",
      "credit_amount": "65.00"
    }
  ]
}
```

**Calculation Details:**

```
Item 1:
  Line Amount = quantity × price_at_sale = 5 × $15.00 = $75.00
  Tax Rate = 10% (from product category)
  Tax Amount = $75.00 × 10% = $7.50
  Subtotal = $75.00 + $7.50 = $82.50
  COGS = quantity × cost_at_sale = 5 × $10.00 = $50.00

Item 2:
  Line Amount = 3 × $25.00 = $75.00
  Tax Amount = $75.00 × 10% = $7.50
  Subtotal = $75.00 + $7.50 = $82.50
  COGS = 3 × $15.00 = $45.00

Transaction Totals:
  Total Amount = $75.00 + $75.00 = $150.00
  Total Tax = $7.50 + $7.50 = $15.00
  Total COGS = $50.00 + $45.00 = $65.00
```

**Ledger Entries Created (Double-Entry Bookkeeping):**

1. **Debit Asset (Cash), Credit Revenue**
   - Debit: Cash $150.00
   - Credit: Sales Revenue $150.00

2. **Debit COGS Expense, Credit Inventory**
   - Debit: Cost of Goods Sold $65.00
   - Credit: Inventory Asset $65.00

**Error Response (400 Bad Request - Insufficient Stock):**
```json
{
  "detail": "Insufficient stock for batch 990e8400-e29b-41d4-a716-446655440004. Available: 2, Requested: 5"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Batch 999e8400-e29b-41d4-a716-446655440099 not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "detail": "User does not have access to this store"
}
```

---

### Get Transaction by ID
`GET /api/transactions/{transaction_id}`

Retrieve a specific transaction with all items and ledger entries.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| transaction_id | UUID | The transaction's unique identifier |

**Response (200 OK):**
```json
{
  "transaction_id": "bb0e8400-e29b-41d4-a716-446655440009",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
  "device_id": "POS-001",
  "total_amount": "150.00",
  "total_tax": "15.00",
  "created_at": "2025-11-14T14:30:00Z",
  "items": [ ... ],
  "ledger_entries": [ ... ]
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Transaction not found"
}
```

---

### List Transactions
`GET /api/transactions/`

Retrieve paginated transactions for a store.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| store_id | UUID | Required | Store identifier |
| page | integer | 1 | Page number (starting from 1) |
| page_size | integer | 50 | Items per page (1-100) |

**Example Request:**
```
GET /api/transactions/?store_id=550e8400-e29b-41d4-a716-446655440000&page=1&page_size=20
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "transaction_id": "bb0e8400-e29b-41d4-a716-446655440009",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
      "device_id": "POS-001",
      "total_amount": "150.00",
      "total_tax": "15.00",
      "created_at": "2025-11-14T14:30:00Z",
      "items": [ ... ]
    },
    {
      "transaction_id": "cc0e8400-e29b-41d4-a716-446655440011",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
      "device_id": "POS-002",
      "total_amount": "250.00",
      "total_tax": "25.00",
      "created_at": "2025-11-14T15:45:00Z",
      "items": [ ... ]
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

---

### Get Transaction Summary
`GET /api/transactions/summary/report`

Get aggregated transaction statistics for a date range.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| store_id | UUID | Required | Store identifier |
| start_date | datetime | -30 days | ISO 8601 format |
| end_date | datetime | now | ISO 8601 format |

**Example Request:**
```
GET /api/transactions/summary/report?store_id=550e8400-e29b-41d4-a716-446655440000&start_date=2025-10-14T00:00:00Z&end_date=2025-11-14T23:59:59Z
```

**Response (200 OK):**
```json
{
  "total_transactions": 156,
  "total_amount": "5250.00",
  "total_tax": "525.00",
  "total_items": 423,
  "average_transaction": "33.65",
  "date_range_start": "2025-10-14T00:00:00Z",
  "date_range_end": "2025-11-14T23:59:59Z"
}
```

**Summary Calculations:**
- **Total Transactions**: Count of all transactions in date range
- **Total Amount**: Sum of total_amount across all transactions (before tax)
- **Total Tax**: Sum of total_tax across all transactions
- **Total Items**: Sum of quantities across all transaction items
- **Average Transaction**: Total Amount / Total Transactions

---

### Void Transaction
`POST /api/transactions/{transaction_id}/void`

Cancel a transaction and restore inventory. This operation:
- Restores stock to all batches
- Deletes transaction items
- Removes associated ledger entries (via cascade)
- Maintains data consistency

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| transaction_id | UUID | The transaction to void |

**Request Body:**
```json
{
  "reason": "Customer returned items - defective products"
}
```

**Schema:** [`TransactionUpdate`](../src/backend/app/schemas/transaction.py)

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| reason | string | No | Max 500 characters |

**Response (200 OK):**
```json
{
  "message": "Transaction voided successfully",
  "transaction_id": "bb0e8400-e29b-41d4-a716-446655440009",
  "reason": "Customer returned items - defective products",
  "restored_stock": {
    "990e8400-e29b-41d4-a716-446655440004": 5,
    "aa0e8400-e29b-41d4-a716-446655440005": 3
  }
}
```

**Stock Restoration Logic:**
```
For each transaction item:
  batch.stock += item.quantity
  batch.updated_at = datetime.utcnow()

Example:
  Item 1: batch_id with stock 95 + 5 = 100
  Item 2: batch_id with stock 97 + 3 = 100
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Transaction not found"
}
```

---

## Expense Endpoints

Expense endpoints manage business operating expenses with automatic ledger integration.

### Create Expense
`POST /api/expenses/`

Record a new business expense. Automatically creates double-entry ledger entries.

**Request Body:**
```json
{
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Office supplies and equipment",
  "amount": "500.00",
  "expense_date": "2025-11-14T10:30:00Z"
}
```

**Schema:** [`ExpenseCreate`](../src/backend/app/schemas/expense.py)

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| store_id | UUID | Yes | Must reference existing store |
| description | string | Yes | 1-500 characters |
| amount | decimal | Yes | > 0, 2 decimal places |
| expense_date | datetime | No | ISO 8601 format, defaults to now |

**Response (201 Created):**
```json
{
  "expense_id": "jj0e8400-e29b-41d4-a716-446655440017",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
  "description": "Office supplies and equipment",
  "amount": "500.00",
  "expense_date": "2025-11-14T10:30:00Z",
  "created_at": "2025-11-14T10:30:00Z",
  "ledger_entries": [
    {
      "entry_id": "kk0e8400-e29b-41d4-a716-446655440018",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "account_type": "EXPENSE",
      "description": "Office supplies and equipment (Expense ID: jj0e8400-e29b-41d4-a716-446655440017)",
      "debit_amount": "500.00",
      "credit_amount": "0.00",
      "entry_date": "2025-11-14T10:30:00Z"
    },
    {
      "entry_id": "ll0e8400-e29b-41d4-a716-446655440019",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "account_type": "ASSET",
      "description": "Cash paid for expense jj0e8400-e29b-41d4-a716-446655440017",
      "debit_amount": "0.00",
      "credit_amount": "500.00",
      "entry_date": "2025-11-14T10:30:00Z"
    }
  ]
}
```

**Ledger Entries Created (Double-Entry Bookkeeping):**

1. **Debit Expense Account**
   - Debit: Operating Expense $500.00
   - Credit: (to be shown in entry 2)

2. **Credit Asset (Cash)**
   - Debit: (from entry 1)
   - Credit: Cash Asset $500.00

**Expense Categories:**
Common expense descriptions for categorization:
- Office Supplies & Equipment
- Utilities (electricity, water, internet)
- Rent & Lease Payments
- Transportation & Delivery
- Marketing & Advertising
- Maintenance & Repairs
- Insurance & Licenses
- Employee Training
- Professional Services (accounting, legal)

**Error Response (400 Bad Request):**
```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "amount"],
      "msg": "Input should be greater than 0",
      "input": "0"
    }
  ]
}
```

---

### Get Expense by ID
`GET /api/expenses/{expense_id}`

Retrieve a specific expense with associated ledger entries.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| expense_id | UUID | The expense's unique identifier |

**Response (200 OK):**
```json
{
  "expense_id": "jj0e8400-e29b-41d4-a716-446655440017",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
  "description": "Office supplies and equipment",
  "amount": "500.00",
  "expense_date": "2025-11-14T10:30:00Z",
  "created_at": "2025-11-14T10:30:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Expense not found"
}
```

---

### List Expenses
`GET /api/expenses/`

Retrieve paginated expenses for a store.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| store_id | UUID | Required | Store identifier |
| page | integer | 1 | Page number (starting from 1) |
| page_size | integer | 50 | Items per page (1-100) |

**Example Request:**
```
GET /api/expenses/?store_id=550e8400-e29b-41d4-a716-446655440000&page=1&page_size=20
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "expense_id": "jj0e8400-e29b-41d4-a716-446655440017",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
      "description": "Office supplies and equipment",
      "amount": "500.00",
      "expense_date": "2025-11-14T10:30:00Z",
      "created_at": "2025-11-14T10:30:00Z"
    },
    {
      "expense_id": "mm0e8400-e29b-41d4-a716-446655440020",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
      "description": "Monthly electricity bill",
      "amount": "250.00",
      "expense_date": "2025-11-13T09:00:00Z",
      "created_at": "2025-11-13T09:00:00Z"
    }
  ],
  "total": 28,
  "page": 1,
  "page_size": 20,
  "total_pages": 2
}
```

---

### Update Expense
`PUT /api/expenses/{expense_id}`

Update an existing expense.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| expense_id | UUID | The expense's unique identifier |

**Request Body:**
```json
{
  "description": "Office supplies, equipment, and furniture",
  "amount": "600.00"
}
```

**Schema:** [`ExpenseUpdate`](../src/backend/app/schemas/expense.py)

**Validation Rules:**
- All fields are optional
- Only provided fields will be updated
- amount must be > 0 if provided

**Response (200 OK):**
```json
{
  "expense_id": "jj0e8400-e29b-41d4-a716-446655440017",
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "cc0e8400-e29b-41d4-a716-446655440010",
  "description": "Office supplies, equipment, and furniture",
  "amount": "600.00",
  "expense_date": "2025-11-14T10:30:00Z",
  "created_at": "2025-11-14T10:30:00Z"
}
```

**Note:** Updating an expense does NOT update associated ledger entries. Ledger entries maintain historical accuracy.

---

### Delete Expense
`DELETE /api/expenses/{expense_id}`

Delete an expense and its associated ledger entries (cascade delete).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| expense_id | UUID | The expense to delete |

**Response (204 No Content)**

No response body on successful deletion.

**Error Response (404 Not Found):**
```json
{
  "detail": "Expense not found"
}
```

**Deletion Details:**
- Expense record is deleted
- Associated ledger entries are automatically deleted (via cascade)
- No impact on other transactions or expenses
- Operation is atomic - either fully succeeds or fully fails

---

## Ledger Endpoints

Ledger endpoints provide access to double-entry bookkeeping entries and financial reports.

### Get Ledger Entries
`GET /api/ledger/entries`

Retrieve general ledger entries with optional filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| store_id | UUID | Required | Store identifier |
| start_date | datetime | None | ISO 8601 format |
| end_date | datetime | None | ISO 8601 format |
| account_type | string | None | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| page | integer | 1 | Page number (starting from 1) |
| page_size | integer | 50 | Items per page (1-100) |

**Example Requests:**
```
# Get all entries for a store
GET /api/ledger/entries?store_id=550e8400-e29b-41d4-a716-446655440000

# Get revenue entries for a date range
GET /api/ledger/entries?store_id=550e8400-e29b-41d4-a716-446655440000&account_type=REVENUE&start_date=2025-11-01T00:00:00Z&end_date=2025-11-30T23:59:59Z

# Get expense entries (paginated)
GET /api/ledger/entries?store_id=550e8400-e29b-41d4-a716-446655440000&account_type=EXPENSE&page=1&page_size=100
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "entry_id": "ff0e8400-e29b-41d4-a716-446655440013",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "account_type": "ASSET",
      "transaction_id": "bb0e8400-e29b-41d4-a716-446655440009",
      "expense_id": null,
      "entry_date": "2025-11-14T14:30:00Z",
      "description": "Cash received from transaction bb0e8400-e29b-41d4-a716-446655440009",
      "debit_amount": "150.00",
      "credit_amount": "0.00",
      "created_at": "2025-11-14T14:30:00Z"
    },
    {
      "entry_id": "gg0e8400-e29b-41d4-a716-446655440014",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "account_type": "REVENUE",
      "transaction_id": "bb0e8400-e29b-41d4-a716-446655440009",
      "expense_id": null,
      "entry_date": "2025-11-14T14:30:00Z",
      "description": "Sales revenue from transaction bb0e8400-e29b-41d4-a716-446655440009",
      "debit_amount": "0.00",
      "credit_amount": "150.00",
      "created_at": "2025-11-14T14:30:00Z"
    },
    {
      "entry_id": "kk0e8400-e29b-41d4-a716-446655440018",
      "store_id": "550e8400-e29b-41d4-a716-446655440000",
      "account_type": "EXPENSE",
      "transaction_id": null,
      "expense_id": "jj0e8400-e29b-41d4-a716-446655440017",
      "entry_date": "2025-11-14T10:30:00Z",
      "description": "Office supplies and equipment (Expense ID: jj0e8400-e29b-41d4-a716-446655440017)",
      "debit_amount": "500.00",
      "credit_amount": "0.00",
      "created_at": "2025-11-14T10:30:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "page_size": 50,
  "total_pages": 4
}
```

**Account Types:**
- **ASSET**: Cash, Inventory, Accounts Receivable
- **LIABILITY**: Accounts Payable, Loans, Taxes Payable
- **EQUITY**: Owner's Capital, Retained Earnings
- **REVENUE**: Sales, Service Income
- **EXPENSE**: Cost of Goods Sold, Operating Expenses

**Entry Relationships:**
- `transaction_id`: Set if entry came from a transaction
- `expense_id`: Set if entry came from an expense
- Both can be null for manual entries (future feature)

---

### Get Trial Balance
`GET /api/ledger/trial-balance`

Get trial balance report showing total debits and credits by account type.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| store_id | UUID | Required | Store identifier |
| as_of_date | datetime | now | ISO 8601 format |

**Example Request:**
```
GET /api/ledger/trial-balance?store_id=550e8400-e29b-41d4-a716-446655440000&as_of_date=2025-11-14T23:59:59Z
```

**Response (200 OK):**
```json
{
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "as_of_date": "2025-11-14T23:59:59Z",
  "entries": [
    {
      "account_type": "ASSET",
      "debit_total": "5250.00",
      "credit_total": "65.00"
    },
    {
      "account_type": "LIABILITY",
      "debit_total": "0.00",
      "credit_total": "500.00"
    },
    {
      "account_type": "EQUITY",
      "debit_total": "0.00",
      "credit_total": "10000.00"
    },
    {
      "account_type": "REVENUE",
      "debit_total": "0.00",
      "credit_total": "2500.00"
    },
    {
      "account_type": "EXPENSE",
      "debit_total": "1200.00",
      "credit_total": "0.00"
    }
  ],
  "total_debits": "6450.00",
  "total_credits": "6450.00",
  "is_balanced": true
}
```

**Trial Balance Calculation:**

```
Account Type    Debits      Credits
─────────────────────────────────────
ASSET          $5,250.00   $65.00
LIABILITY      $0.00       $500.00
EQUITY         $0.00       $10,000.00
REVENUE        $0.00       $2,500.00
EXPENSE        $1,200.00   $0.00
─────────────────────────────────────
TOTALS         $6,450.00   $6,450.00

Status: BALANCED ✓
```

**Balance Verification:**
- `is_balanced`: true if total_debits == total_credits
- Indicates double-entry bookkeeping integrity
- Should always be true in a properly functioning system

**Interpretation:**
- **Balanced**: All transactions properly recorded (double-entry)
- **Not Balanced**: Indicates data integrity issues (should not occur)

---

### Get Income Statement
`GET /api/ledger/income-statement`

Generate Profit & Loss (Income Statement) report for a period.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| store_id | UUID | Required | Store identifier |
| start_date | datetime | -30 days | ISO 8601 format |
| end_date | datetime | now | ISO 8601 format |

**Example Request:**
```
GET /api/ledger/income-statement?store_id=550e8400-e29b-41d4-a716-446655440000&start_date=2025-10-14T00:00:00Z&end_date=2025-11-14T23:59:59Z
```

**Response (200 OK):**
```json
{
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "start_date": "2025-10-14T00:00:00Z",
  "end_date": "2025-11-14T23:59:59Z",
  "revenue": "2500.00",
  "cost_of_goods_sold": "1500.00",
  "gross_profit": "1000.00",
  "expenses": [
    {
      "category": "Office supplies and equipment",
      "amount": "500.00"
    },
    {
      "category": "Monthly electricity bill",
      "amount": "250.00"
    },
    {
      "category": "Professional services",
      "amount": "150.00"
    }
  ],
  "total_expenses": "900.00",
  "net_income": "100.00"
}
```

**Income Statement Calculation:**

```
REVENUE
  Sales Revenue (from transactions)           $2,500.00
────────────────────────────────────────────────────────
COST OF GOODS SOLD (COGS)
  Direct product costs                       ($1,500.00)
────────────────────────────────────────────────────────
GROSS PROFIT                                  $1,000.00

OPERATING EXPENSES
  Office supplies and equipment    $500.00
  Monthly electricity bill         $250.00
  Professional services            $150.00
  Total Operating Expenses                     ($900.00)
────────────────────────────────────────────────────────
NET INCOME (PROFIT/LOSS)                       $100.00
```

**Key Metrics:**
- **Gross Profit Margin**: (Gross Profit / Revenue) × 100 = ($1,000 / $2,500) × 100 = 40%
- **Net Profit Margin**: (Net Income / Revenue) × 100 = ($100 / $2,500) × 100 = 4%
- **Operating Expense Ratio**: (Total Expenses / Revenue) × 100 = ($900 / $2,500) × 100 = 36%

**Expense Breakdown:**
Expenses are grouped by category and summed. If multiple expenses have the same description:
```
expenses: [
  {
    "category": "Office supplies",
    "amount": "500.00"  // Aggregated from multiple expense records
  }
]
```

---

### Get Balance Sheet
`GET /api/ledger/balance-sheet`

Generate Balance Sheet (Statement of Financial Position) report.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| store_id | UUID | Required | Store identifier |
| as_of_date | datetime | now | ISO 8601 format |

**Example Request:**
```
GET /api/ledger/balance-sheet?store_id=550e8400-e29b-41d4-a716-446655440000&as_of_date=2025-11-14T23:59:59Z
```

**Response (200 OK):**
```json
{
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "as_of_date": "2025-11-14T23:59:59Z",
  "assets": [
    {
      "name": "Total Assets",
      "amount": "5185.00"
    }
  ],
  "total_assets": "5185.00",
  "liabilities": [
    {
      "name": "Total Liabilities",
      "amount": "500.00"
    }
  ],
  "total_liabilities": "500.00",
  "equity": [
    {
      "name": "Total Equity",
      "amount": "4685.00"
    }
  ],
  "total_equity": "4685.00"
}
```

**Balance Sheet Structure:**

```
BALANCE SHEET
As of: 2025-11-14T23:59:59Z

ASSETS
  Current Assets
    Cash                              $3,500.00
    Accounts Receivable               $1,200.00
    Inventory                           $485.00
  ────────────────────────────────────────────
  Total Assets                        $5,185.00

LIABILITIES
  Current Liabilities
    Accounts Payable                    $500.00
  ────────────────────────────────────────────
  Total Liabilities                     $500.00

EQUITY
  Owner's Capital                     $10,000.00
  Retained Earnings (Net Income)         $100.00
  Drawings/Withdrawals                 ($915.00)
  ────────────────────────────────────────────
  Total Equity                        $4,685.00

────────────────────────────────────────────
TOTAL LIABILITIES + EQUITY              $5,185.00
```

**Balance Sheet Equation:**
```
Assets = Liabilities + Equity
$5,185.00 = $500.00 + $4,685.00 ✓
```

**Calculation Method:**

```
ASSETS (ASSET account type):
  Debits - Credits = $5,250.00 - $65.00 = $5,185.00

LIABILITIES (LIABILITY account type):
  Credits - Debits = $500.00 - $0.00 = $500.00

EQUITY (EQUITY account type):
  Credits - Debits = $10,000.00 - $0.00 = $10,000.00

Plus: Net Income from current period = $100.00
Adjusting for withdrawals/distributions = ($915.00)

Total Equity = $10,000.00 + $100.00 - $915.00 = $4,685.00
```

---

## Integration Examples

### Example 1: Complete Transaction & Accounting Workflow

```bash
# Step 1: Create a transaction with items
POST /api/transactions/
{
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "device_id": "POS-001",
  "items": [
    {
      "batch_id": "990e8400-e29b-41d4-a716-446655440004",
      "quantity": 5,
      "price_at_sale": "15.00"
    }
  ]
}
# Response includes transaction_id and auto-created ledger entries

# Step 2: Record an expense
POST /api/expenses/
{
  "store_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Monthly rent",
  "amount": "1000.00"
}
# Response includes expense_id and auto-created ledger entries

# Step 3: View all ledger entries for the period
GET /api/ledger/entries?store_id=550e8400-e29b-41d4-a716-446655440000&start_date=2025-11-01T00:00:00Z&end_date=2025-11-30T23:59:59Z

# Step 4: Check financial reports
GET /api/ledger/trial-balance?store_id=550e8400-e29b-41d4-a716-446655440000
GET /api/ledger/income-statement?store_id=550e8400-e29b-41d4-a716-446655440000&start_date=2025-11-01T00:00:00Z&end_date=2025-11-30T23:59:59Z
GET /api/ledger/balance-sheet?store_id=550e8400-e29b-41d4-a716-446655440000&as_of_date=2025-11-30T23:59:59Z
```

### Example 2: Void Transaction & Restore Inventory

```bash
# Original transaction created with stock deductions
POST /api/transactions/
# Inventory: batch A had 100, now has 95 (5 sold)

# Customer wants to return items
POST /api/transactions/{transaction_id}/void
{
  "reason": "Customer returned defective items"
}

# Result:
# - Stock restored: batch A now has 100 again
# - Ledger entries removed
# - Transaction marked as voided
# - No trace in financial reports
```

### Example 3: Monthly Financial Close

```bash
# Run at end of month
GET /api/ledger/trial-balance?store_id=550e8400-e29b-41d4-a716-446655440000&as_of_date=2025-11-30T23:59:59Z

GET /api/ledger/income-statement?store_id=550e8400-e29b-41d4-a716-446655440000&start_date=2025-11-01T00:00:00Z&end_date=2025-11-30T23:59:59Z

GET /api/ledger/balance-sheet?store_id=550e8400-e29b-41d4-a716-446655440000&as_of_date=2025-11-30T23:59:59Z

# Verify:
# 1. Trial balance is balanced (debits = credits)
# 2. Income statement shows profitability
# 3. Balance sheet equation holds (Assets = Liabilities + Equity)
```

---

## Accounting Principles

### Double-Entry Bookkeeping

Every transaction affects at least two accounts:
- One account is debited
- One account is credited
- Total debits always equal total credits

**Example - Sales Transaction:**
```
Debit: Cash (Asset)         $100.00
Credit: Sales Revenue        $100.00
────────────────────────────────────
Debits = Credits ✓
```

**Example - Expense:**
```
Debit: Operating Expense      $50.00
Credit: Cash (Asset)          $50.00
────────────────────────────────────
Debits = Credits ✓
```

### Account Type Behavior

| Account Type | Normal Balance | Increases With | Decreases With |
|--------------|---|---|---|
| ASSET | Debit | Debit | Credit |
| LIABILITY | Credit | Credit | Debit |
| EQUITY | Credit | Credit | Debit |
| REVENUE | Credit | Credit | Debit |
| EXPENSE | Debit | Debit | Credit |

### Fundamental Accounting Equation

```
ASSETS = LIABILITIES + EQUITY
```

This equation must always balance. If it doesn't, there are errors in the ledger.

---

## Error Handling

All errors follow a consistent format with appropriate HTTP status codes.

### Standard Error Response
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Validation Error Response
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "name"],
      "msg": "String should have at least 1 character",
      "input": ""
    },
    {
      "type": "pattern_string_pattern_mismatch",
      "loc": ["body", "email"],
      "msg": "String should match pattern '^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$'",
      "input": "invalid-email"
    }
  ]
}
```

### Error Common Causes
| Error | Status | Cause |
|-------|--------|-------|
| Resource not found | 404 | ID doesn't exist or has been deleted |
| Invalid data | 400 | Validation failed or invalid request body |
| Unauthorized | 401 | Missing or invalid authentication token |
| Forbidden | 403 | Insufficient permissions |
| Conflict | 409 | Duplicate unique constraint (e.g., duplicate SKU) |
| Internal Server Error | 500 | Server-side error |

---

## Response Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, or DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid request data or validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User lacks permission for operation |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Constraint violation (e.g., duplicate SKU) |
| 422 | Unprocessable Entity | Request body validation error |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production deployment, consider:

- **Per-user rate limiting**: 1000 requests per hour
- **Per-endpoint rate limiting**: Adjust based on resource intensity
- **Burst allowance**: 50 requests per 60 seconds
- **Retry-After header**: Returned when rate limit exceeded

**Future Implementation:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{
  "detail": "Rate limit exceeded. Please try again in 60 seconds."
}
```

---

## Common Workflows

### 1. Create a Complete Product with Batch

```bash
# Step 1: Create a store
POST /api/stores/
{
  "name": "Main Store",
  "address": "123 Main St"
}
# Returns: store_id

# Step 2: Create a category with tax
POST /api/taxes/
{
  "tax_name": "Standard VAT",
  "tax_rate": "10.00"
}
# Returns: tax_id

POST /api/categories/
{
  "name": "Beverages",
  "tax_id": "tax_id_from_above"
}
# Returns: category_id

# Step 3: Create a warehouse
POST /api/warehouses/
{
  "name": "Main Warehouse",
  "store_id": "store_id_from_step_1"
}
# Returns: warehouse_id

# Step 4: Create a product
POST /api/products/
{
  "name": "Coca Cola 330ml",
  "sku": "COKE-330",
  "store_id": "store_id_from_step_1",
  "category_id": "category_id_from_step_2"
}
# Returns: product_id

# Step 5: Create a batch
POST /api/batches/
{
  "product_id": "product_id_from_step_4",
  "warehouse_id": "warehouse_id_from_step_3",
  "stock": 100,
  "cost": "10.00",
  "sale_price": "15.00",
  "supplier_name": "Coca Cola Co",
  "expire_date": "2026-12-31T00:00:00Z"
}
# Returns: batch with profit calculations
```

### 2. Monitor Inventory Health

```bash
# Get expiring batches
GET /api/batches/expiring?days=30

# Get low stock items
GET /api/batches/low-stock?threshold=50

# Get warehouse totals
GET /api/warehouses/
```

### 3. Update Pricing and Costs

```bash
# Update batch pricing
PUT /api/batches/{batch_id}
{
  "cost": "9.50",
  "sale_price": "16.00"
}
# Profit calculations automatically update
```

---

## Implementation Notes

### Database Relationships

```
Store (1) ──────────────── (M) Warehouse
  │
  └─── (1) ──────────────── (M) Product
          │
          └─── (1) ──────────────── (M) Category
                  │
                  └─── (1) ──────────────── (1) Tax

Warehouse (1) ──────────────── (M) Batch
  │
  └───── (M) ─────────────────── (1) Product
```

### Schema Compliance

All endpoints strictly validate input using Pydantic schemas:

- **[StoreCreate](../src/backend/app/schemas/store.py)** - Store creation validation
- **[WarehouseCreate](../src/backend/app/schemas/warehouse.py)** - Warehouse creation validation
- **[BatchCreate](../src/backend/app/schemas/batch.py)** - Batch creation with profit calculations
- **[ProductCreate](../src/backend/app/schemas/product.py)** - Product creation with category nesting
- **[TaxDetailCreate](../src/backend/app/schemas/tax.py)** - Tax rate validation (0-100)
- **[ProductCategoryCreate](../src/backend/app/schemas/category.py)** - Category with tax association

### CRUD Operations

All CRUD operations are implemented in:

- [src/backend/app/crud/store.py](../src/backend/app/crud/store.py)
- [src/backend/app/crud/warehouse.py](../src/backend/app/crud/warehouse.py)
- [src/backend/app/crud/batch.py](../src/backend/app/crud/batch.py)
- [src/backend/app/crud/product.py](../src/backend/app/crud/product.py)

### API Routes

All API endpoints are defined in:

- [src/backend/app/api/routes/store.py](../src/backend/app/api/routes/store.py)
- [src/backend/app/api/routes/warehouse.py](../src/backend/app/api/routes/warehouse.py)
- [src/backend/app/api/routes/batch.py](../src/backend/app/api/routes/batch.py)
- [src/backend/app/api/routes/product.py](../src/backend/app/api/routes/product.py)
- [src/backend/app/api/routes/expense.py](../src/backend/app/api/routes/expense.py)
- [src/backend/app/api/routes/expenses.py](../src/backend/app/api/routes/expenses.py)
- [src/backend/app/api/routes/ledger.py](../src/backend/app/api/routes/ledger.py)
- [src/backend/app/api/routes/transactions.py](../src/backend/app/api/routes/transactions.py)
---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-14 | Initial API documentation |

---

## Support

For issues or questions about the API:

1. Check this documentation first
2. Review the [Pydantic Schemas Guide](pydantic-schemas-guide.md)
3. Check the [Database Implementation Plan](database-implementation-plan.md)
4. Review implementation in [src/backend/app/](../src/backend/app/)

---

**Last Updated:** November 27, 2025  
**API Version:** 1.1  
