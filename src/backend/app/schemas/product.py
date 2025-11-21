from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from.category import ProductCategoryResponse


class ProductBase(BaseModel):
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
  product_id: UUID
  store_id: UUID
  created_at: datetime
  updated_at: datetime
  category: ProductCategoryResponse | None = None
  
  model_config = ConfigDict(from_attributes=True)
    
class ProductWithBatches(ProductBase):
  """Product with batch information"""
  total_stock: int = Field(..., description="Total stock accross all batches")
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