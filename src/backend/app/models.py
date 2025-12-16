import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel
from sqlalchemy import (
    UUID,
    TIMESTAMP,
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .core.database import Base


# ============================================================================
# PYDANTIC MODELS (for JWT, etc.)
# ============================================================================


class TokenPayload(BaseModel):
    sub: str | None = None


# ============================================================================
# POSTGRES ENUMS
# ============================================================================


class AccountType(str, Enum):
    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"


# IMPORTANT: Enum type đã được tạo bởi migration/SQL script => create_type=False
account_type_enum = PGEnum(
    AccountType,
    name="account_type",
    create_type=False,
)


# ============================================================================
# SQLALCHEMY MODELS
# ============================================================================


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    users: Mapped[list["User"]] = relationship("User", back_populates="store")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="store")
    warehouses: Mapped[list["Warehouse"]] = relationship("Warehouse", back_populates="store")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="store")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="store")
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship(
        "GeneralLedgerEntry", back_populates="store"
    )


class Role(Base):
    __tablename__ = "roles"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    users: Mapped[list["User"]] = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)

    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.role_id", ondelete="RESTRICT"),
        nullable=False,
    )

    last_login: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="users")
    role: Mapped["Role"] = relationship("Role", back_populates="users")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="user")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="user")

    __table_args__ = (
        Index("idx_users_username", "username"),
        Index("idx_users_store_id", "store_id"),
        Index("idx_users_role_id", "role_id"),
    )


class TaxDetail(Base):
    __tablename__ = "tax_details"

    tax_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tax_name: Mapped[str] = mapped_column(String(100), nullable=False)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    tax_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    categories: Mapped[list["ProductCategory"]] = relationship(
        "ProductCategory", back_populates="tax"
    )

    __table_args__ = (
        CheckConstraint("tax_rate >= 0 AND tax_rate <= 100", name="check_tax_rate"),
    )


class ProductCategory(Base):
    __tablename__ = "product_categories"

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    tax_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tax_details.tax_id", ondelete="SET NULL"),
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    tax: Mapped["TaxDetail | None"] = relationship("TaxDetail", back_populates="categories")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("product_categories.category_id", ondelete="SET NULL"),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="products")
    category: Mapped["ProductCategory | None"] = relationship("ProductCategory", back_populates="products")
    batches: Mapped[list["Batch"]] = relationship("Batch", back_populates="product")

    __table_args__ = (
        Index("idx_products_store_id", "store_id"),
        Index("idx_products_category_id", "category_id"),
        Index("idx_products_sku", "sku"),
        Index("idx_products_name", "name"),
    )


class Warehouse(Base):
    __tablename__ = "warehouses"

    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="warehouses")
    batches: Mapped[list["Batch"]] = relationship("Batch", back_populates="warehouse")


class Batch(Base):
    __tablename__ = "batches"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
    )
    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("warehouses.warehouse_id", ondelete="CASCADE"),
        nullable=False,
    )

    stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    sale_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    import_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    expire_date: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
    supplier_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    product: Mapped["Product"] = relationship("Product", back_populates="batches")
    warehouse: Mapped["Warehouse"] = relationship("Warehouse", back_populates="batches")
    transaction_items: Mapped[list["TransactionItem"]] = relationship("TransactionItem", back_populates="batch")

    __table_args__ = (
        CheckConstraint("stock >= 0", name="batches_stock_check"),
        CheckConstraint("cost >= 0", name="batches_cost_check"),
        CheckConstraint("sale_price >= 0", name="batches_sale_price_check"),
        Index("idx_batches_product_id", "product_id"),
        Index("idx_batches_warehouse_id", "warehouse_id"),
        Index("idx_batches_expire_date", "expire_date"),
        Index("idx_batches_stock", "stock", postgresql_where=text("stock > 0")),
    )


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=False,
    )

    device_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))
    total_tax: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="transactions")
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    items: Mapped[list["TransactionItem"]] = relationship("TransactionItem", back_populates="transaction")
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship("GeneralLedgerEntry", back_populates="transaction")

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="transactions_total_amount_check"),
        CheckConstraint("total_tax >= 0", name="transactions_total_tax_check"),
        Index("idx_transactions_store_id", "store_id"),
        Index("idx_transactions_user_id", "user_id"),
        Index("idx_transactions_created_at", "created_at"),
    )


class TransactionItem(Base):
    __tablename__ = "transaction_items"

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.transaction_id", ondelete="CASCADE"),
        nullable=False,
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("batches.batch_id", ondelete="RESTRICT"),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price_at_sale: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    cost_at_sale: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="items")
    batch: Mapped["Batch"] = relationship("Batch", back_populates="transaction_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="transaction_items_quantity_check"),
        CheckConstraint("price_at_sale >= 0", name="transaction_items_price_check"),
        CheckConstraint("cost_at_sale >= 0", name="transaction_items_cost_check"),
        Index("idx_transaction_items_transaction_id", "transaction_id"),
        Index("idx_transaction_items_batch_id", "batch_id"),
    )


class Expense(Base):
    __tablename__ = "expenses"

    expense_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    expense_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="expenses")
    user: Mapped["User"] = relationship("User", back_populates="expenses")
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship("GeneralLedgerEntry", back_populates="expense")

    __table_args__ = (
        CheckConstraint("amount >= 0", name="expenses_amount_check"),
        Index("idx_expenses_store_id", "store_id"),
        Index("idx_expenses_user_id", "user_id"),
        Index("idx_expenses_expense_date", "expense_date"),
    )


class GeneralLedgerEntry(Base):
    __tablename__ = "general_ledger_entries"

    entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )

    account_type: Mapped[AccountType] = mapped_column(account_type_enum, nullable=False)

    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.transaction_id", ondelete="CASCADE"),
        nullable=True,
    )
    expense_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("expenses.expense_id", ondelete="CASCADE"),
        nullable=True,
    )

    entry_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)

    debit_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))
    credit_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="ledger_entries")
    transaction: Mapped["Transaction | None"] = relationship("Transaction", back_populates="ledger_entries")
    expense: Mapped["Expense | None"] = relationship("Expense", back_populates="ledger_entries")

    __table_args__ = (
        CheckConstraint("debit_amount >= 0", name="ledger_debit_check"),
        CheckConstraint("credit_amount >= 0", name="ledger_credit_check"),
        CheckConstraint(
            "(debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0)",
            name="check_debit_or_credit",
        ),
        Index("idx_ledger_store_id", "store_id"),
        Index("idx_ledger_transaction_id", "transaction_id"),
        Index("idx_ledger_expense_id", "expense_id"),
        Index("idx_ledger_entry_date", "entry_date"),
        Index("idx_ledger_account_type", "account_type"),
    )
