from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.member_model import Member
from database import db, serialize_doc

router = APIRouter(prefix="/api/members", tags=["Members"])

# ✅ schema สำหรับอัปเดตแต้ม
class PointsUpdate(BaseModel):
    points: int


# ✅ ดึงข้อมูลสมาชิกด้วยเบอร์โทร
@router.get("/{phone}")
async def get_member(phone: str):
    member = await db.members.find_one({"phone": phone})
    if not member:
        raise HTTPException(status_code=404, detail="ไม่พบสมาชิก")
    return serialize_doc(member)


# ✅ เพิ่มสมาชิกใหม่
@router.post("")
async def create_member(member: Member):
    exists = await db.members.find_one({"phone": member.phone})
    if exists:
        raise HTTPException(status_code=400, detail="เบอร์นี้ลงทะเบียนแล้ว")

    await db.members.insert_one(member.dict())
    return {
        "message": "✅ เพิ่มสมาชิกเรียบร้อย",
        "data": member.dict()
    }


# ✅ อัปเดตแต้ม (เพิ่มหรือลด) ผ่าน JSON body
@router.put("/{phone}/points")
async def update_points(phone: str, payload: PointsUpdate):
    result = await db.members.update_one(
        {"phone": phone},
        {"$set": {"points": int(payload.points)}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="ไม่พบสมาชิก")

    return {
        "message": "✅ Points updated",
        "phone": phone,
        "points": int(payload.points)
    }