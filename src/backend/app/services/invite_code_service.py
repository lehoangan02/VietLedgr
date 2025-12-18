import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.api.deps import CurrentUser
from app.crud.invite_code import create_invite_code, get_role_by_id

def create_invite_code_for_role(
  db: Session,
  *,
  current_user: CurrentUser,
  target_role_id: uuid.UUID,
  store_id: uuid.UUID, 
):
  creator_role = (current_user.role.name or "").lower()
  target_role = get_role_by_id(db, target_role_id)
  
  if target_role is None:
    raise HTTPException(status_code=404, detail="role does not exist")
  
  target_role_name = str(target_role).lower()
  if target_role_name == "admin":
    raise HTTPException(status_code=403, detail="Admin cannot be created")
  
  if creator_role == "admin":
    pass
  elif creator_role == "manager":
    if target_role_name != "cashier":
      raise HTTPException(status_code=403, detail="Manager cannot create this role")
    if str(current_user.store_id) != str(store_id):
      raise HTTPException(status_code=403, detail="Manager can only create cashier for their own store")
  else:
    raise HTTPException(status_code=403, detail="Only admin and manager can create invite code") 
  return create_invite_code(
    db=db,
    creator_user_id=current_user.user_id,
    target_role_id=target_role_id,
    store_id=store_id
  )