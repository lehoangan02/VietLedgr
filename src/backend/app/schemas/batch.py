from pydantic import BaseModel, Field, computed_field, ConfigDict
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from .product import ProductResponse

class BatchBase(BaseModel):
    """Base batch information"""
    product_id: UUID = Field(..., description="Product ID")
    warehouse_id: UUID = Field(..., description="Warehouse ID")
    stock: int = Field(..., ge=0, description="Current stock quantity")
    cost: Decimal = Field(..., gt=0, decimal_places=2, description="Cost per unit")
    sale_price: Decimal = Field(..., gt=0, decimal_places=2, description="Sale price per unit")
    supplier_name: str | None = Field(None, max_length=255, description="Supplier name")
    expire_date: datetime | None = Field(None, description="Expiration date")

class BatchCreate(BatchBase):
    """Create batch request"""
    import_date: datetime | None = Field(None, description="Import date")

class BatchUpdate(BaseModel):
    """Update batch request"""
    stock: int | None = Field(None, ge=0)
    cost: Decimal | None = Field(None, gt=0, decimal_places=2)
    sale_price: Decimal | None = Field(None, gt=0, decimal_places=2)
    supplier_name: str | None = Field(None, max_length=255)
    expire_date: datetime | None = Field(None)

class BatchResponse(BatchBase):
    """Batch response"""
    batch_id: UUID
    import_date: datetime
    created_at: datetime
    updated_at: datetime
    
    @computed_field
    @property
    def profit_margin(self) -> Decimal:
        """Calculate profit margin (sale_price - cost)"""
        return (self.sale_price - self.cost).quantize(Decimal("0.01"))
    
    @computed_field
    @property
    def profit_margin_percent(self) -> Decimal:
        """Calculate profit margin percentage ((sale_price - cost) / cost * 100)"""
        if self.cost == 0:
            return Decimal("0.00")
        return ((self.sale_price - self.cost) / self.cost * 100).quantize(Decimal("0.01"))
    
    model_config = ConfigDict(from_attributes=True)

class BatchWithProduct(BatchResponse):
    """Batch with product details"""
    product: ProductResponse

class BatchList(BaseModel):
    """Paginated batch list"""
    items: list[BatchResponse]
    total: int

class ExpiringBatch(BatchResponse):
    """Batch information for expiring items"""
    days_to_expire: int = Field(..., description="Days until expiration")
    urgency: str = Field(..., description="expired, urgent, soon, or normal")

class LowStockBatch(BatchResponse):
    """Batch information for low stock items"""
    stock_level: str = Field(..., description="low, critical, or warning")
    reorder_quantity: int = Field(..., description="Suggested reorder quantity")