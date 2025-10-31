from datetime import timedelta, datetime
from typing import Annotated, Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app import crud
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.core.security import verify_password
from app.models import UserType

router = APIRouter(
    prefix="/auth",   # change from f"{settings.API_STR}/auth"
    tags=["auth"]
)

# Schema for signup
class UserSignup(BaseModel):
    username: str
    password: str
    userType: UserType

# Schema for password reset
class PasswordReset(BaseModel):
    current_password: str
    new_password: str

@router.post("/signup", response_model=dict)
def signup(
    *,
    session: SessionDep,
    user_in: UserSignup,
) -> Any:
    """
    Create new user account
    """
    # Check if user exists
    user = crud.get_user_by_username(session, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Create new user
    user = crud.create_user(
        db=session,
        username=user_in.username,
        password=user_in.password,
        type=user_in.userType,
        last_login=datetime.utcnow().isoformat()
    )

    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
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
    user = crud.get_user_by_username(session, username=form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    crud.update_user(
        db=session,
        user_id=user.id,
        user_in={"last_login": datetime.utcnow().isoformat()}
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
    passwords: PasswordReset,
) -> Any:
    """
    Reset user password
    """
    user = crud.get_user_by_id(session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(passwords.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    crud.update_user(
        db=session,
        user_id=user.id,
        user_in={"password": passwords.new_password}
    )    
    
    return {"message": "Password updated successfully"}