from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from .tax import TaxDetailResponse

class ProductCategoryBase(BaseModel):
  name: str = Field(..., min_length=1, max_length=100, description="Category name")
  description: str | None = Field(None, max_length=500, description="Category, description")
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
  
  model_config = ConfigDict(from_attributes=True)
    
class ProductCategoryList(BaseModel):
  """Paginated category list"""
  items: list[ProductCategoryResponse]
  total: int