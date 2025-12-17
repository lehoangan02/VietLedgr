import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, validator


class ExpenseCreate(BaseModel):
    """Schema for creating expenses"""
    store_id: uuid.UUID
    description: str = Field(..., min_length=1, max_length=500)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    expense_date: datetime | None = Field(None)

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()


class ExpenseUpdate(BaseModel):
    """Schema for updating expenses"""
    description: str | None = Field(None, max_length=500)
    amount: Decimal | None = Field(None, gt=0)
    expense_date: datetime | None = None


class ExpenseResponse(BaseModel):
    """Schema for expense responses"""
    expense_id: uuid.UUID
    store_id: uuid.UUID
    user_id: uuid.UUID
    description: str
    amount: Decimal
    expense_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseDetailResponse(ExpenseResponse):
    """Extended expense response with user details"""
    username: str | None = None
    store_name: str | None = None


class ExpenseListResponse(BaseModel):
    """Paginated expense list response"""
    items: list[ExpenseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============================================================================
# LEDGER SCHEMAS
# ============================================================================


class GeneralLedgerEntryResponse(BaseModel):
    """Schema for ledger entry responses"""
    entry_id: uuid.UUID
    store_id: uuid.UUID
    account_type: str
    transaction_id: uuid.UUID | None
    expense_id: uuid.UUID | None
    entry_date: datetime
    description: str
    debit_amount: Decimal
    credit_amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class LedgerEntryListResponse(BaseModel):
    """Paginated ledger entry list"""
    items: list[GeneralLedgerEntryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TrialBalanceEntry(BaseModel):
    """Trial balance entry"""
    account_type: str
    debit_total: Decimal
    credit_total: Decimal


class TrialBalanceResponse(BaseModel):
    """Trial balance report"""
    store_id: uuid.UUID
    as_of_date: datetime
    entries: list[TrialBalanceEntry]
    total_debits: Decimal
    total_credits: Decimal
    is_balanced: bool


class IncomeStatementEntry(BaseModel):
    """Income statement line item"""
    category: str
    amount: Decimal


class IncomeStatementResponse(BaseModel):
    """Profit & Loss statement"""
    store_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    revenue: Decimal
    cost_of_goods_sold: Decimal
    gross_profit: Decimal
    expenses: list[IncomeStatementEntry]
    total_expenses: Decimal
    net_income: Decimal


class BalanceSheetAsset(BaseModel):
    """Balance sheet asset"""
    name: str
    amount: Decimal


class BalanceSheetLiability(BaseModel):
    """Balance sheet liability"""
    name: str
    amount: Decimal


class BalanceSheetEquity(BaseModel):
    """Balance sheet equity"""
    name: str
    amount: Decimal


class BalanceSheetResponse(BaseModel):
    """Balance sheet report"""
    store_id: uuid.UUID
    as_of_date: datetime
    assets: list[BalanceSheetAsset]
    total_assets: Decimal
    liabilities: list[BalanceSheetLiability]
    total_liabilities: Decimal
    equity: list[BalanceSheetEquity]
    total_equity: Decimal