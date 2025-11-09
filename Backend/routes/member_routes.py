from fastapi import APIRouter, HTTPException
from models.member_model import Member
from database import db, serialize_doc

router = APIRouter(prefix="/api/members", tags=["Members"])

@router.get("/{phone}")
def get_member(phone: str):
    member = db.members.find_one({"phone": phone})
    if not member:
        raise HTTPException(status_code=404, detail="ไม่พบสมาชิก")
    return serialize_doc(member)

@router.post("")
def create_member(member: Member):
    exists = db.members.find_one({"phone": member.phone})
    if exists:
        raise HTTPException(status_code=400, detail="เบอร์นี้ลงทะเบียนแล้ว")
    db.members.insert_one(member.dict())
    return {"message": "เพิ่มสมาชิกเรียบร้อย", "data": member.dict()}

@router.put("/{phone}/points")
def update_points(phone: str, points: int):
    db.members.update_one({"phone": phone}, {"$set": {"points": points}})
    return {"message": "Points updated", "phone": phone, "points": points}