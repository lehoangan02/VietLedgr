import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class InviteCodeCreate(BaseModel):
    """Payload for creating an invite code.

    Frontend must provide the target role_id. store_id is
    optional and only used when the creator is an admin.
    """

    to_email: EmailStr
    role_id: uuid.UUID
    store_id: Optional[uuid.UUID] = None


class InviteCodeResponse(BaseModel):
    id: uuid.UUID
    plain_code: Optional[str] = None
    role_name: str
    store_name: str
    created_by_user_name: str
    used_at: Optional[datetime] = None
    created_at: datetime
    sent_to_email: EmailStr | None = None

    class Config:
        from_attributes = True


class InviteRole(BaseModel):
    id: uuid.UUID
    name: str
