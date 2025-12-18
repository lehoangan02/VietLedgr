import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

class InviteCodeCreate(BaseModel):
  role_id: uuid.UUID
  store_id: Optional[uuid.UUID] = None
  
class InviteCodeResponse(BaseModel):
  id: uuid.UUID
  code: str = Field(..., min_length=8, max_length=8)
  role_id: uuid.UUID
  store_id: uuid.UUID
  created_by_user_id: uuid.UUID
  used_at: Optional[datetime] = None
  created_at: datetime
  
  class Config:
    from_attributes = True