import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel
from sqlalchemy import (
    UUID,
    TIMESTAMP,
    CheckConstraint,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .core.database import Base


# ============================================================================
# ENUMS
# ============================================================================


class UserType(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    CASHIER = "CASHIER"


class AccountType(str, Enum):
    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"

class RetailCategory(str, Enum):
    FOOD = "FOOD"
    HOUSEHOLD = "HOUSEHOLD"
    STAIONERY = "STATIONERY"
    OTHERS = "OTHERS"


# ============================================================================
# PYDANTIC MODELS (for JWT, etc.)
# ============================================================================


class TokenPayload(BaseModel):
    sub: str | None = None


# ============================================================================
# SQLALCHEMY MODELS
# ============================================================================


class Store(Base):
    """Store/branch locations"""
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships - all back_populates will be defined in their respective models
    users: Mapped[list["User"]] = relationship(
        "User", back_populates="store", cascade="all, delete-orphan"
    )
    products: Mapped[list["Product"]] = relationship(
        "Product", back_populates="store", cascade="all, delete-orphan"
    )
    warehouses: Mapped[list["Warehouse"]] = relationship(
        "Warehouse", back_populates="store", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="store", cascade="all, delete-orphan"
    )
    expenses: Mapped[list["Expense"]] = relationship(
        "Expense", back_populates="store", cascade="all, delete-orphan"
    )
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship(
        "GeneralLedgerEntry", back_populates="store", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Store(id={self.id}, name='{self.name}')>"


class Role(Base):
    """User roles and permissions"""
    __tablename__ = "roles"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="role")

    def __repr__(self) -> str:
        return f"<Role(role_id={self.role_id}, name='{self.name}')>"


class User(Base):
    """User accounts and authentication"""
    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.role_id", ondelete="RESTRICT"), nullable=False
    )
    type: Mapped[UserType] = mapped_column(SQLEnum(UserType), nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    store: Mapped["Store"] = relationship("Store", back_populates="users")
    role: Mapped["Role"] = relationship("Role", back_populates="users")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="user"
    )
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="user")

    def __repr__(self) -> str:
        return f"<User(user_id={self.user_id}, username='{self.username}')>"


class TaxDetail(Base):
    """Tax rates and details"""
    __tablename__ = "tax_details"

    tax_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tax_name: Mapped[str] = mapped_column(String(100), nullable=False)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    tax_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    categories: Mapped[list["ProductCategory"]] = relationship(
        "ProductCategory", back_populates="tax"
    )

    __table_args__ = (
        CheckConstraint("tax_rate >= 0 AND tax_rate <= 100", name="check_tax_rate"),
    )

    def __repr__(self) -> str:
        return f"<TaxDetail(tax_id={self.tax_id}, name='{self.tax_name}', rate={self.tax_rate})>"


class ProductCategory(Base):
    """Product classification categories"""
    __tablename__ = "product_categories"

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    tax_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tax_details.tax_id", ondelete="SET NULL"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    tax: Mapped["TaxDetail | None"] = relationship(
        "TaxDetail", back_populates="categories"
    )
    products: Mapped[list["Product"]] = relationship(
        "Product", back_populates="category"
    )

    def __repr__(self) -> str:
        return f"<ProductCategory(category_id={self.category_id}, name='{self.name}')>"


