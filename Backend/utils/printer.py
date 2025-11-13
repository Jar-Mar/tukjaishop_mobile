from escpos.printer import Network
from datetime import datetime

def print_receipt(order: dict):
    """พิมพ์ใบเสร็จจากข้อมูลคำสั่งซื้อ"""

    try:
        # 🔹 ปรับค่าตามรุ่นเครื่องพิมพ์ของคุณ (VendorID, ProductID)
        # ใช้คำสั่ง wifi เพื่อตรวจสอบ
        p = Network("192.168.1.250", 9100)  

        p.set(align="center", bold=True, double_height=True)
        p.text("🧾 ถูกใจการค้า\n")
        p.set(align="center", bold=False)
        p.text("123/4 ถนนตลาด ต.ในเมือง\nโทร: 089-999-8888\n\n")

        p.text("-------------------------------\n")
        p.set(align="left")

        for item in order["items"]:
            name = item["name"]
            qty = item["qty"]
            price = item["price"]
            total = item["total"]
            p.text(f"{name}\n")
            p.text(f"  {qty} x {price:.2f} = {total:.2f}\n")

        p.text("-------------------------------\n")
        p.text(f"รวมทั้งสิ้น: {order['total']:.2f} บาท\n")
        p.text(f"รับเงิน: {order['cash']:.2f}\n")
        p.text(f"เงินทอน: {order['change']:.2f}\n")

        if order.get("member", {}).get("name"):
            p.text(f"สมาชิก: {order['member']['name']}\n")

        p.text("-------------------------------\n")
        p.text("ขอบคุณที่อุดหนุน ❤️\n")
        p.text(datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "\n")

        p.cut()
        p.close()

    except Exception as e:
        print(f"❌ พิมพ์ใบเสร็จล้มเหลว: {e}")