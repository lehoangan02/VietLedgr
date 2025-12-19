from app.api.deps import CurrentUser
from fastapi import APIRouter
router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me", response_model=dict)
def read_current_user(
    current_user: CurrentUser,
) -> dict:
    """
    Get current logged-in user details
    """
    return {
        "user_id": str(current_user.user_id),
        "username": current_user.username,
        "role_id": str(current_user.role_id),
        "role_name": str(current_user.role.name),
    }

@router.get("/me/store", response_model=dict)
def get_my_store(current_user: CurrentUser):
    return {
        "store_id": str(current_user.store_id)
    }