from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SupplierBase(BaseModel):
    name: str
    avatar_url: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None


class SupplierResponse(SupplierBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
