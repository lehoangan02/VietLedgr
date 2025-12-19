from enum import Enum
from pydantic import BaseModel
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from ..core.database import Base


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

class RetailCategory(str, Enum):
    FOOD = "FOOD"
    HOUSEHOLD = "HOUSEHOLD"
    STATIONERY = "STATIONERY"
    OTHERS = "OTHERS"

# IMPORTANT: Enum type is created by migration/SQL script => create_type=False
account_type_enum = PGEnum(
    AccountType,
    name="account_type",
    create_type=False,
)

retail_category_enum = PGEnum(
    RetailCategory,
    name="retailcategory",
    create_type=False,
)
