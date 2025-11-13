import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Form,
  Table,
  Button,
  Spinner,
  Modal,
  ListGroup,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "https://192.168.1.118:8000/api/orders";

const SalesReportPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ✅ โหลดข้อมูลจาก Backend
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      setSalesData(data || []);
    } catch (e) {
      console.error("❌ โหลดข้อมูลยอดขายล้มเหลว:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ พิมพ์ใบเสร็จตาม id
  const handlePrintOrder = async (orderId) => {
    if (!orderId) return;
    try {
      setLoading(true);
      const printRes = await fetch(`${API_BASE}/print/${orderId}`, {
        method: "POST",
      });
      const result = await printRes.json();
      alert(result.message || "✅ พิมพ์ใบเสร็จเรียบร้อย");
    } catch (e) {
      alert("❌ ไม่สามารถพิมพ์ใบเสร็จได้");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ กรองตามช่วงวันที่
  const filteredSales = useMemo(() => {
    return salesData.filter((s) => {
      const date = new Date(s.date || s.created_at || s._id?.substring(0, 8));
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      return (!start || date >= start) && (!end || date <= end);
    });
  }, [filters, salesData]);

  // ✅ สรุปยอดขายรายวัน
  const dailySummary = useMemo(() => {
    const summary = {};
    filteredSales.forEach((s) => {
      const date = new Date(s.date || s.created_at || Date.now())
        .toISOString()
        .slice(0, 10);
      if (!summary[date]) summary[date] = 0;
      summary[date] += s.total_net || s.total || 0;
    });
    return Object.entries(summary).map(([date, total]) => ({ date, total }));
  }, [filteredSales]);

  // ✅ สินค้าขายดี
  const bestSellers = useMemo(() => {
    const map = {};
    filteredSales.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!map[item.name])
          map[item.name] = {
            name: item.name,
            type: "-",
            quantity: 0,
            total: 0,
          };
        map[item.name].quantity += item.qty;
        map[item.name].total += item.total;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredSales]);

  const totalSales = filteredSales.reduce(
    (sum, s) => sum + (s.total_net || s.total || 0),
    0
  );

  useEffect(() => {
    const resize = () => window.dispatchEvent(new Event("resize"));
    setTimeout(resize, 300);
  }, [salesData]);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#fafafa",
        padding: "15px 10px 90px",
      }}
    >
      <h4 className="text-center mb-3">📈 รายงานยอดขาย</h4>

      {/* ปุ่มการจัดการ */}
      <div className="text-center mb-3">
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="me-2"
        >
          🧾 พิมพ์ใบเสร็จ (เลือกได้)
        </Button>
        <Button variant="outline-secondary" onClick={fetchSales}>
          🔄 โหลดข้อมูลใหม่
        </Button>
      </div>

      {/* 🔹 Modal เลือกใบเสร็จ */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>🧾 เลือกใบเสร็จที่ต้องการพิมพ์</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {salesData.length === 0 ? (
            <p className="text-center text-muted">❌ ยังไม่มีคำสั่งซื้อ</p>
          ) : (
            <ListGroup>
              {salesData.slice(0, 50).map((order) => (
                <ListGroup.Item
                  key={order._id}
                  action
                  onClick={() => setSelectedOrder(order)}
                  active={selectedOrder?._id === order._id}
                >
                  🧾 {order._id.slice(-6)} —{" "}
                  {new Date(order.date).toLocaleString("th-TH")} —{" "}
                  {order.total_net?.toLocaleString()} บาท
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ❌ ปิด
          </Button>
          <Button
            variant="success"
            disabled={!selectedOrder}
            onClick={() => handlePrintOrder(selectedOrder._id)}
          >
            🖨️ พิมพ์ใบเสร็จนี้
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🔹 ฟอร์มกรองช่วงวัน */}
      <Card className="shadow-sm rounded-4 mb-4 border-0">
        <Card.Body>
          <Form>
            <div className="row g-2">
              <div className="col-6">
                <Form.Label>วันที่เริ่มต้น</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6">
                <Form.Label>ถึงวันที่</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="text-end mt-3">
              <Button
                variant="secondary"
                onClick={() => setFilters({ startDate: "", endDate: "" })}
              >
                🔄 รีเซ็ตช่วงวัน
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* 🔹 กราฟยอดขาย */}
      <Card className="shadow-sm rounded-4 mb-4 border-0">
        <Card.Body>
          <h6 className="text-center mb-3">📊 กราฟยอดขายตามวัน</h6>
          {dailySummary.length > 0 ? (
            <div style={{ width: "100%", minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} บาท`} />
                  <Bar dataKey="total" fill="#0d6efd" name="ยอดขาย (บาท)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-muted mt-3">
              ❌ ยังไม่มีข้อมูลในช่วงวันที่เลือก
            </p>
          )}
        </Card.Body>
      </Card>

      {/* 🔹 สินค้าขายดี */}
      <Card className="shadow-sm rounded-4 border-0">
        <Card.Body>
          <h6 className="text-center mb-3">🏆 สินค้าขายดี</h6>
          {bestSellers.length > 0 ? (
            <Table bordered responsive size="sm" className="text-center">
              <thead className="bg-light">
                <tr>
                  <th>อันดับ</th>
                  <th>ชื่อสินค้า</th>
                  <th>จำนวน</th>
                  <th>ยอดขายรวม (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity.toLocaleString()}</td>
                    <td>{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">
              ❌ ไม่มีข้อมูลสินค้าขายดีในช่วงวันที่นี้
            </p>
          )}
          <div className="text-end mt-3 fw-bold">
            💰 ยอดขายรวมทั้งหมด: {totalSales.toLocaleString()} บาท
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SalesReportPage;