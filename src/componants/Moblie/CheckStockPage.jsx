import React, { useState } from "react";
import { Card, Button, Form, Table, Alert } from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const CheckStockPage = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [foundProduct, setFoundProduct] = useState(null);

  // ✅ Simulated stock database (can later connect to backend)
  const productStock = [
    {
      id: "123456",
      name: "Camera Lens",
      type: "กล้อง",
      cost: 1500,
      price: 2300,
      quantity: 12,
      supplier: "บริษัท ABC จำกัด",
    },
    {
      id: "789012",
      name: "Lighting Kit",
      type: "ไฟส่องวัตถุ",
      cost: 3200,
      price: 4500,
      quantity: 8,
      supplier: "บริษัท Vision Light Co.",
    },
    {
      id: "345678",
      name: "Encoder Cable",
      type: "สายสัญญาณ",
      cost: 450,
      price: 700,
      quantity: 24,
      supplier: "บริษัท Motion Connect",
    },
  ];

  const handleScan = (err, result) => {
    if (result) {
      const code = result.text.trim();
      setScanResult(code);
      setScanning(false);

      const product = productStock.find((p) => p.id === code);
      if (product) {
        setFoundProduct(product);
        new Audio("/beep.mp3").play().catch(() => {});
      } else {
        setFoundProduct(null);
      }
    }
  };

  const handleManualSearch = () => {
    const code = scanResult.trim();
    if (!code) {
      alert("⚠️ กรุณาใส่รหัสสินค้าก่อนค้นหา");
      return;
    }
    const product = productStock.find((p) => p.id === code);
    if (product) {
      setFoundProduct(product);
      new Audio("/beep.mp3").play().catch(() => {});
    } else {
      alert("❌ ไม่พบสินค้านี้ในระบบ");
      setFoundProduct(null);
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
          >
            🔎 ตรวจสอบสินค้า
          </Button>
        </Card.Body>
      </Card>

      {/* ✅ Alerts */}
      {foundProduct ? (
        <Alert variant="success" className="text-center fw-bold">
          ✅ พบสินค้าในระบบ
        </Alert>
      ) : scanResult && !scanning ? (
        <Alert variant="danger" className="text-center">
          ❌ ไม่พบสินค้าในระบบ
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
                  <th>คู่ค้า</th> {/* ✅ New column */}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{foundProduct.name}</td>
                  <td>{foundProduct.type}</td>
                  <td>{foundProduct.cost.toLocaleString()}</td>
                  <td>{foundProduct.price.toLocaleString()}</td>
                  <td className="fw-bold text-success">
                    {foundProduct.quantity.toLocaleString()}
                  </td>
                  <td className="text-secondary">{foundProduct.supplier}</td>
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