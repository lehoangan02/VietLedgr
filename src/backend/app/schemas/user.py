import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RoleResponse(BaseModel):
    role_id: uuid.UUID
    name: str
    description: Optional[str] = None


class UserBase(BaseModel):
    username: str
    store_id: uuid.UUID
    role_id: uuid.UUID


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    store_id: Optional[uuid.UUID] = None
    role_id: Optional[uuid.UUID] = None


class UserResetPassword(BaseModel):
    current_password: str
    new_password: str


class UserResponse(UserBase):
    user_id: uuid.UUID
    last_login: Optional[datetime] = None
    created_at: datetime
    role: Optional[RoleResponse] = None

    class Config:
        from_attributes = True
