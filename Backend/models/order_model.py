from pydantic import BaseModel
from typing import List, Optional

class OrderItem(BaseModel):
    id: str
    name: str
    qty: int
    price: float
    total: float

class Order(BaseModel):
    member: Optional[dict] = None
    items: List[OrderItem]
    paymentType: str
    cash: float
    total: float
    change: float
    date: str