import React, { useState, useMemo } from "react";
import { Card, Form, Table, Button } from "react-bootstrap";
import QRCode from "qrcode";

const AllStockPage = () => {
  const [goods] = useState([
    {
      id: "123456",
      name: "Camera Lens",
      type: "กล้อง",
      cost: 1500,
      price: 2300,
      quantity: 12,
      supplier: "บริษัท ABC จำกัด",
      dateReceived: "2025-10-20",
    },
    {
      id: "789012",
      name: "Lighting Kit",
      type: "ไฟส่องวัตถุ",
      cost: 3200,
      price: 4500,
      quantity: 8,
      supplier: "บริษัท Vision Light Co.",
      dateReceived: "2025-10-22",
    },
    {
      id: "345678",
      name: "Encoder Cable",
      type: "สายสัญญาณ",
      cost: 450,
      price: 700,
      quantity: 24,
      supplier: "บริษัท Motion Connect",
      dateReceived: "2025-10-25",
    },
  ]);

  const [filters, setFilters] = useState({
    name: "",
    type: "",
    supplier: "",
    startDate: "",
    endDate: "",
  });

  const [selectedItems, setSelectedItems] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      type: "",
      supplier: "",
      startDate: "",
      endDate: "",
    });
  };

  const filteredGoods = useMemo(() => {
    return goods.filter((g) => {
      const gDate = new Date(g.dateReceived);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      const isInDateRange =
        (!start || gDate >= start) && (!end || gDate <= end);

      return (
        (filters.name === "" ||
          g.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.type === "" || g.type === filters.type) &&
        (filters.supplier === "" ||
          g.supplier.toLowerCase().includes(filters.supplier.toLowerCase())) &&
        isInDateRange
      );
    });
  }, [filters, goods]);

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedItems.includes(id);

  // ✅ พิมพ์ QR Code สำหรับสินค้าที่เลือก
  const handlePrintQRCodes = async () => {
    if (selectedItems.length === 0) {
      alert("⚠️ กรุณาเลือกสินค้าที่ต้องการพิมพ์ QR Code");
      return;
    }

    const selectedGoods = goods.filter((g) => selectedItems.includes(g.id));
    const qrImages = await Promise.all(
      selectedGoods.map(async (item) => {
        const data = `${item.name}\nID:${item.id}\n฿${item.price}`;
        const qrDataUrl = await QRCode.toDataURL(data, {
          margin: 1,
          width: 120,
        });
        return { ...item, qrDataUrl };
      })
    );

    const htmlContent = `
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>QR Code Labels 58mm</title>
        <style>
          @page { size: 58mm auto; margin: 0; }
          body {
            font-family: monospace;
            width: 58mm;
            margin: 0;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .label {
            width: 54mm;
            border-bottom: 1px dashed #888;
            padding: 4mm 0;
            text-align: center;
            page-break-inside: avoid;
          }
          img {
            width: 38mm;
            height: 38mm;
            margin-bottom: 2mm;
          }
          h4 {
            font-size: 13px;
            margin: 1mm 0;
          }
          small {
            display: block;
            font-size: 12px;
          }
          strong {
            display: block;
            margin-top: 1mm;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        ${qrImages
          .map(
            (item) => `
            <div class="label">
              <img src="${item.qrDataUrl}" alt="QR Code"/>
              <h4>${item.name}</h4>
              <small>รหัส: ${item.id}</small>
              <strong>฿${item.price.toLocaleString()}</strong>
            </div>
          `
          )
          .join("")}
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
      <h4 className="text-center mb-3">📦 ตรวจสอบคลังสินค้า</h4>

      {/* ฟิลเตอร์ */}
      <Card className="shadow-sm rounded-4 mb-4 border-0">
        <Card.Body>
          <Form>
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <Form.Label>ชื่อสินค้า</Form.Label>
                <Form.Control
                  name="name"
                  value={filters.name}
                  onChange={handleChange}
                  placeholder="ค้นหาชื่อสินค้า"
                />
              </div>
              <div className="col-12 col-md-6">
                <Form.Label>ประเภทสินค้า</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleChange}
                >
                  <option value="">-- ทั้งหมด --</option>
                  <option value="กล้อง">กล้อง</option>
                  <option value="สายสัญญาณ">สายสัญญาณ</option>
                  <option value="ไฟส่องวัตถุ">ไฟส่องวัตถุ</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </Form.Select>
              </div>

              <div className="col-12 col-md-6 mt-2">
                <Form.Label>คู่ค้า / Supplier</Form.Label>
                <Form.Control
                  name="supplier"
                  value={filters.supplier}
                  onChange={handleChange}
                  placeholder="พิมพ์ชื่อคู่ค้า เช่น ABC"
                />
              </div>

              <div className="col-6 col-md-3 mt-2">
                <Form.Label>วันที่รับสินค้า (จาก)</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6 col-md-3 mt-2">
                <Form.Label>ถึงวันที่</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3 gap-2">
              <Button variant="secondary" onClick={resetFilters}>
                🔄 รีเซ็ต
              </Button>
              <Button variant="success" onClick={handlePrintQRCodes}>
                🖨️ พิมพ์ QR Code (58 mm)
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* ตารางแสดงสินค้า */}
      <Card className="shadow-sm rounded-4 border-0">
        <Card.Body>
          <Table bordered responsive hover size="sm" className="text-center">
            <thead>
              <tr className="bg-light">
                <th>เลือก</th>
                <th>รหัสสินค้า</th>
                <th>ชื่อสินค้า</th>
                <th>ประเภท</th>
                <th>ต้นทุน</th>
                <th>ราคาขาย</th>
                <th>จำนวน</th>
                <th>คู่ค้า</th>
                <th>วันที่รับ</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoods.length > 0 ? (
                filteredGoods.map((g, i) => (
                  <tr key={i}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={isSelected(g.id)}
                        onChange={() => toggleSelect(g.id)}
                      />
                    </td>
                    <td>{g.id}</td>
                    <td>{g.name}</td>
                    <td>{g.type}</td>
                    <td>{g.cost.toLocaleString()}</td>
                    <td>{g.price.toLocaleString()}</td>
                    <td>{g.quantity}</td>
                    <td>{g.supplier}</td>
                    <td>{g.dateReceived}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-muted">
                    ❌ ไม่พบสินค้าตรงกับเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AllStockPage;