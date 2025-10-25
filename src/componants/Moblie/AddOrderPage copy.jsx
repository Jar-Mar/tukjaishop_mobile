import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Card, Table } from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const AddOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", qty: "", price: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [scanning, setScanning] = useState(false);
  const idInputRef = useRef(null);

  // Optional: simple local product DB
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
    const idValue = (form.id || "").trim() === "" ? "99" : form.id.trim();
    const qtyNum = Number(form.qty);
    const priceNum = Number(form.price);
    if (!form.name || isNaN(qtyNum) || isNaN(priceNum) || form.name.trim() === "") {
      alert("Please input Name, Qty, and Price");
      return;
    }

    const newOrder = {
      id: idValue,
      name: form.name.trim(),
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
      setOrders((o) => [...o, newOrder]);
    }

    setForm({ id: "", name: "", qty: "", price: "" });
    idInputRef.current?.focus();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    addOrUpdateOrder();
  };

  const handleScan = (err, result) => {
    if (result) {
      const code = result.text.trim();
      if (!code) return;

      new Audio("/beep.mp3").play().catch(() => {});

      const found = productDatabase[code];
      if (found) {
        setForm({
          id: code,
          name: found.name,
          qty: 1,
          price: found.price,
        });
        setTimeout(() => addOrUpdateOrder(), 300);
      } else {
        setForm((f) => ({ ...f, id: code }));
      }

      setScanning(false);
      idInputRef.current?.focus();
    }
    if (err) console.error(err);
  };

  const editOrder = (index) => {
    setForm({
      id: String(orders[index].id ?? ""),
      name: String(orders[index].name ?? ""),
      qty: String(orders[index].qty ?? ""),
      price: String(orders[index].price ?? ""),
    });
    setEditIndex(index);
  };

  const deleteOrder = (index) => {
    setOrders((o) => o.filter((_, i) => i !== index));
    if (editIndex === index) setEditIndex(null);
  };

  const calculateTotal = (order) => order.qty * order.price;
  const grandTotal = orders.reduce((sum, o) => sum + calculateTotal(o), 0);

  // 🖨️ Print receipt function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-3 mb-5">
      <h4 className="mb-3 text-center">🧾 Add / Manage Orders</h4>

      {/* Input Form */}
      <Card className="shadow-sm rounded-4 mb-4 no-print">
        <Card.Body>
          <Form onSubmit={onSubmit} noValidate>
            <Form.Group className="mb-2">
              <div className="d-flex gap-2">
                <Form.Control
                  ref={idInputRef}
                  placeholder="ID (Scan barcode or leave blank)"
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                />
                <Button
                  variant={scanning ? "danger" : "secondary"}
                  onClick={() => setScanning((prev) => !prev)}
                >
                  {scanning ? "✖ Stop" : "📷 Scan"}
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
                <small className="text-muted d-block mt-1">
                  Scanning with back camera...
                </small>
              </div>
            )}

            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="number"
                placeholder="Quantity"
                name="qty"
                value={form.qty}
                onChange={handleChange}
                inputMode="numeric"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                placeholder="Price"
                name="price"
                value={form.price}
                onChange={handleChange}
                inputMode="decimal"
              />
            </Form.Group>

            <Button
              type="submit"
              variant={editIndex !== null ? "warning" : "primary"}
              className="w-100"
            >
              {editIndex !== null ? "✏️ Update Order" : "➕ Add Order"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      {orders.length > 0 && (
        <>
          <Card className="shadow-sm rounded-4 mb-4">
            <Card.Body>
              <Table responsive borderless size="sm" className="mb-0 print-receipt">
                <thead>
                  <tr className="text-secondary">
                    <th>ID</th>
                    <th>Name</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Total</th>
                    <th className="text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i}>
                      <td>{order.id}</td>
                      <td>{order.name}</td>
                      <td className="text-end">{order.qty}</td>
                      <td className="text-end">{order.price.toLocaleString()}</td>
                      <td className="text-end fw-semibold text-primary">
                        {calculateTotal(order).toLocaleString()}
                      </td>
                      <td className="text-center no-print">
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
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Summary + Print Button */}
          <Card className="shadow-sm rounded-4">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <strong>Grand Total</strong>
              <h5 className="text-primary mb-0">
                {grandTotal.toLocaleString()} THB
              </h5>
            </Card.Body>
          </Card>

          <div className="text-center mt-3 no-print">
            <Button variant="success" onClick={handlePrint}>
              🖨️ Print Receipt
            </Button>
          </div>
        </>
      )}

      {/* Print Style */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-receipt {
            font-size: 12px;
          }
          .print-receipt th, .print-receipt td {
            border-bottom: 1px solid #ddd !important;
          }
          h4, strong, h5 {
            color: black !important;
          }
          .text-primary {
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AddOrderPage;