from fastapi import APIRouter
from database import db, serialize_list
from models.order_model import Order

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("")
def add_order(order: Order):
    db.orders.insert_one(order.dict())
    return {"message": "บันทึกออเดอร์เรียบร้อย", "data": order.dict()}

@router.get("")
def list_orders():
    orders = list(db.orders.find().sort("date", -1))
    return serialize_list(orders)