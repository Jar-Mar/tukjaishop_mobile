import React, { useState, useMemo } from "react";
import { Card, Form, Table } from "react-bootstrap";
import { Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const SalesReportPage = () => {
  // 🔹 ตัวอย่างข้อมูลยอดขาย
  const [salesData] = useState([
    {
      date: "2025-10-20",
      name: "Camera Lens",
      quantity: 3,
      price: 2300,
      type: "กล้อง",
    },
    {
      date: "2025-10-21",
      name: "Lighting Kit",
      quantity: 2,
      price: 4500,
      type: "ไฟส่องวัตถุ",
    },
    {
      date: "2025-10-22",
      name: "Encoder Cable",
      quantity: 6,
      price: 700,
      type: "สายสัญญาณ",
    },
    {
      date: "2025-10-23",
      name: "Camera Lens",
      quantity: 4,
      price: 2300,
      type: "กล้อง",
    },
    {
      date: "2025-10-24",
      name: "Lighting Kit",
      quantity: 3,
      price: 4500,
      type: "ไฟส่องวัตถุ",
    },
  ]);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 กรองข้อมูลตามวันที่
  const filteredSales = useMemo(() => {
    return salesData.filter((s) => {
      const date = new Date(s.date);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      return (
        (!start || date >= start) &&
        (!end || date <= end)
      );
    });
  }, [filters, salesData]);

  // 🔹 สรุปยอดขายรายวัน (เพื่อทำกราฟ)
  const dailySummary = useMemo(() => {
    const summary = {};
    filteredSales.forEach((s) => {
      if (!summary[s.date]) summary[s.date] = 0;
      summary[s.date] += s.quantity * s.price;
    });
    return Object.entries(summary).map(([date, total]) => ({
      date,
      total,
    }));
  }, [filteredSales]);

  // 🔹 หาสินค้าขายดี
  const bestSellers = useMemo(() => {
    const map = {};
    filteredSales.forEach((s) => {
      if (!map[s.name]) map[s.name] = { name: s.name, type: s.type, quantity: 0, total: 0 };
      map[s.name].quantity += s.quantity;
      map[s.name].total += s.quantity * s.price;
    });
    return Object.values(map)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredSales]);

  const totalSales = filteredSales.reduce(
    (sum, s) => sum + s.quantity * s.price,
    0
  );

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

      {/* กราฟยอดขาย */}
      <Card className="shadow-sm rounded-4 mb-4 border-0">
        <Card.Body>
          <h6 className="text-center mb-3">📊 กราฟยอดขายตามวัน</h6>
          {dailySummary.length > 0 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
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

      {/* สินค้าขายดี */}
      <Card className="shadow-sm rounded-4 border-0">
        <Card.Body>
          <h6 className="text-center mb-3">🏆 สินค้าขายดี</h6>
          {bestSellers.length > 0 ? (
            <Table bordered responsive size="sm" className="text-center">
              <thead className="bg-light">
                <tr>
                  <th>อันดับ</th>
                  <th>ชื่อสินค้า</th>
                  <th>ประเภท</th>
                  <th>จำนวนที่ขายได้</th>
                  <th>ยอดขายรวม (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
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