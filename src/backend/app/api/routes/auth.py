from datetime import timedelta, datetime
from typing import Annotated, Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.crud.user import get_user_by_username, create_user, update_user, get_user_by_id
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserResetPassword
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.core.security import verify_password
from app.models import UserType

router = APIRouter(
    prefix="/auth",   # change from f"{settings.API_STR}/auth"
    tags=["auth"]
)


@router.post("/signup", response_model=dict)
def signup(
    *,
    session: SessionDep,
    user_in: UserCreate
) -> Any:
    """
    Create new user account
    """
    # Check if user exists
    user = get_user_by_username(session, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Create new user
    user = create_user(
        db=session,
        user=user_in
    )

    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.user_id), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.user_id),
        "username": user.username,
        "type": user.type
    }

@router.post("/login", response_model=dict)
def login(
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Any:
    """
    OAuth2 compatible token login, authenticate and get an access token for future requests
    """
    user = get_user_by_username(session, username=form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.user_id), expires_delta=access_token_expires
    )
    
    user_update = UserUpdate(last_login=datetime.utcnow())

    update_user(
        db=session,
        user=user_update,
        user_id=user.user_id
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/password-reset", response_model=dict)
def reset_password(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    password: UserResetPassword
) -> Any:
    """
    Reset user password
    """
    user = get_user_by_id(session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(password.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    user_update = UserUpdate(password=password.new_password)

    update_user(
        db=session,
        user=user_update,
        user_id=user_id
    )    
    
    return {"message": "Password updated successfully"}