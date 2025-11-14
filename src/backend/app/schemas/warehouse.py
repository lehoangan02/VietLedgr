from pydantic import BaseModel, Field, ConfigDict
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
    
    model_config = ConfigDict(from_attributes=True)

class WarehouseList(BaseModel):
    """Paginated warehouse list"""
    items: list[WarehouseResponse]
    total: int