class Product(Base):
    """Product master data"""
    __tablename__ = "products"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("product_categories.category_id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    retail_category: Mapped[RetailCategory] = mapped_column(String(50), nullable=False)

    image_base64: Mapped[str | None] = mapped_column(Text, nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    store: Mapped["Store"] = relationship("Store", back_populates="products")
    category: Mapped["ProductCategory | None"] = relationship(
        "ProductCategory", back_populates="products"
    )
    batches: Mapped[list["Batch"]] = relationship(
        "Batch", back_populates="product", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Product(product_id={self.product_id}, name='{self.name}', sku='{self.sku}')>"


class Warehouse(Base):
    """Storage locations for inventory"""
    __tablename__ = "warehouses"

    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    store: Mapped["Store"] = relationship("Store", back_populates="warehouses")
    batches: Mapped[list["Batch"]] = relationship(
        "Batch", back_populates="warehouse", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Warehouse(warehouse_id={self.warehouse_id}, name='{self.name}')>"


class Batch(Base):
    """Inventory lots/batches with cost and pricing"""
    __tablename__ = "batches"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False
    )
    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("warehouses.warehouse_id", ondelete="CASCADE"), nullable=False
    )
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    sale_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    import_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )
    expire_date: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    supplier_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="batches")
    warehouse: Mapped["Warehouse"] = relationship("Warehouse", back_populates="batches")
    transaction_items: Mapped[list["TransactionItem"]] = relationship(
        "TransactionItem", back_populates="batch"
    )

    __table_args__ = (
        CheckConstraint("stock >= 0", name="check_stock_positive"),
        CheckConstraint("cost >= 0", name="check_cost_positive"),
        CheckConstraint("sale_price >= 0", name="check_sale_price_positive"),
    )

    def __repr__(self) -> str:
        return f"<Batch(batch_id={self.batch_id}, product_id={self.product_id}, stock={self.stock})>"


class Transaction(Base):
    """Sales transactions (receipts)"""
    __tablename__ = "transactions"

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    device_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )
    total_tax: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    store: Mapped["Store"] = relationship("Store", back_populates="transactions")
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    items: Mapped[list["TransactionItem"]] = relationship(
        "TransactionItem", back_populates="transaction", cascade="all, delete-orphan"
    )
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship(
        "GeneralLedgerEntry", back_populates="transaction"
    )

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="check_total_amount_positive"),
        CheckConstraint("total_tax >= 0", name="check_total_tax_positive"),
    )

    def __repr__(self) -> str:
        return f"<Transaction(transaction_id={self.transaction_id}, total={self.total_amount})>"


class TransactionItem(Base):
    """Line items for each transaction"""
    __tablename__ = "transaction_items"

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.transaction_id", ondelete="CASCADE"), nullable=False
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price_at_sale: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    cost_at_sale: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="items"
    )
    batch: Mapped["Batch"] = relationship("Batch", back_populates="transaction_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
        CheckConstraint("price_at_sale >= 0", name="check_price_positive"),
        CheckConstraint("cost_at_sale >= 0", name="check_cost_positive"),
    )

    def __repr__(self) -> str:
        return f"<TransactionItem(item_id={self.item_id}, qty={self.quantity}, price={self.price_at_sale})>"


class Expense(Base):
    """Business expenses (non-inventory costs)"""
    __tablename__ = "expenses"

    expense_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    expense_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    store: Mapped["Store"] = relationship("Store", back_populates="expenses")
    user: Mapped["User"] = relationship("User", back_populates="expenses")
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship(
        "GeneralLedgerEntry", back_populates="expense"
    )

    __table_args__ = (CheckConstraint("amount >= 0", name="check_amount_positive"),)

    def __repr__(self) -> str:
        return f"<Expense(expense_id={self.expense_id}, amount={self.amount})>"


class GeneralLedgerEntry(Base):
    """Double-entry bookkeeping ledger"""
    __tablename__ = "general_ledger_entries"

    entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    account_type: Mapped[AccountType] = mapped_column(
        SQLEnum(AccountType), nullable=False
    )
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("transactions.transaction_id", ondelete="CASCADE"), nullable=True
    )
    expense_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("expenses.expense_id", ondelete="CASCADE"), nullable=True
    )
    entry_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    debit_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )
    credit_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    store: Mapped["Store"] = relationship("Store", back_populates="ledger_entries")
    transaction: Mapped["Transaction | None"] = relationship(
        "Transaction", back_populates="ledger_entries"
    )
    expense: Mapped["Expense | None"] = relationship(
        "Expense", back_populates="ledger_entries"
    )

    __table_args__ = (
        CheckConstraint("debit_amount >= 0", name="check_debit_positive"),
        CheckConstraint("credit_amount >= 0", name="check_credit_positive"),
        CheckConstraint(
            "(debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0)",
            name="check_debit_or_credit",
        ),
    )

    def __repr__(self) -> str:
        return f"<GeneralLedgerEntry(entry_id={self.entry_id}, type={self.account_type}, debit={self.debit_amount}, credit={self.credit_amount})>" 