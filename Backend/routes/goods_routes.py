from fastapi import APIRouter, HTTPException, Query
from database import db, serialize_doc
from models.goods_model import Goods
from escpos.printer import Network
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import qrcode, os
from datetime import datetime
from typing import Optional, List

router = APIRouter(prefix="/api/goods", tags=["Goods"])


# ===============================
# 🧩 ฟังก์ชันช่วย
# ===============================

def _load_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    raise RuntimeError("❌ ไม่พบฟอนต์ภาษาไทยในพาธที่กำหนด")


# ===============================
# 🖨️ พิมพ์ QR Label สำหรับ 1 ชิ้นสินค้า
# ===============================
async def print_goods_label(item: dict):
    PRINTER_IP = "192.168.1.250"
    RECEIPT_W = 576
    MARGIN = 20

    font_candidates = [
        "./utils/THSarabunNew Bold.ttf",
        "/System/Library/Fonts/Supplemental/TH Sarabun New Bold.ttf",
        "C:/Windows/Fonts/THSarabunNew.ttf",
        "/usr/share/fonts/truetype/thai/THSarabunNew.ttf",
    ]

    try:
        font_name = _load_font(font_candidates, 48)
        font_info = _load_font(font_candidates, 36)
        font_price = _load_font(font_candidates, 56)

        img = Image.new("RGB", (RECEIPT_W, 750), "white")
        draw = ImageDraw.Draw(img)

        # ✅ ดึงประเภทสินค้า
        type_name = ""
        if item.get("type"):
            type_data = await db.goods_types.find_one({"_id": item["type"]}) if isinstance(item["type"], dict) == False else item["type"]
            if type_data:
                type_name = type_data.get("name", "")

        # ✅ สร้าง QR
        qr = qrcode.QRCode(box_size=8, border=2)
        qr.add_data(item.get("barcode", "UNKNOWN"))
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

        qr_w, qr_h = qr_img.size
        scale = min((RECEIPT_W - MARGIN * 2) / qr_w, 1.2)
        qr_img = qr_img.resize((int(qr_w * scale), int(qr_h * scale)), Image.LANCZOS)
        qr_x = (RECEIPT_W - qr_img.width) // 2
        qr_y = 20
        img.paste(qr_img, (qr_x, qr_y))

        CURSOR_Y = qr_y + qr_img.height + 25

        # ✅ ชื่อสินค้า
        name_text = f"{type_name} {item.get('name', '')}".strip()
        w = draw.textlength(name_text, font=font_name)
        draw.text(((RECEIPT_W - w) / 2, CURSOR_Y), name_text, font=font_name, fill="black")
        CURSOR_Y += 55

        # ✅ รหัสสินค้า
        barcode_text = f"รหัส: {item.get('barcode', '-')}"
        w = draw.textlength(barcode_text, font=font_info)
        draw.text(((RECEIPT_W - w) / 2, CURSOR_Y), barcode_text, font=font_info, fill="black")
        CURSOR_Y += 45

        # ✅ ราคา
        price_text = f"฿{item.get('price', 0):,.0f}"
        w = draw.textlength(price_text, font=font_price)
        draw.text(((RECEIPT_W - w) / 2, CURSOR_Y), price_text, font=font_price, fill="black")
        CURSOR_Y += 65

        # ✅ Crop
        total_height = CURSOR_Y + 20
        img = img.crop((0, 0, RECEIPT_W, total_height))
        bw = img.convert("L").point(lambda x: 0 if x < 170 else 255, mode="1")

        buf = BytesIO()
        bw.save(buf, format="PNG")
        buf.seek(0)

        p = Network(PRINTER_IP, port=9100, timeout=10)
        p.image(buf)
        try:
            p.cut()
        except Exception:
            p.text("\n\n\n")
        p.close()

        print(f"🖨️ พิมพ์ Label สินค้า {item.get('name')} สำเร็จ")
        return {"message": f"พิมพ์ Label สินค้า {item.get('name')} แล้ว"}

    except Exception as e:
        print(f"❌ Print label error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===============================
# 📦 ดึง / เพิ่มสินค้า
# ===============================

@router.post("")
async def add_goods(item: Goods):
    data = item.dict()

    # ✅ ตรวจสอบ quantity ต้องเป็นจำนวนเต็ม
    data["quantity"] = int(data.get("quantity", 0) or 0)
    data["cost"] = float(data.get("cost", 0) or 0)
    data["price"] = float(data.get("price", 0) or 0)

    existing = await db.goods.find_one({"barcode": item.barcode})
    if existing:
        raise HTTPException(status_code=400, detail="รหัสบาร์โค้ดนี้มีอยู่แล้ว")

    result = await db.goods.insert_one(data)
    data["_id"] = str(result.inserted_id)

    # ✅ พิมพ์ QR Code (ถ้ามีเครื่องพิมพ์)
    try:
        await print_goods_label(data)
    except Exception as e:
        print(f"⚠️ QR print failed: {e}")

    return {"message": "✅ เพิ่มสินค้าเรียบร้อย", "data": data}

@router.get("")
async def get_all_goods(
    name: Optional[str] = None,
    type: Optional[str] = None,
    supplier: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
):
    """ดึงรายการสินค้าทั้งหมด (รองรับฟิลเตอร์)"""
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if type:
        query["type"] = type
    if supplier:
        query["supplier"] = {"$regex": supplier, "$options": "i"}
    if startDate or endDate:
        query["dateReceived"] = {}
        if startDate:
            query["dateReceived"]["$gte"] = startDate
        if endDate:
            query["dateReceived"]["$lte"] = endDate

    cursor = db.goods.find(query)
    items = await cursor.to_list(length=1000)
    return [serialize_doc(x) for x in items]

# ===============================
# 🖨️ พิมพ์ Label ซ้ำ (1 ชิ้น)
# ===============================

@router.post("/print-label/{barcode}")
async def print_label_by_barcode(barcode: str):
    item = await db.goods.find_one({"barcode": barcode})
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้าในระบบ")
    await print_goods_label(item)
    return {"message": f"✅ พิมพ์ Label สินค้า {item.get('name')} สำเร็จ"}


# ===============================
# 🖨️ พิมพ์ Label หลายรายการ (Batch)
# ===============================

@router.post("/print-labels")
async def print_multiple_labels(data: dict):
    """
    รับ JSON: { "barcodes": ["123", "456", "789"] }
    แล้วพิมพ์ทุกชิ้น
    """
    barcodes = data.get("barcodes", [])
    if not barcodes:
        raise HTTPException(status_code=400, detail="ไม่พบ barcode ในคำขอ")

    printed = []
    for code in barcodes:
        item = await db.goods.find_one({"barcode": code})
        if item:
            try:
                await print_goods_label(item)
                printed.append(code)
            except Exception as e:
                print(f"⚠️ Print fail {code}: {e}")

    return {"message": f"✅ พิมพ์ {len(printed)} รายการสำเร็จ", "printed": printed}

@router.get("/types")
async def get_goods_types():
    cursor = db.goods_types.find().sort("name", 1)
    types = await cursor.to_list(length=100)
    return [serialize_doc(t) for t in types]


@router.post("/types")
async def add_goods_type(data: dict):
    """
    เพิ่มประเภทสินค้าใหม่ เช่น {"name": "กล้อง"}
    """
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="ต้องระบุชื่อประเภทสินค้า")

    # 🔍 ตรวจสอบชื่อซ้ำ (ไม่ให้เพิ่มประเภทที่มีอยู่แล้ว)
    existing = await db.goods_types.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail=f"ประเภท '{name}' มีอยู่แล้วในระบบ")

    result = await db.goods_types.insert_one({"name": name})
    new_type = await db.goods_types.find_one({"_id": result.inserted_id})

    return {
        "message": f"✅ เพิ่มประเภทสินค้า '{name}' สำเร็จ",
        "data": serialize_doc(new_type)
    }
