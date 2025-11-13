import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Card, Table, Alert } from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const API_BASE = "https://192.168.1.118:8000"; // ✅ Backend URL

const AddOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", qty: "", price: "" });
  const [cash, setCash] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [scanning, setScanning] = useState(false);
  const idInputRef = useRef(null);

  // ✅ Member info
  const [memberPhone, setMemberPhone] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberStatus, setMemberStatus] = useState(""); // found | new
  const [points, setPoints] = useState(0);
  const [redeem, setRedeem] = useState(0);

  // Auto-focus
  useEffect(() => {
    idInputRef.current?.focus();
  }, []);

  // 🧩 Fetch Member
  const apiGetMember = async (phone) => {
    const res = await fetch(`${API_BASE}/api/members/${phone}`);
    if (!res.ok) return null;
    return await res.json();
  };

  // 🧩 Create new Member
  const apiCreateMember = async (payload) => {
    const res = await fetch(`${API_BASE}/api/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  // 🧩 Save Order
  const apiCreateOrder = async (payload) => {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  // 🧩 Update Points
  const apiUpdatePoints = async (phone, newPoints) => {
    await fetch(`${API_BASE}/api/members/${phone}/points`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: newPoints }),
    });
  };

  // 🧩 Get Product by Barcode
  const apiGetProductByBarcode = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/api/goods/barcode/${code}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Fetch product error:", err);
      return null;
    }
  };

  // ✅ Member lookup
  const handleMemberPhoneBlur = async () => {
    const phone = memberPhone.trim();
    if (!phone) return;
    const found = await apiGetMember(phone);
    if (found?.name) {
      setMemberName(found.name);
      setPoints(found.points || 0);
      setMemberStatus("found");
    } else {
      setMemberStatus("new");
      setMemberName("");
      setPoints(0);
    }
  };

  // ✅ Register new member if needed
  const registerMemberIfNeeded = async () => {
    const phone = memberPhone.trim();

    // ⚡ ไม่มีการกรอกเบอร์สมาชิก
    if (!phone) {
      return { name: "ไม่มีสมาชิก", phone: "-" };
    }

    if (memberStatus === "new") {
      if (!memberName) throw new Error("กรุณากรอกชื่อสมาชิกใหม่");
      await apiCreateMember({ name: memberName, phone });
    }
    return { name: memberName, phone };
  };

  // ✅ Product Scan
  const handleScan = async (err, result) => {
    if (result) {
      const code = result.text.trim();
      if (!code) return;
      new Audio("/beep.mp3").play().catch(() => {});

      const product = await apiGetProductByBarcode(code);
      if (product && product.name && product.price) {
        setForm({ id: code, name: product.name, qty: 1, price: product.price });
        setTimeout(addOrUpdateOrder, 300);
      } else {
        alert("❌ ไม่พบสินค้าในระบบ");
      }
      setScanning(false);
    }
  };

  // ✅ Add / Update Order
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addOrUpdateOrder = () => {
    if (!form.name || !form.qty || !form.price) return;
    const newOrder = {
      ...form,
      qty: Number(form.qty),
      price: Number(form.price),
      total: Number(form.qty) * Number(form.price),
    };
    setOrders((prev) => [...prev, newOrder]);
    setForm({ id: "", name: "", qty: "", price: "" });
  };

  // ✅ Remove Item
  const removeItem = (index) => {
    const newOrders = [...orders];
    newOrders.splice(index, 1);
    setOrders(newOrders);
  };

  // ✅ Totals
  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const discount = Math.min(redeem, points, grandTotal);
  const netTotal = grandTotal - discount;
  const change = paymentType === "cash" ? Number(cash || 0) - netTotal : 0;

  useEffect(() => {
    if (redeem > points) setRedeem(points);
  }, [redeem, points]);

  // ✅ Save & print
  const handleSave = async () => {
    if (orders.length === 0) return alert("ยังไม่มีสินค้า");
    const member = await registerMemberIfNeeded();

    const earnedPoints =
      member.phone === "-" ? 0 : Math.floor(netTotal / 100); // ✅ ถ้าไม่มีสมาชิก → ไม่ได้แต้ม
    const remainingPoints =
      member.phone === "-" ? 0 : points - redeem + earnedPoints;

    const payload = {
      member,
      items: orders,
      paymentType,
      cash: Number(cash || 0),
      total: grandTotal,
      total_net: netTotal,
      change,
      redeem,
      earnedPoints,
      points_before: points,
      date: new Date().toISOString(),
    };

    try {
      const res = await apiCreateOrder(payload);
      if (res?.message) {
        if (member.phone === "-") {
          alert(`✅ บันทึกสำเร็จ (ขายแบบไม่มีสมาชิก)`);
        } else {
          alert(
            `✅ บันทึกสำเร็จ!\nได้แต้มเพิ่ม ${earnedPoints} แต้ม\nแต้มคงเหลือปัจจุบัน: ${remainingPoints}`
          );
        }
      } else {
        alert("❌ เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (e) {
      alert("❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }

    // ✅ ถ้ามีสมาชิกเท่านั้นถึงจะอัปเดตแต้ม
    if (member.phone !== "-") {
      await apiUpdatePoints(member.phone, remainingPoints);
    }

    // Reset
    setOrders([]);
    setCash("");
    setRedeem(0);
    setMemberPhone("");
    setMemberName("");
    setPoints(remainingPoints);
    setMemberStatus("");
  };

  return (
    <div className="p-3">
      <h4 className="text-center mb-3">🧾 ถูกใจการค้า POS</h4>

      {/* ===== สมาชิก ===== */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Group>
            <Form.Label>📞 เบอร์โทรสมาชิก (ว่างได้ถ้าไม่มีสมาชิก)</Form.Label>
            <Form.Control
              value={memberPhone}
              onChange={(e) => setMemberPhone(e.target.value)}
              onBlur={handleMemberPhoneBlur}
              placeholder="กรอกเบอร์โทร หรือเว้นว่าง"
            />
          </Form.Group>

          {memberStatus === "found" && (
            <Alert variant="success" className="mt-2">
              ✅ เจอสมาชิก: {memberName} | แต้มสะสม {points}
            </Alert>
          )}

          {memberStatus === "new" && (
            <>
              <Alert variant="warning" className="mt-2">
                🟡 ไม่พบสมาชิก กรอกชื่อเพื่อสมัครใหม่
              </Alert>
              <Form.Control
                className="mt-2"
                placeholder="ชื่อสมาชิกใหม่"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
              />
            </>
          )}
        </Card.Body>
      </Card>

      {/* ===== สินค้า ===== */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex gap-2">
            <Form.Control
              ref={idInputRef}
              placeholder="บาร์โค้ดสินค้า"
              name="id"
              value={form.id}
              onChange={handleChange}
            />
            <Button
              onClick={() => setScanning((prev) => !prev)}
              variant={scanning ? "danger" : "secondary"}
            >
              {scanning ? "✖ หยุด" : "📷 สแกน"}
            </Button>
          </div>
          {scanning && (
            <div className="mt-2">
              <BarcodeScannerComponent
                width="100%"
                height={250}
                onUpdate={handleScan}
              />
            </div>
          )}
          <Form.Control
            placeholder="ชื่อสินค้า"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-2"
          />
          <Form.Control
            type="number"
            placeholder="จำนวน"
            name="qty"
            value={form.qty}
            onChange={handleChange}
            className="mt-2"
          />
          <Form.Control
            type="number"
            placeholder="ราคา"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="mt-2"
          />
          <Button className="w-100 mt-3" onClick={addOrUpdateOrder}>
            ➕ เพิ่มสินค้า
          </Button>
        </Card.Body>
      </Card>

      {/* ===== ตารางสินค้า ===== */}
      <Card className="mb-3">
        <Card.Body>
          <Table size="sm" bordered>
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>ราคา</th>
                <th>รวม</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={i}>
                  <td>{o.name}</td>
                  <td>{o.qty}</td>
                  <td>{o.price}</td>
                  <td>{o.total}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeItem(i)}
                    >
                      ลบ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-end fw-bold">
            รวมทั้งหมด: {grandTotal.toLocaleString()} ฿
          </div>
        </Card.Body>
      </Card>

      {/* ===== ส่วนลดด้วยแต้ม ===== */}
      {memberStatus === "found" && (
        <Card className="mb-3">
          <Card.Body>
            <Form.Label>🎁 ใช้แต้มแลกส่วนลด</Form.Label>
            <Form.Control
              type="number"
              value={redeem}
              onChange={(e) => setRedeem(Number(e.target.value))}
              placeholder="จำนวนแต้มที่ใช้"
            />
            <small>แต้มที่มี: {points}</small>
          </Card.Body>
        </Card>
      )}

      {/* ===== ชำระเงิน ===== */}
      <Card className="mb-3">
        <Card.Body>
          <div className="fw-bold mb-2">ยอดสุทธิ: {netTotal.toLocaleString()} ฿</div>
          <Form.Select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="cash">เงินสด</option>
            <option value="transfer">โอน</option>
          </Form.Select>
          {paymentType === "cash" && (
            <Form.Control
              className="mt-2"
              placeholder="จำนวนเงินที่รับ"
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
            />
          )}
          {paymentType === "cash" && (
            <div className="text-end mt-2">
              เงินทอน: <b>{change >= 0 ? change.toLocaleString() : 0} ฿</b>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="text-center">
        <Button variant="primary" onClick={handleSave}>
          📝 บันทึกและพิมพ์ใบเสร็จ
        </Button>
      </div>
    </div>
  );
};

export default AddOrderPage;