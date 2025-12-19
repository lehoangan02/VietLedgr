import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InviteCodeCreate(BaseModel):
  """Payload for creating an invite code.

  Frontend must provide the target role_id. store_id is
  optional and only used when the creator is an admin.
  """

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
  
  class Config:
    from_attributes = True


class InviteRole(BaseModel):
  id: uuid.UUID
  name: str
