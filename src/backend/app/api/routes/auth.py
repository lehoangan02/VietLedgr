import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.core.invite_codes import verify_invite_code
from app.core.security import verify_password
from app.crud.invite_code import consume_invite_code, get_unused_invite_by_code
from app.crud.user import (create_user, get_user_by_id, get_user_by_username,
                           update_user)
from app.models import User
from app.schemas.user import UserCreate, UserResetPassword, UserUpdate
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=dict)
def signup(*, session: SessionDep, user_in: UserCreate) -> Any:
    user = get_user_by_username(session, username=user_in.username)
    if user:
        raise HTTPException(status_code=400, detail="Username already registered")

    invite = get_unused_invite_by_code(db=session, code_plain=user_in.invite_code)
    if not invite or not verify_invite_code(user_in.invite_code, invite.code_hash):
        raise HTTPException(status_code=400, detail="Invalid invite code")

    if not consume_invite_code(session, invite_id=invite.id):
        raise HTTPException(status_code=400, detail="Invite code already used")

    user = create_user(
        db=session,
        user=user_in,
        store_id=invite.store_id,
        role_id=invite.role_id,
        commit=False,
    )

    session.commit()
    session.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.user_id), expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.user_id),
        "username": user.username,
        "role_id": str(user.role_id),
        "role_name": user.role.name,
    }


@router.post("/login", response_model=dict)
def login(
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Any:
    user = get_user_by_username(session, username=form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.user_id), expires_delta=access_token_expires
    )

    user_update = UserUpdate(last_login=datetime.now(timezone.utc))
    update_user(db=session, user=user_update, user_id=user.user_id)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/password-reset", response_model=dict)
def reset_password(
    *, session: SessionDep, user_id: uuid.UUID, password: UserResetPassword
) -> Any:
    user = get_user_by_id(session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    user_update = UserUpdate(password=password.new_password)
    update_user(db=session, user=user_update, user_id=user_id)
    return {"message": "Password updated successfully"}
