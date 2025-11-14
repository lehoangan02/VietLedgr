from pydantic import BaseModel
from datetime import datetime
from typing import Generic, TypeVar

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

T = TypeVar('T')
class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response"""
    items: list[T]
    total: int
    skip: int
    limit: int