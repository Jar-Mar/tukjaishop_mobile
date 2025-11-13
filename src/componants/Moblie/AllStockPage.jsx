import React, { useState, useEffect } from "react";
import { Card, Form, Table, Button, Spinner } from "react-bootstrap";
import axios from "axios";

const API_BASE = "https://192.168.1.118:8000/api/goods";

const AllStockPage = () => {
  const [goods, setGoods] = useState([]);
  const [types, setTypes] = useState([]); // ✅ ประเภทสินค้าจาก DB
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    type: "",
    supplier: "",
    startDate: "",
    endDate: "",
  });

  // ✅ โหลดข้อมูลสินค้าครั้งแรก
  useEffect(() => {
    fetchGoods();
    fetchTypes();
  }, []);

  // ✅ ดึงสินค้าทั้งหมด
  const fetchGoods = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setGoods(res.data);
    } catch (err) {
      console.error("❌ โหลดข้อมูลไม่สำเร็จ:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ดึงประเภทสินค้า
  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/types`);
      setTypes(res.data);
    } catch (err) {
      console.error("⚠️ โหลดประเภทสินค้าไม่สำเร็จ:", err);
    }
  };

  // ✅ เปลี่ยนค่า filter
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
    fetchGoods();
  };

  // ✅ ค้นหาจาก backend
  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.name) params.append("name", filters.name);
      if (filters.type) params.append("type", filters.type);
      if (filters.supplier) params.append("supplier", filters.supplier);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await axios.get(`${API_BASE}?${params.toString()}`);
      setGoods(res.data);
    } catch (err) {
      console.error("❌ ค้นหาไม่สำเร็จ:", err);
      alert("❌ ค้นหาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ✅ เลือก / ยกเลิกเลือก
  const toggleSelect = (barcode) => {
    setSelectedItems((prev) =>
      prev.includes(barcode)
        ? prev.filter((x) => x !== barcode)
        : [...prev, barcode]
    );
  };

  const isSelected = (barcode) => selectedItems.includes(barcode);

  // ✅ พิมพ์ Label หลายรายการ
  const handleBatchPrint = async () => {
    if (selectedItems.length === 0) {
      alert("⚠️ กรุณาเลือกสินค้าที่ต้องการพิมพ์");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/print-labels`, {
        barcodes: selectedItems,
      });
      alert(`🖨️ ${res.data.message}`);
      setSelectedItems([]);
    } catch (err) {
      alert(`❌ พิมพ์ไม่สำเร็จ: ${err.response?.data?.detail || err.message}`);
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
                  {types.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
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

            {/* ปุ่มฟิลเตอร์ */}
            <div className="d-flex justify-content-end mt-3 gap-2">
              <Button variant="secondary" onClick={resetFilters}>
                🔄 รีเซ็ต
              </Button>
              <Button variant="primary" onClick={handleSearch}>
                🔍 ค้นหา
              </Button>
              <Button variant="success" onClick={handleBatchPrint}>
                🖨️ พิมพ์ Label หลายรายการ
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* ตารางแสดงสินค้า */}
      <Card className="shadow-sm rounded-4 border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
              <div className="mt-2">กำลังโหลดข้อมูลสินค้า...</div>
            </div>
          ) : (
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
                {goods.length > 0 ? (
                  goods.map((g, i) => (
                    <tr key={i}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={isSelected(g.barcode)}
                          onChange={() => toggleSelect(g.barcode)}
                        />
                      </td>
                      <td>{g.barcode}</td>
                      <td>{g.name}</td>
                      <td>{g.type}</td>
                      <td>{g.cost?.toLocaleString()}</td>
                      <td className="fw-bold text-primary">
                        {g.price?.toLocaleString()}
                      </td>
                      <td>{g.stock }</td>
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
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AllStockPage;