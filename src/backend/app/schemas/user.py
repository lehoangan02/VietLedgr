from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from uuid import UUID

class UserBase(BaseModel):
    """Base User Information"""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    user_type: str = Field(..., description="Type of user")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")

class UserResetPassword(BaseModel):
    """Password reset request"""
    old_password: str = Field(..., min_length=6, description="Current password of the user")
    new_password: str = Field(..., min_length=6, description="New password for the user")

class UserCreate(UserBase):
    """Create user request (POST)"""
    password: str = Field(..., min_length=6, description="User password")
    store_id: UUID | None = Field(None, description="Associated store ID")
    role_id: UUID | None = Field(None, description="Associated role ID")

class UserUpdate(BaseModel):
    """Update user request - all fields optional (PUT)"""
    username: str | None = Field(None, min_length=3, max_length=50)
    password: str | None = Field(None, min_length=6)
    user_type: str | None = Field(None)
    store_id: UUID | None = Field(None)
    role_id: UUID | None = Field(None)


class UserResponse(UserBase):
    """User response"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



class UserList(BaseModel):
    """Paginated user list"""
    items: list[UserResponse]
    total: int
    skip: int
    limit: int
  