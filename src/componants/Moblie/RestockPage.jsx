import React, { useState } from "react";
import { Card, Button, Form, Alert, Spinner, Table } from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import axios from "axios";

const API_BASE = "https://192.168.1.118:8000/api/goods";

const RestockPage = () => {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [addQty, setAddQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ ดึงข้อมูลสินค้า
  const fetchProduct = async (code) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/barcode/${code}`);
      setProduct(res.data);
      setMessage("");
    } catch (err) {
      setProduct(null);
      setMessage("❌ ไม่พบสินค้าในระบบ");
    } finally {
      setLoading(false);
    }
  };

  // ✅ สแกน QR หรือ Barcode
  const handleScan = async (err, result) => {
    if (result) {
      const code = result.text.trim();
      setBarcode(code);
      setScanning(false);
      await fetchProduct(code);
    }
  };

  // ✅ กดปุ่มค้นหาด้วยการกรอก
  const handleSearch = async () => {
    if (!barcode) return alert("⚠️ กรุณากรอกหรือสแกนบาร์โค้ดก่อน");
    await fetchProduct(barcode);
  };

  // ✅ ฟังก์ชันอัปเดตสต็อก
  const handleRestock = async () => {
    if (!product) return alert("❌ ไม่มีสินค้าในระบบ");
    if (!addQty || Number(addQty) <= 0) return alert("⚠️ กรุณาใส่จำนวนที่ต้องการเพิ่ม");

    try {
      setLoading(true);
      const res = await axios.put(`${API_BASE}/restock/${barcode}`, {
        qty: Number(addQty),
      });
      setMessage(res.data.message);
      setAddQty("");
      await fetchProduct(barcode);
    } catch (err) {
      console.error(err);
      setMessage("❌ ไม่สามารถอัปเดตสต็อกได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f9fafb",
        padding: "20px",
      }}
    >
      <h4 className="text-center mb-3">📦 เติมสต็อกสินค้า</h4>

      {/* 🔹 ส่วนค้นหาหรือสแกน */}
      <Card className="shadow-sm border-0 rounded-4 mb-3">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>🔍 สแกนหรือกรอกบาร์โค้ดสินค้า</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="สแกนหรือกรอกรหัสสินค้า"
              />
              <Button
                variant={scanning ? "danger" : "secondary"}
                onClick={() => setScanning((prev) => !prev)}
              >
                {scanning ? "✖ หยุดสแกน" : "📷 สแกน"}
              </Button>
            </div>
          </Form.Group>

          {scanning && (
            <div className="text-center mb-3">
              <BarcodeScannerComponent
                width="100%"
                height={250}
                facingMode="environment"
                onUpdate={handleScan}
              />
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleSearch}
            className="w-100"
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "🔎 ค้นหาสินค้า"}
          </Button>
        </Card.Body>
      </Card>

      {/* 🔹 แสดงข้อความผลลัพธ์ */}
      {message && (
        <Alert
          variant={message.startsWith("✅") ? "success" : "danger"}
          className="text-center"
        >
          {message}
        </Alert>
      )}

      {/* 🔹 แสดงรายละเอียดสินค้า */}
      {product && (
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body>
            <h5 className="text-center mb-3">📋 รายละเอียดสินค้า</h5>

            <Table bordered responsive size="sm" className="text-center mb-3">
              <thead className="bg-light">
                <tr>
                  <th>ชื่อสินค้า</th>
                  <th>ประเภท</th>
                  <th>ราคาขาย</th>
                  <th>สต็อกคงเหลือ</th>
                  <th>ผู้จัดจำหน่าย</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{product.name}</td>
                  <td>{product.type || "-"}</td>
                  <td>{product.price?.toLocaleString()} ฿</td>
                  <td className="fw-bold text-success">
                    {product.stock?.toLocaleString() || 0}
                  </td>
                  <td>{product.supplier || "-"}</td>
                </tr>
              </tbody>
            </Table>

            <Form.Group>
              <Form.Label>📦 จำนวนที่ต้องการเพิ่ม</Form.Label>
              <Form.Control
                type="number"
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                placeholder="กรอกจำนวนที่รับเพิ่ม"
              />
            </Form.Group>

            <Button
              variant="success"
              className="w-100 mt-3"
              onClick={handleRestock}
              disabled={loading}
            >
              {loading ? "⏳ กำลังอัปเดต..." : "📦 อัปเดตสต็อก"}
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RestockPage;