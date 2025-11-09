from fastapi import APIRouter, HTTPException
from database import db, serialize_doc
from models.goods_model import Goods

router = APIRouter(prefix="/api/goods", tags=["Goods"])

@router.get("/barcode/{code}")
def get_goods_by_barcode(code: str):
    item = db.goods.find_one({"barcode": code})
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้า")
    return serialize_doc(item)

@router.post("")
def add_goods(item: Goods):
    db.goods.insert_one(item.dict())
    return {"message": "เพิ่มสินค้าเรียบร้อย", "data": item.dict()}