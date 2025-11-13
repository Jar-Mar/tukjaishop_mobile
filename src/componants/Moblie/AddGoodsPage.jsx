import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Button,
  Form,
  Card,
  Table,
  Image,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://192.168.1.118:8000"; // ✅ Backend URL

const AddGoodsPage = () => {
  const navigate = useNavigate();

  const [goods, setGoods] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    cost: "",
    profit: 10,
    manualPrice: "",
    quantity: "",
    image: null,
    supplier: "",
    dateReceived: "",
  });

  const fileGalleryRef = useRef(null);
  const fileCameraRef = useRef(null);

  // ✅ โหลดประเภทสินค้า
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/goods/types`);
        if (res.ok) {
          const data = await res.json();
          const updated = [
            ...data.sort((a, b) => a.name.localeCompare(b.name)),
            { _id: "other", name: "อื่นๆ" },
          ];
          setTypes(updated);
        } else {
          setTypes([{ _id: "other", name: "อื่นๆ" }]);
        }
      } catch {
        setTypes([{ _id: "other", name: "อื่นๆ" }]);
      }
    };
    fetchTypes();
  }, []);

  // ✅ คำนวณราคาขายอัตโนมัติ
  const autoPrice = useMemo(() => {
    const cost = Number(form.cost || 0);
    const profit = Number(form.profit || 0);
    if (!cost) return "0.00";
    return (cost * (1 + profit / 100)).toFixed(2);
  }, [form.cost, form.profit]);

  const finalPrice = form.manualPrice ? form.manualPrice : autoPrice;

  // ✅ เปลี่ยนค่าในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  // ✅ อัปโหลดรูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  // ✅ สร้างบาร์โค้ดอัตโนมัติ
  const generateBarcode = () => {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    const d = now.getDate().toString().padStart(2, "0");
    const h = now.getHours().toString().padStart(2, "0");
    const min = now.getMinutes().toString().padStart(2, "0");
    const s = now.getSeconds().toString().padStart(2, "0");
    return `TJ${y}${m}${d}${h}${min}${s}`;
  };

  // ✅ เคลียร์ฟอร์ม
  const clearForm = () =>
    setForm({
      name: "",
      type: "",
      cost: "",
      profit: 10,
      manualPrice: "",
      quantity: "",
      image: null,
      supplier: "",
      dateReceived: "",
    });

  // ✅ เพิ่มสินค้าใหม่
  const handleAddGoods = async () => {
    if (!form.name || !form.type || !form.cost || !form.quantity) {
      setMsg({ type: "danger", text: "⚠️ กรุณากรอกข้อมูลให้ครบ" });
      return;
    }

    const payload = {
      barcode: generateBarcode(),
      name: form.name,
      type: form.type,
      cost: Number(form.cost),
      price: Number(finalPrice),
      stock: Number(form.quantity),
      supplier: form.supplier || "",
      dateReceived: form.dateReceived || "",
      imageBase64: form.image || null,
      profitPercent: Number(form.profit),
      manualPrice: form.manualPrice ? Number(form.manualPrice) : null,
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/goods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setGoods((prev) => [...prev, data.data]);
      setMsg({
        type: "success",
        text: `✅ เพิ่มสินค้า "${form.name}" สำเร็จ (สร้างบาร์โค้ดอัตโนมัติ)`,
      });
      clearForm();
    } catch (err) {
      setMsg({ type: "danger", text: `❌ ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // ✅ ไปหน้าเติมสต็อก
  const goToRestockPage = () => navigate("/restock");

  // ✅ เติมสต็อกจากตาราง
  const handleRowRestock = async (g) => {
    const code = g.barcode;
    const qty = Number(prompt(`เติมสต็อก "${g.name}" กี่ชิ้น?`, "1"));
    if (!qty || qty <= 0) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/goods/restock/${code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
      });
      if (!res.ok) throw new Error(await res.text());
      const ok = await res.json();

      setMsg({ type: "success", text: ok.message });
      setGoods((prev) =>
        prev.map((x) =>
          x.barcode === code ? { ...x, stock: Number(x.stock || 0) + qty } : x
        )
      );
    } catch (e) {
      setMsg({ type: "danger", text: `❌ ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  // ✅ ลบบาร์โค้ดจากตาราง
  const handleRowClearBarcode = async (g) => {
    const code = g.barcode;
    if (!window.confirm(`ยืนยันลบบาร์โค้ด ${code} ออกจาก "${g.name}"?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/goods/clear-barcode/${code}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(await res.text());
      const ok = await res.json();

      setMsg({ type: "success", text: ok.message });
      setGoods((prev) =>
        prev.map((x) => (x.barcode === code ? { ...x, barcode: "" } : x))
      );
    } catch (e) {
      setMsg({ type: "danger", text: `❌ ${e.message}` });
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
        paddingBottom: "90px",
        overflowY: "auto",
      }}
    >
      <div style={{ width: "100%", padding: "15px" }}>
        <h4 className="text-center mb-3">📦 เพิ่มสินค้าใหม่</h4>

        {msg && (
          <Alert
            variant={msg.type}
            onClose={() => setMsg(null)}
            dismissible
            className="py-2"
          >
            {msg.text}
          </Alert>
        )}

        <Card className="shadow-sm rounded-4 border-0 mb-4">
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ชื่อสินค้า</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="เช่น เก้าอี้สำนักงาน Model X"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ประเภทสินค้า</Form.Label>
                <Form.Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="">-- เลือกประเภทสินค้า --</option>
                  {types.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="row">
                <div className="col-6">
                  <Form.Group className="mb-3">
                    <Form.Label>ต้นทุน (บาท)</Form.Label>
                    <Form.Control
                      type="number"
                      name="cost"
                      value={form.cost}
                      onChange={handleChange}
                      placeholder="เช่น 500"
                    />
                  </Form.Group>
                </div>
                <div className="col-6">
                  <Form.Group className="mb-3">
                    <Form.Label>กำไร (%)</Form.Label>
                    <Form.Select
                      name="profit"
                      value={form.profit}
                      onChange={handleChange}
                    >
                      {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => (
                        <option key={p} value={p}>
                          {p}%
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>ราคาขายอัตโนมัติ (บาท)</Form.Label>
                <Form.Control value={autoPrice} readOnly />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ราคาขาย Manual (บาท)</Form.Label>
                <Form.Control
                  type="number"
                  name="manualPrice"
                  value={form.manualPrice}
                  onChange={handleChange}
                  placeholder="ใส่ราคาขายเอง (ถ้ามี)"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>จำนวนสินค้า (ชิ้น)</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="เช่น 10"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>คู่ค้า / ผู้จำหน่าย</Form.Label>
                <Form.Control
                  name="supplier"
                  value={form.supplier}
                  onChange={handleChange}
                  placeholder="เช่น บริษัท ABC จำกัด"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>วันที่รับสินค้า</Form.Label>
                <Form.Control
                  type="date"
                  name="dateReceived"
                  value={form.dateReceived}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* รูปสินค้า */}
              <Form.Group className="mb-3 text-center">
                <Form.Label>📷 รูปภาพสินค้า</Form.Label>
                <div className="d-flex flex-column align-items-center">
                  {form.image ? (
                    <Image
                      src={form.image}
                      rounded
                      style={{
                        width: "180px",
                        height: "180px",
                        objectFit: "cover",
                        marginBottom: "10px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "180px",
                        height: "180px",
                        background: "#f0f0f0",
                        borderRadius: "10px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#aaa",
                      }}
                    >
                      ไม่มีรูป
                    </div>
                  )}

                  <div className="d-flex justify-content-center gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => fileGalleryRef.current.click()}
                    >
                      📁 เลือกรูป
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => fileCameraRef.current.click()}
                    >
                      📸 ถ่ายรูป
                    </Button>
                  </div>

                  <Form.Control
                    type="file"
                    accept="image/*"
                    ref={fileGalleryRef}
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <Form.Control
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileCameraRef}
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </Form.Group>

              <div className="d-flex gap-2 mt-3">
                <Button variant="outline-success" onClick={goToRestockPage}>
                  📦 เติมสต็อก
                </Button>
              </div>

              <Button
                variant="primary"
                className="w-100 mt-3"
                onClick={handleAddGoods}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />{" "}
                    กำลังบันทึก...
                  </>
                ) : (
                  "➕ เพิ่มสินค้า (สร้างบาร์โค้ดอัตโนมัติ)"
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* ✅ ตารางสินค้า */}
        {goods.length > 0 && (
          <Card className="shadow-sm border-0">
            <Card.Body className="p-2">
              <h6 className="fw-bold mb-2">สินค้าใหม่ล่าสุด</h6>
              <Table bordered responsive size="sm" className="text-center">
                <thead>
                  <tr>
                    <th>รูป</th>
                    <th>ชื่อสินค้า</th>
                    <th>ประเภท</th>
                    <th>ราคา</th>
                    <th>สต็อก</th>
                    <th>บาร์โค้ด</th>
                    <th>คู่ค้า</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {goods.map((g, i) => (
                    <tr key={i}>
                      <td>
                        {g.imageBase64 ? (
                          <img
                            src={g.imageBase64}
                            alt="img"
                            width="50"
                            height="50"
                            style={{ objectFit: "cover", borderRadius: "5px" }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{g.name}</td>
                      <td>{g.type}</td>
                      <td>{Number(g.price ?? 0).toLocaleString()}</td>
                      <td>{Number(g.stock ?? 0)}</td>
                      <td>{g.barcode || "-"}</td>
                      <td>{g.supplier || "-"}</td>
                      <td className="d-flex gap-1 justify-content-center">
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleRowRestock(g)}
                        >
                          📦 เติมสต็อก
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleRowClearBarcode(g)}
                          disabled={!g.barcode}
                        >
                          🧹 ลบบาร์โค้ด
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddGoodsPage;