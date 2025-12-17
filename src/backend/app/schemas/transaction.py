import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, validator


class TransactionItemCreate(BaseModel):
    """Schema for creating transaction items"""
    batch_id: uuid.UUID
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    price_at_sale: Decimal = Field(..., ge=0, description="Price must be non-negative")

    @validator('price_at_sale')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price cannot be negative')
        return v


class TransactionItemResponse(BaseModel):
    """Schema for transaction item responses"""
    item_id: uuid.UUID
    batch_id: uuid.UUID
    quantity: int
    price_at_sale: Decimal
    cost_at_sale: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    """Schema for creating transactions"""
    store_id: uuid.UUID
    device_id: str | None = Field(None, max_length=100)
    items: list[TransactionItemCreate] = Field(..., min_items=1)

    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise ValueError('Transaction must have at least one item')
        return v


class TransactionUpdate(BaseModel):
    """Schema for updating transaction (void/cancel)"""
    reason: str | None = Field(None, max_length=500)


class TransactionResponse(BaseModel):
    """Schema for transaction responses"""
    transaction_id: uuid.UUID
    store_id: uuid.UUID
    user_id: uuid.UUID
    device_id: str | None
    total_amount: Decimal
    total_tax: Decimal
    created_at: datetime
    items: list[TransactionItemResponse]

    class Config:
        from_attributes = True


class TransactionDetailResponse(TransactionResponse):
    """Extended transaction response with additional details"""
    store_name: str | None = None
    username: str | None = None


class TransactionSummary(BaseModel):
    """Schema for transaction summary/reports"""
    total_transactions: int
    total_amount: Decimal
    total_tax: Decimal
    total_items: int
    average_transaction: Decimal
    date_range_start: datetime
    date_range_end: datetime


class TransactionListResponse(BaseModel):
    """Paginated transaction list response"""
    items: list[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int