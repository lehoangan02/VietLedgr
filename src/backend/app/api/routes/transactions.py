import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.transaction import TransactionCRUD
from app.models import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionDetailResponse,
    TransactionListResponse,
    TransactionSummary,
    TransactionUpdate,
)

router = APIRouter(
    prefix="/api/transactions",
    tags=["transactions"],
)


@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new transaction with items.

    - **store_id**: Store where transaction occurs
    - **device_id**: Optional device identifier (e.g., POS terminal)
    - **items**: List of items with batch_id, quantity, and price_at_sale

    Returns the created transaction with all items.
    """
    try:
        # Verify user belongs to the store
        if current_user.store_id != transaction.store_id:
            raise HTTPException(
                status_code=403,
                detail="User does not have access to this store",
            )

        created_transaction = TransactionCRUD.create_transaction_with_items(
            db=db,
            transaction=transaction,
            user_id=current_user.user_id,
        )

        return created_transaction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{transaction_id}", response_model=TransactionDetailResponse)
def get_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get transaction details by ID.

    Returns the transaction with all items and related information.
    """
    transaction = TransactionCRUD.get_transaction(db, transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Verify user has access to this store
    if current_user.store_id != transaction.store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this transaction",
        )

    return transaction


@router.get("/", response_model=TransactionListResponse)
def list_transactions(
    store_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get paginated list of transactions for a store.

    - **page**: Page number (starting from 1)
    - **page_size**: Number of items per page (1-100)
    """
    # Verify user has access to this store
    if current_user.store_id != store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this store",
        )

    skip = (page - 1) * page_size
    transactions, total = TransactionCRUD.get_transactions(
        db=db,
        store_id=store_id,
        skip=skip,
        limit=page_size,
    )

    total_pages = (total + page_size - 1) // page_size

    return TransactionListResponse(
        items=transactions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/summary/report", response_model=TransactionSummary)
def get_transaction_summary(
    store_id: uuid.UUID,
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get transaction summary for reporting.

    - **start_date**: Start date for summary (defaults to 30 days ago)
    - **end_date**: End date for summary (defaults to now)

    Returns aggregated transaction statistics.
    """
    # Verify user has access to this store
    if current_user.store_id != store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this store",
        )

    # Default date range: last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    summary = TransactionCRUD.get_transaction_summary(
        db=db,
        store_id=store_id,
        start_date=start_date,
        end_date=end_date,
    )

    return summary


@router.post("/{transaction_id}/void", response_model=dict)
def void_transaction(
    transaction_id: uuid.UUID,
    update_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Void/cancel a transaction and restore stock.

    This operation:
    - Restores inventory to all batches
    - Removes transaction items
    - Removes associated ledger entries
    - Deletes the transaction record
    """
    transaction = TransactionCRUD.get_transaction(db, transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Verify user has access to this store
    if current_user.store_id != transaction.store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this transaction",
        )

    try:
        TransactionCRUD.void_transaction(db, transaction_id)
        return {
            "message": "Transaction voided successfully",
            "transaction_id": str(transaction_id),
            "reason": update_data.reason,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))