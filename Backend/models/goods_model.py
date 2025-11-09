from pydantic import BaseModel
from typing import Optional

class Goods(BaseModel):
    barcode: str
    name: str
    price: float
    cost: Optional[float] = 0
    supplier: Optional[str] = ""