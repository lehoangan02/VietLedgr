from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field


class BatchBase(BaseModel):
    product_id: UUID
    warehouse_id: UUID
    stock: int = Field(..., ge=0)
    cost: Decimal
    sale_price: Decimal
    supplier_id: UUID | None = None
    expire_date: datetime | None = None


class BatchCreate(BatchBase):
    import_date: datetime | None = None


class BatchUpdate(BaseModel):
    stock: int | None = Field(None, ge=0)
    cost: Decimal | None = None
    sale_price: Decimal | None = None
    supplier_id: UUID | None = None
    expire_date: datetime | None = None


class BatchResponse(BatchBase):
    batch_id: UUID
    import_date: datetime
    created_at: datetime
    updated_at: datetime

    supplier_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class BatchList(BaseModel):
    items: list[BatchResponse]
    total: int
