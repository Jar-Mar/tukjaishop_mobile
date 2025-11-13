import React, { useState } from "react";
import { Card, Button, Form, Table, Alert, Spinner } from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import axios from "axios";

const API_BASE = "https://192.168.1.118:8000/api/goods"; // ✅ Backend URL

const CheckStockPage = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [foundProduct, setFoundProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Handle QR / Barcode scan
  const handleScan = async (err, result) => {
    if (result) {
      const code = result.text.trim();
      setScanResult(code);
      setScanning(false);
      await searchProduct(code);
    }
  };

  // ✅ Manual search by input
  const handleManualSearch = async () => {
    const code = scanResult.trim();
    if (!code) {
      alert("⚠️ กรุณาใส่รหัสสินค้าก่อนค้นหา");
      return;
    }
    await searchProduct(code);
  };

  // ✅ Search product from backend
  const searchProduct = async (barcode) => {
    try {
      setLoading(true);
      setErrorMessage("");
      setFoundProduct(null);

      const res = await axios.get(`${API_BASE}/barcode/${barcode}`);
      if (res.data) {
        setFoundProduct(res.data);
        new Audio("/beep.mp3").play().catch(() => {});
      } else {
        setErrorMessage("❌ ไม่พบสินค้านี้ในระบบ");
      }
    } catch (err) {
      console.error("ไม่พบสินค้า:", err);
      setErrorMessage("❌ ไม่พบสินค้านี้ในระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#fafafa",
        padding: "15px 10px 90px",
      }}
    >
      <h4 className="text-center mb-3">📦 ตรวจสอบสต๊อกสินค้า</h4>

      <Card className="shadow-sm rounded-4 mb-4 border-0 w-100">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>🔍 สแกนหรือกรอกรหัสสินค้า</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                placeholder="Scan QR code หรือกรอกรหัสสินค้า"
                value={scanResult}
                onChange={(e) => setScanResult(e.target.value)}
              />
              <Button
                variant={scanning ? "danger" : "secondary"}
                onClick={() => setScanning((prev) => !prev)}
              >
                {scanning ? "✖ หยุด" : "📷 สแกน"}
              </Button>
            </div>
          </Form.Group>

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

          <Button
            variant="primary"
            className="w-100"
            onClick={handleManualSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> กำลังตรวจสอบ...
              </>
            ) : (
              "🔎 ตรวจสอบสินค้า"
            )}
          </Button>
        </Card.Body>
      </Card>

      {/* ✅ Alerts */}
      {foundProduct ? (
        <Alert variant="success" className="text-center fw-bold">
          ✅ พบสินค้าในระบบ
        </Alert>
      ) : errorMessage && !loading ? (
        <Alert variant="danger" className="text-center">
          {errorMessage}
        </Alert>
      ) : null}

      {/* ✅ Product Info */}
      {foundProduct && (
        <Card className="shadow-sm rounded-4 border-0">
          <Card.Body>
            <Table bordered responsive size="sm" className="text-center mb-0">
              <thead>
                <tr className="bg-light">
                  <th>ชื่อสินค้า</th>
                  <th>ประเภท</th>
                  <th>ต้นทุน (บาท)</th>
                  <th>ราคาขาย (บาท)</th>
                  <th>คงเหลือ (ชิ้น)</th>
                  <th>คู่ค้า</th>
                  <th>วันที่รับ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{foundProduct.name}</td>
                  <td>{foundProduct.type}</td>
                  <td>{foundProduct.cost?.toLocaleString()}</td>
                  <td className="fw-bold text-primary">
                    {foundProduct.price?.toLocaleString()}
                  </td>
                  <td className="fw-bold text-success">
                    {foundProduct.stock?.toLocaleString()}
                  </td>
                  <td>{foundProduct.supplier || "-"}</td>
                  <td>{foundProduct.dateReceived || "-"}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default CheckStockPage;