from fastapi import APIRouter, HTTPException
from database import db, serialize_doc
from models.order_model import Order
from escpos.printer import Network
from datetime import datetime
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import os
from bson import ObjectId

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# ✅ ฟังก์ชันโหลดฟอนต์ไทย
def _load_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    raise RuntimeError("ไม่พบฟอนต์ภาษาไทย")

# ✅ ฟังก์ชันวาดข้อความกึ่งกลาง
def _draw_center(draw, y, text, font, canvas_w):
    w = draw.textlength(text, font=font)
    x = int((canvas_w - w) / 2)
    draw.text((x, y), text, font=font, fill="black")
    bbox = draw.textbbox((x, y), text, font=font)
    return bbox[3]


# ✅ ฟังก์ชันพิมพ์ใบเสร็จ
async def print_receipt_thai(order_dict):
    PRINTER_IP = "192.168.1.250"
    RECEIPT_W = 576
    INNER_W = RECEIPT_W - 48
    CURSOR_Y = 6

    font_candidates = [
        "./utils/THSarabunNew.ttf",
        "./utils/THSarabunNew Bold.ttf",
        "/System/Library/Fonts/Supplemental/TH Sarabun New Bold.ttf",
        "/usr/share/fonts/truetype/thai/THSarabunNew.ttf",
    ]
    font_title = _load_font(font_candidates, 60)
    font_normal = _load_font(font_candidates, 42)
    font_small = _load_font(font_candidates, 34)

    img = Image.new("RGB", (RECEIPT_W, 2500), "white")
    draw = ImageDraw.Draw(img)

    # ===== โลโก้ =====
    logo_path = "./assets/logo.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        ratio = min(1.0, (INNER_W / logo.width))
        logo = logo.resize((int(logo.width * ratio), int(logo.height * ratio)))
        x = int((RECEIPT_W - logo.width) / 2)
        img.paste(logo, (x, CURSOR_Y), mask=logo)
        CURSOR_Y += logo.height + 10

    # ===== Header =====
    CURSOR_Y = _draw_center(draw, CURSOR_Y, "ถูกใจการค้า", font_title, RECEIPT_W)
    CURSOR_Y += 6
    CURSOR_Y = _draw_center(
        draw, CURSOR_Y, "526 ม.11 ต.บางตาเถร อ.สองพี่น้อง จ.สุพรรณบุรี", font_small, RECEIPT_W
    )
    CURSOR_Y += 10
    draw.text((40, CURSOR_Y), "-" * 42, font=font_small, fill="black")
    CURSOR_Y += 40

    # ===== สินค้า =====
    for item in order_dict["items"]:
        name = item["name"]
        qty = item["qty"]
        total = item["total"]
        draw.text((40, CURSOR_Y), f"{name} x{qty}", font=font_normal, fill="black")
        val = f"{total:,.2f}"
        val_w = draw.textlength(val, font=font_normal)
        draw.text((RECEIPT_W - 40 - val_w, CURSOR_Y), val, font=font_normal, fill="black")
        CURSOR_Y += 36

    draw.text((40, CURSOR_Y), "-" * 42, font=font_small, fill="black")
    CURSOR_Y += 40

    # ===== รวมทั้งหมด =====
    total = float(order_dict.get("total", 0))
    redeem = float(order_dict.get("redeem", 0))
    net_total = total - redeem
    payment_type = order_dict.get("paymentType", "cash")
    cash = float(order_dict.get("cash", 0))
    change = float(order_dict.get("change", 0))

    draw.text((40, CURSOR_Y), f"รวมทั้งหมด: {total:,.2f} บาท", font=font_normal, fill="black")
    CURSOR_Y += 36
    if redeem > 0:
        draw.text((40, CURSOR_Y), f"ใช้แต้มแลกส่วนลด: {redeem:,.2f} บาท", font=font_small, fill="black")
        CURSOR_Y += 30
    draw.text((40, CURSOR_Y), f"ยอดสุทธิ: {net_total:,.2f} บาท", font=font_normal, fill="black")
    CURSOR_Y += 40

    # ===== วิธีชำระเงิน =====
    pay_label = "เงินสด" if payment_type == "cash" else "โอน"
    draw.text((40, CURSOR_Y), f"ชำระโดย: {pay_label}", font=font_small, fill="black")
    CURSOR_Y += 30
    if payment_type == "cash":
        draw.text((40, CURSOR_Y), f"รับเงิน: {cash:,.2f}", font=font_small, fill="black")
        CURSOR_Y += 30
        draw.text((40, CURSOR_Y), f"เงินทอน: {change:,.2f}", font=font_small, fill="black")
        CURSOR_Y += 40
    draw.text((40, CURSOR_Y), "-" * 42, font=font_small, fill="black")
    CURSOR_Y += 40

    # ===== แต้มสะสม =====
    member = order_dict.get("member", {})
    phone = member.get("phone", "")

    # ✅ ถ้าไม่มีสมาชิกหรือ phone == "-" ให้ข้ามส่วนแต้ม
    if not phone or phone == "-":
        draw.text((40, CURSOR_Y), "ไม่มีสมาชิก", font=font_small, fill="black")
        CURSOR_Y += 35
    else:
        member_db = await db.members.find_one({"phone": phone})
        points_before = int(member_db.get("points", 0) if member_db else 0)
        earned = int(order_dict.get("earnedPoints", int(net_total // 100)))
        redeem_points = int(order_dict.get("redeem", 0))
        points_before = points_before - earned
        points_after = points_before - redeem_points + earned

        draw.text((40, CURSOR_Y), f"เบอร์สมาชิก: {phone}", font=font_small, fill="black")
        CURSOR_Y += 30
        draw.text((40, CURSOR_Y), f"แต้มก่อนใช้: {points_before}", font=font_small, fill="black")
        CURSOR_Y += 28
        draw.text((40, CURSOR_Y), f"ใช้แต้ม: {redeem_points}", font=font_small, fill="black")
        CURSOR_Y += 28
        draw.text((40, CURSOR_Y), f"ได้รับใหม่: {earned}", font=font_small, fill="black")
        CURSOR_Y += 28
        draw.text((40, CURSOR_Y), f"แต้มคงเหลือ: {points_after}", font=font_small, fill="black")
        CURSOR_Y += 40
        draw.text((40, CURSOR_Y), "-" * 42, font=font_small, fill="black")
        CURSOR_Y += 36

    # ===== ข้อความท้าย =====
    CURSOR_Y = _draw_center(draw, CURSOR_Y, "ขอบคุณที่อุดหนุน", font_normal, RECEIPT_W)
    emoji_path = "./assets/thankyou.png"
    if os.path.exists(emoji_path):
        emoji = Image.open(emoji_path).convert("RGBA")
        emoji = emoji.resize((48, 48))
        x = int((RECEIPT_W - emoji.width) / 2)
        img.paste(emoji, (x, CURSOR_Y), mask=emoji)
        CURSOR_Y += emoji.height + 6
    CURSOR_Y += 8
    CURSOR_Y = _draw_center(draw, CURSOR_Y, datetime.now().strftime("%d/%m/%Y %H:%M:%S"), font_small, RECEIPT_W)
    CURSOR_Y += 20

    # ===== ครอปใบเสร็จ =====
    img = img.crop((0, 0, RECEIPT_W, CURSOR_Y))
    bw = img.convert("L").point(lambda x: 0 if x < 160 else 255, mode="1")

    buf = BytesIO()
    bw.save(buf, format="PNG")
    buf.seek(0)

    try:
        p = Network(PRINTER_IP, port=9100, timeout=10)
        p.image(buf)
        try:
            p.cut()
        except Exception:
            p.text("\n\n\n")
        p.close()
    except Exception as e:
        print(f"⚠️ Printer not reachable: {e}")
        img.save("./last_receipt.png")


# ✅ บันทึกคำสั่งซื้อ + หัก stock
@router.post("")
async def create_order(order: Order):
    order_dict = order.model_dump()
    result = await db.orders.insert_one(order_dict)
    order_dict["_id"] = str(result.inserted_id)

    not_found_items, low_stock_items, updated_items = [], [], []

    for item in order_dict.get("items", []):
        barcode = item.get("id") or item.get("barcode")
        qty_sold = int(item.get("qty", 0))
        if not barcode or qty_sold <= 0:
            continue

        product = await db.goods.find_one({"barcode": barcode})
        if not product:
            not_found_items.append(item.get("name", f"Unknown({barcode})"))
            continue

        current_qty = int(product.get("stock", 0))
        new_qty = max(0, current_qty - qty_sold)
        if new_qty < qty_sold:
            low_stock_items.append(f"{product['name']} (คงเหลือ {current_qty}, ขาย {qty_sold})")

        await db.goods.update_one({"barcode": barcode}, {"$set": {"stock": new_qty}})

        updated_items.append({
            "name": product["name"],
            "old_qty": current_qty,
            "sold": qty_sold,
            "new_qty": new_qty
        })

    # ✅ อัปเดตแต้ม (เฉพาะมีสมาชิก)
    if order_dict.get("member", {}).get("phone") not in [None, "-"]:
        await db.members.update_one(
            {"phone": order_dict["member"]["phone"]},
            {"$inc": {"points": int(order_dict["total"] // 100)}}
        )

    # ✅ พิมพ์ใบเสร็จ
    await print_receipt_thai(order_dict)

    response = {
        "message": "✅ บันทึกคำสั่งซื้อและพิมพ์ใบเสร็จเรียบร้อย",
        "data": order_dict,
        "stock_updates": updated_items
    }
    if not_found_items:
        response["warning_notfound"] = f"❌ ไม่พบสินค้า: {', '.join(not_found_items)}"
    if low_stock_items:
        response["warning_lowstock"] = f"⚠️ สินค้าสต๊อกไม่พอ: {', '.join(low_stock_items)}"

    return response
# ✅ ดึงรายการขายล่าสุด
@router.get("/last")
async def get_last_order():
    last_order = await db.orders.find_one(sort=[("_id", -1)])
    if not last_order:
        raise HTTPException(status_code=404, detail="ไม่พบคำสั่งซื้อ")
    return serialize_doc(last_order)


# ✅ ดึงรายการขายทั้งหมด (สำหรับรายงาน)
@router.get("")
async def get_all_orders():
    orders_cursor = db.orders.find().sort("_id", -1)
    orders = await orders_cursor.to_list(length=200)
    return [serialize_doc(o) for o in orders]


# ✅ พิมพ์ใบเสร็จซ้ำ
@router.post("/print/{order_id}")
async def reprint_order(order_id: str):
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="ไม่พบคำสั่งซื้อ")
        await print_receipt_thai(order)
        return {"message": "✅ พิมพ์ใบเสร็จซ้ำเรียบร้อย", "data": serialize_doc(order)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {e}")
