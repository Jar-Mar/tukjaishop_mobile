from pydantic import BaseModel
from typing import Optional

class Goods(BaseModel):
    barcode: Optional[str] = None
    name: str
    type: Optional[str] = None
    cost: float
    price: float
    stock: int = 0
    supplier: Optional[str] = None
    dateReceived: Optional[str] = None
    imageBase64: Optional[str] = None
    profitPercent: Optional[float] = None
    manualPrice: Optional[float] = None