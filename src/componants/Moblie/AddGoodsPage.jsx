import React, { useState, useRef } from "react";
import { Button, Form, Card, Table, Image } from "react-bootstrap";

const AddGoodsPage = () => {
  const [goods, setGoods] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "",
    cost: "",
    profit: 10,
    manualPrice: "",
    quantity: "", // ✅ new field
    image: null,
    supplier: "",
    dateReceived: "",
  });

  const fileGalleryRef = useRef(null);
  const fileCameraRef = useRef(null);

  const autoPrice =
    form.cost && form.profit
      ? (Number(form.cost) * (1 + Number(form.profit) / 100)).toFixed(2)
      : "0.00";

  const finalPrice = form.manualPrice || autoPrice;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddGoods = () => {
    if (!form.name || !form.type || !form.cost || !form.quantity) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง (รวมจำนวนสินค้า)");
      return;
    }

    const newItem = {
      ...form,
      cost: Number(form.cost),
      profit: Number(form.profit),
      price: Number(finalPrice),
      quantity: Number(form.quantity),
    };

    setGoods((prev) => [...prev, newItem]);

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
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
        paddingBottom: "90px",
        overflowY: "auto",
        paddingTop: "15px",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "0 10px",
        }}
      >
        <h4 className="text-center mb-3">📦 เพิ่มสินค้าใหม่</h4>

        <Card className="shadow-sm rounded-4 mb-4 border-0 w-100">
          <Card.Body className="p-3">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ชื่อสินค้า</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="เช่น กล้องตรวจสอบ, ไฟส่องวัตถุ"
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
                  <option value="กล้อง">กล้อง</option>
                  <option value="สายสัญญาณ">สายสัญญาณ</option>
                  <option value="ไฟส่องวัตถุ">ไฟส่องวัตถุ</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </Form.Select>
              </Form.Group>

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

              <Form.Group className="mb-3">
                <Form.Label>กำไร (%)</Form.Label>
                <Form.Select name="profit" value={form.profit} onChange={handleChange}>
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => (
                    <option key={p} value={p}>{p}%</option>   
                  ))}
                </Form.Select>
              </Form.Group>

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

              {/* ✅ จำนวนสินค้า */}
              <Form.Group className="mb-3">
                <Form.Label>จำนวนสินค้าที่เพิ่ม (ชิ้น)</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="เช่น 10"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>รับสินค้าจากคู่ค้า / ผู้จำหน่าย</Form.Label>
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
                <Form.Label className="fw-semibold">📷 รูปภาพสินค้า</Form.Label>
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
                      📁 เลือกรูปจากเครื่อง
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

              <Button
                variant="primary"
                className="w-100"
                onClick={handleAddGoods}
              >
                ➕ เพิ่มสินค้า
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* ตารางสินค้า */}
        {goods.length > 0 && (
          <Card className="shadow-sm rounded-4 border-0 mb-4">
            <Card.Body className="p-2">
              <Table responsive bordered size="sm" className="text-center mb-0">
                <thead>
                  <tr>
                    <th>รูป</th>
                    <th>ชื่อสินค้า</th>
                    <th>ประเภท</th>
                    <th>จำนวน</th> {/* ✅ new column */}
                    <th>ต้นทุน</th>
                    <th>ราคาขาย</th>
                    <th>คู่ค้า</th>
                    <th>วันที่รับ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {goods.map((g, i) => (
                    <tr key={i}>
                      <td>
                        {g.image ? (
                          <img
                            src={g.image}
                            alt="item"
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
                      <td>{g.quantity}</td> {/* ✅ show quantity */}
                      <td>{g.cost.toLocaleString()}</td>
                      <td className="fw-bold text-primary">
                        {g.price.toLocaleString()}
                      </td>
                      <td>{g.supplier}</td>
                      <td>{g.dateReceived}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            setGoods(goods.filter((_, j) => j !== i))
                          }
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
        )}
      </div>
    </div>
  );
};

export default AddGoodsPage;