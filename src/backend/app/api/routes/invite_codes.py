import uuid 

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, SessionDep
from app.core.invite_codes import generate_invite_code
from app.crud.invite_code import create_invite_code
from app.models import Role
from app.schemas.invite_codes import InviteCodeCreate, InviteCodeResponse

router = APIRouter(prefix="/invite-codes", tags=["invite-codes"])

@router.post("", response_model=InviteCodeResponse)
def create_invite(
  *,
  session: SessionDep,
  current_user: CurrentUser,
  payload: InviteCodeCreate,
):
  creator_role_name = (getattr(current_user.role, "name", "") or "").strip().lower()
  if creator_role_name not in {"admin", "manager"}:
    raise HTTPException(status_code=403, detail="Not allowed")
  
  target_role = session.query(Role).filter(Role.role_id == payload.role_id).first()
  if not target_role:
    raise HTTPException(status_code=404, detail="Role not found")
  
  target_role_name = (target_role.name or "").strip().lower()
  if target_role_name == "admin":
    raise HTTPException(status_code=400, detail="Invite for Admin is not allowed")
  
  if creator_role_name == "admin":
    store_id = payload.store_id or current_user.store_id 
  elif creator_role_name == "manager":
    if target_role_name != "cashier":
      raise HTTPException(status_code=403, detail="Manager can only invite Cashier")
    store_id = current_user.store_id
  else:
    raise HTTPException(status_code=403, detail="Only admin and cashier can create invite code")
    
  invite = create_invite_code(
    db=session,
    creator_user_id=current_user.user_id,
    target_role_id=payload.role_id,
    store_id=store_id,
  )
  
  return InviteCodeResponse(
    id=invite[0].id,
    code=invite[1],
    role_id=invite[0].role_id,
    created_by_user_id=invite[0].created_by_user_id,
    created_at=invite[0].created_at,
    store_id=invite[0].store_id
  )