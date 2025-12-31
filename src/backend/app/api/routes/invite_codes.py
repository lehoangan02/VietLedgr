from app.api.deps import CurrentUser, SessionDep
from app.core.mailer import send_invite_email
from app.crud.invite_code import (create_invite_code, list_all_invite_codes,
                                  list_invite_codes_for_store)
from app.models import Role
from app.schemas.invite_codes import (InviteCodeCreate, InviteCodeResponse,
                                      InviteRole)
from fastapi import APIRouter, HTTPException

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
        raise HTTPException(status_code=403, detail="Your role is not allowed")

    target_role = session.query(Role).filter(Role.role_id == payload.role_id).first()
    if target_role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    target_role_name = (target_role.name or "").strip().lower()
    if target_role_name == "admin":
        raise HTTPException(status_code=400, detail="Invite for Admin is not allowed")

    if creator_role_name == "admin":
        store_id = payload.store_id or current_user.store_id
    elif creator_role_name == "manager":
        if target_role_name != "cashier":
            raise HTTPException(
                status_code=403, detail="Manager can only invite Cashier"
            )
        store_id = current_user.store_id
    else:
        raise HTTPException(
            status_code=403, detail="Only admin and cashier can create invite code"
        )

    try:
        invite = create_invite_code(
            db=session,
            creator_user_id=current_user.user_id,
            target_role_id=payload.role_id,
            store_id=store_id,
        )
        send_invite_email(
            to_email=str(payload.to_email),
            invite_code=invite[1],
            role_name=invite[0].role.name,
            store_name=invite[0].store.name,
        )

        session.commit()
        session.refresh(invite[0])
    except Exception:
        session.rollback()
        raise HTTPException(status_code=502, detail="Failed to send invite email.")
    return InviteCodeResponse(
        id=invite[0].id,
        plain_code=invite[1],
        role_name=invite[0].role.name,
        created_by_user_name=invite[0].created_by.username,
        created_at=invite[0].created_at,
        store_name=invite[0].store.name,
        sent_to_email=payload.to_email,
    )


@router.get("", response_model=list[InviteCodeResponse])
def list_invites(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    include_used: bool = True,
    limit: int = 50,
    offset: int = 0,
):
    """List invite codes based on the current user's role.

    - Admin: sees invite codes for all stores.
    - Manager: sees invite codes for their own store.
    - Others: not allowed.

    Note: the original plain invite code is not stored in the database
    (only its hash and digest are kept), so this endpoint returns
    metadata about each invite. The "code" field in the response
    is a fixed placeholder value and should not be treated as the
    actual invite string.
    """

    role_name = (getattr(current_user.role, "name", "") or "").strip().lower()

    if role_name == "admin":
        invites = list_all_invite_codes(
            db=session,
            include_used=include_used,
            limit=limit,
            offset=offset,
        )
    elif role_name == "manager":
        invites = list_invite_codes_for_store(
            db=session,
            store_id=current_user.store_id,
            include_used=include_used,
            limit=limit,
            offset=offset,
        )
    else:
        raise HTTPException(status_code=403, detail="Not allowed")
    return [
        InviteCodeResponse(
            id=inv.id,
            role_name=inv.role.name,
            store_name=inv.store.name,
            created_by_user_name=inv.created_by.username,
            used_at=inv.used_at,
            created_at=inv.created_at,
        )
        for inv in invites
    ]


@router.get("/roles", response_model=list[InviteRole])
def list_invite_roles(
    *,
    session: SessionDep,
    current_user: CurrentUser,
):
    """Return roles that can be used as invite targets for the current user.

    - Admin: can invite Manager and Cashier.
    - Manager: can invite only Cashier.
    """

    creator_role_name = (getattr(current_user.role, "name", "") or "").strip().lower()

    query = session.query(Role)

    if creator_role_name == "admin":
        roles = query.filter(Role.name.in_(["Manager", "Cashier"])).all()
    elif creator_role_name == "manager":
        roles = query.filter(Role.name.ilike("cashier")).all()
    else:
        raise HTTPException(status_code=403, detail="Not allowed")

    return [InviteRole(id=role.role_id, name=role.name) for role in roles]
