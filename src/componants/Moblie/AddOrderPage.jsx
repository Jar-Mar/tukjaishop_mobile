import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Card, Table } from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const AddOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", qty: "", price: "" });
  const [cash, setCash] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [scanning, setScanning] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const idInputRef = useRef(null);

  const productDatabase = {
    "123456": { name: "Camera Lens", price: 1500 },
    "789012": { name: "Lighting Kit", price: 3200 },
    "345678": { name: "Encoder Cable", price: 450 },
  };

  useEffect(() => {
    idInputRef.current?.focus();
  }, [editIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addOrUpdateOrder = () => {
    const idValue = form.id?.trim() || "99";
    const qtyNum = Number(form.qty);
    const priceNum = Number(form.price);
    if (!form.name || !qtyNum || !priceNum) {
      alert("กรุณากรอกชื่อสินค้า จำนวน และราคา");
      return;
    }

    const newOrder = {
      id: idValue,
      name: form.name,
      qty: qtyNum,
      price: priceNum,
      total: qtyNum * priceNum,
    };

    if (editIndex !== null) {
      const updated = [...orders];
      updated[editIndex] = newOrder;
      setOrders(updated);
      setEditIndex(null);
    } else {
      setOrders([...orders, newOrder]);
    }

    setForm({ id: "", name: "", qty: "", price: "" });
    idInputRef.current?.focus();
  };

  const handleScan = (err, result) => {
    if (result) {
      const code = result.text.trim();
      if (!code) return;
      new Audio("/beep.mp3").play().catch(() => {});
      const found = productDatabase[code];
      if (found) {
        setForm({ id: code, name: found.name, qty: 1, price: found.price });
        setTimeout(addOrUpdateOrder, 300);
      } else {
        setForm((f) => ({ ...f, id: code }));
      }
      setScanning(false);
    }
  };

  const editOrder = (index) => {
    const item = orders[index];
    setForm({
      id: item.id,
      name: item.name,
      qty: String(item.qty),
      price: String(item.price),
    });
    setEditIndex(index);
  };

  const deleteOrder = (index) => {
    if (window.confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
      const updated = orders.filter((_, i) => i !== index);
      setOrders(updated);
      if (editIndex === index) setEditIndex(null);
    }
  };

  const calculateTotal = (o) => o.qty * o.price;
  const grandTotal = orders.reduce((sum, o) => sum + calculateTotal(o), 0);
  const change = paymentType === "cash" && cash ? Number(cash) - grandTotal : 0;


    /** ✅ Prevent Save if cash is empty **/
    const handleSave = () => {
      if (orders.length === 0) {
        alert("ยังไม่มีรายการสินค้า กรุณาเพิ่มสินค้าก่อนพิมพ์ใบเสร็จ");
        return;
      }
  
      if (paymentType === "cash" && (!cash || Number(cash) <= 0)) {
        alert("กรุณาใส่จำนวนเงินที่รับก่อนพิมพ์ใบเสร็จ 💵");
        return;
      }


      //send data save to api
      setOrders([]);
      setForm({ id: "", name: "", qty: "", price: "" });
      setCash("");
      setPaymentType("cash");
      setScanning(false);
      setEditIndex(null);
     
    

    }

  /** ✅ Prevent print if cash is empty **/
  const handlePrint = () => {
    if (orders.length === 0) {
      alert("ยังไม่มีรายการสินค้า กรุณาเพิ่มสินค้าก่อนพิมพ์ใบเสร็จ");
      return;
    }

    if (paymentType === "cash" && (!cash || Number(cash) <= 0)) {
      alert("กรุณาใส่จำนวนเงินที่รับก่อนพิมพ์ใบเสร็จ 💵");
      return;
    }

    const receiptNo = String(1000 + orders.length);
    const date = new Date().toLocaleString("th-TH");

    const paymentHTML =
      paymentType === "cash"
        ? `
        <div class="flex-line"><span>วิธีชำระ :</span><span>เงินสด</span></div>
        <div class="flex-line"><span>จำนวนเงินที่รับ :</span><span>${Number(
          cash || 0
        ).toLocaleString()} THB</span></div>
        <div class="flex-line"><span>เงินทอน :</span><span>${change.toLocaleString()} THB</span></div>`
        : `<div class="flex-line"><span>วิธีชำระ :</span><span>โอน</span></div>`;

    const receiptHTML = `
      <html><head>
        <meta charset="utf-8" />
        <title>Receipt</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            width: 80mm;
            margin: 0 auto;
            font-family: monospace;
            font-size: 14px;
            text-align: center;
            line-height: 1.6;
            letter-spacing: 0.3px;
          }
          h1 { font-size: 20px; margin: 4px 0; }
          small { font-size: 13px; }
          hr { border-top: 2px dashed black; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          td { padding: 4px 0; font-size: 14px; }
          .flex-line {
            display: flex;
            justify-content: space-between;
            padding: 0 10px;
            font-size: 14px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid black;
            margin-top: 5px;
          }
        </style></head>
      <body>
       <img  src="logo.png" alt="Shop Logo"
             style="width:200px;height:auto;margin-top:8px;margin-bottom:8px;" />
        <h1>ถูกใจการค้า</h1>
        <small>526 ม.11 ต.บางตาเถร อ.สองพี่น้อง จ.สุพรรณบุรี 72110</small>
        <hr/>
        <strong style="font-size:16px;">ใบเสร็จรับเงิน</strong><br/>
        <small>No: ${receiptNo}</small><br/>
        <small>${date}</small><hr/>
        <table>
          ${orders
            .map(
              (o) =>
                `<tr><td style="text-align:left;">${o.qty} x ${o.price.toLocaleString()} THB — ${o.name}</td>
                 <td style="text-align:right;">${o.total.toLocaleString()} THB</td></tr>`
            )
            .join("")}
        </table>
        <hr/>
        <div class="total-line"><span>ยอดรวม:</span><span>${grandTotal.toLocaleString()} THB</span></div>
        ${paymentHTML}
        <hr/><p style="margin-top:10px;font-size:15px;">ขอบคุณที่อุดหนุน 🙏</p>
      </body></html>`;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(receiptHTML);
    doc.close();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-3 mb-5">
      <h4 className="text-center mb-3">🧾 เพิ่ม / แก้ไข / ลบ รายการขาย</h4>

      {/* Input Section */}
      <Card className="shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              addOrUpdateOrder();
            }}
          >
            <div className="d-flex gap-2 mb-2">
              <Form.Control
                ref={idInputRef}
                placeholder="บาร์โค้ดสินค้า"
                name="id"
                value={form.id}
                onChange={handleChange}
              />
              <Button
                variant={scanning ? "danger" : "secondary"}
                onClick={() => setScanning((prev) => !prev)}
              >
                {scanning ? "✖ หยุด" : "📷 สแกน"}
              </Button>
            </div>

            {scanning && (
              <div className="mb-3 text-center">
                <BarcodeScannerComponent
                  width="100%"
                  height={250}
                  facingMode="environment"
                  onUpdate={handleScan}
                />
              </div>
            )}

            <Form.Control
              placeholder="ชื่อสินค้า"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              type="number"
              placeholder="จำนวน"
              name="qty"
              value={form.qty}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              type="number"
              placeholder="ราคา"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="mb-3"
            />
            <Button
              type="submit"
              className="w-100"
              variant={editIndex !== null ? "warning" : "primary"}
            >
              {editIndex !== null ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้า"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Order List */}
      <Card className="shadow-sm rounded-4 mb-3">
        <Card.Body>
          <Table responsive borderless size="sm" className="mb-0 text-center">
            <thead>
              <tr className="text-secondary">
                <th>รหัส</th>
                <th>ชื่อสินค้า</th>
                <th className="text-end">จำนวน</th>
                <th className="text-end">ราคา</th>
                <th className="text-end">รวม</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-muted text-center">
                    ยังไม่มีสินค้า กรุณาเพิ่มรายการ
                  </td>
                </tr>
              ) : (
                orders.map((o, i) => (
                  <tr key={i}>
                    <td>{o.id}</td>
                    <td>{o.name}</td>
                    <td className="text-end">{o.qty}</td>
                    <td className="text-end">{o.price.toLocaleString()}</td>
                    <td className="text-end fw-semibold text-primary">
                      {o.total.toLocaleString()}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-warning"
                        className="me-1"
                        onClick={() => editOrder(i)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deleteOrder(i)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {orders.length > 0 && (
            <div className="text-end mt-2 fw-bold text-primary">
              รวมทั้งหมด: {grandTotal.toLocaleString()} THB
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payment Section */}
      <Card className="shadow-sm rounded-4 mb-3">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>💰 วิธีชำระเงิน</Form.Label>
            <Form.Select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="cash">เงินสด</option>
              <option value="transfer">โอน</option>
            </Form.Select>
          </Form.Group>

          {paymentType === "cash" && (
            <Form.Group>
              <Form.Label>💵 จำนวนเงินที่รับ</Form.Label>
              <Form.Control
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                placeholder="กรุณาใส่จำนวนเงินที่รับ"
              />
            </Form.Group>
          )}
        </Card.Body>
      </Card>

      {/* Print Button */}
      <div className="text-center">
        <Button variant="warning" onClick={handlePrint}>
          🖨️ พิมพ์ใบเสร็จ
        </Button>
        <span> </span>
        <Button variant="outline-warning" onClick={handleSave}>
          📝 บันทึกรายการ
        </Button>
      </div>
    </div>
  );
};

export default AddOrderPage;