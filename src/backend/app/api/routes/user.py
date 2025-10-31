from fastapi import APIRouter
from app.api.deps import CurrentUser

router = APIRouter(
    prefix="/user",
    tags=["user"]
)

@router.get("/me", response_model=dict)
def read_current_user(
    current_user: CurrentUser,
) -> dict:
    """
    Get current logged-in user details
    """
    return {
        "user_id": str(current_user.id),
        "username": current_user.username,
        "type": current_user.type
    }