@router.get("/barcode/{barcode}")
async def get_goods_by_barcode(barcode: str):
    """
    ดึงข้อมูลสินค้าจากรหัสบาร์โค้ด เช่น /api/goods/barcode/1234567890
    """
    item = await db.goods.find_one({"barcode": barcode})
    if not item:
        raise HTTPException(status_code=404, detail="❌ ไม่พบสินค้านี้ในระบบ")
    return serialize_doc(item)
# ✅ เติมสต็อกโดยใช้ barcode
@router.put("/restock/{barcode}")
async def restock_goods(barcode: str, payload: dict):
    """เติมสต็อกสินค้าโดยใช้ barcode"""
    qty_to_add = int(payload.get("qty", 0))
    if qty_to_add <= 0:
        raise HTTPException(status_code=400, detail="จำนวนต้องมากกว่า 0")

    product = await db.goods.find_one({"barcode": barcode})
    if not product:
        raise HTTPException(status_code=404, detail="❌ ไม่พบสินค้าในระบบ")

    new_stock = int(product.get("stock", 0)) + qty_to_add

    await db.goods.update_one(
        {"barcode": barcode},
        {"$set": {"stock": new_stock}}
    )

    return {
        "message": f"✅ อัปเดตสต็อกจาก {product.get('stock', 0)} ➜ {new_stock}",
        "data": {**serialize_doc(product), "new_stock": new_stock}
    }