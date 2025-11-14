from pydantic import BaseModel, Field, ConfigDict
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
  
  model_config = ConfigDict(from_attributes=True)

class TaxDetailList(BaseModel):
  items: list[TaxDetailResponse]
  total: int