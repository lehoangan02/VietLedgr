from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID

class StoreBase(BaseModel):
  """Base Store Information"""
  name: str = Field(..., min_length=1, max_length=255, description="Store name")
  address: str | None = Field(None, max_length=500, description="Store address")
  phone: str | None = Field(None, max_length=20, pattern=r"^\+?1?\d{9,15}$", description="Phone number")
  email: str | None = Field(None, pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$", description="Email address")
  
class StoreCreate(StoreBase):
  """Create store request (POST)"""
  pass

class StoreUpdate(BaseModel):
  """Update store request - all fields optional (PUT)"""
  name: str | None = Field(None, min_length=1, max_length=255)
  address: str | None = Field(None, max_length=500)
  phone: str | None = Field(None, max_length=20)
  email: str | None = Field(None)
  
class StoreResponse(StoreBase):
  """Store response"""
  id: UUID
  created_at: datetime
  updated_at: datetime
  
  model_config = ConfigDict(from_attributes=True)

class StoreList(BaseModel):
  """Paginated store list"""
  items: list[StoreResponse]
  total: int
  skip: int
  limit: int