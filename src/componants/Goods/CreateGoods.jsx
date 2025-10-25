import React, { useState, useEffect, useRef } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Stack from "react-bootstrap/Stack";
import axios from "axios";
import "./Good.css";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateGoods({ API, setBarcode }) {
  const [file, setFile] = useState("image.png");
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [profit, setProfit] = useState(1.2);
  const [Qty, setQty] = useState(1);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [length, setLength] = useState(0);
  const [vender, setVender] = useState("NA");
  const [unit, setUnit] = useState("ชิ้น");
  const [Img, setImg] = useState("");
  const [name, setName] = useState("");
  const [Type, setType] = useState("");
  const [startDate, setStartDate] = useState(new Date());


  function handleChange(e) {
    setFile(URL.createObjectURL(e.target.files[0]));
    imageUploaded();
  }
  function imageUploaded() {
    var base64String = "";
    let file = document.querySelector("input[type=file]")["files"][0];
    let reader = new FileReader();

    reader.onload = function () {
      base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
      setImg(base64String);
    };
    reader.readAsDataURL(file);
  }
  const onRemove = () => {
    location.reload();
  };
  const onCreate = () => {
    const data = {
      _id: "string",
      sn: "string",
      _Name: name,
      _Type: Type,
      _Size: {
        width: width,
        height: height,
        length: length,
      },
      _Cost: cost,
      _price: price,
      _DateIn: new Date(),
      _DateOut: new Date(),
      _Image: Img,
      _Status: "string",
      _Quantity: Qty,
      _Stock: 0,
      _Clear: 0,
      _vendor: "string",
    };
    console.log(data);
    axios.post(API + "/Goods/Create", data).then((response) => {
      setBarcode(response.data.SN);
      console.log(response);
    });
  };

  useEffect(() => {
    setPrice(cost * profit);
  }, [cost]);
  useEffect(() => {
    setPrice(cost * profit);
  }, [profit]);

  return (
    <Stack gap={3}>
      <div className="p-2">
        <img src={file} />
        <input type="file" onChange={handleChange} accept="image/*" />
      </div>
      <div className="p-2">
        <InputGroup className="mb-3">
          <InputGroup.Text>ชื่อ:</InputGroup.Text>
          <Form.Control
            value={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
          />
          <InputGroup.Text>ชนิด</InputGroup.Text>
          <Form.Control
            value={Type}
            type="text"
            onChange={(e) => setType(e.target.value)}
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>ราคาต้นทุน :</InputGroup.Text>
          <Form.Control
            value={cost}
            type="number"
            onChange={(e) => setCost(e.target.value)}
          />

          <InputGroup.Text>จำนวน :</InputGroup.Text>
          <Form.Control
            min={1}
            type="number"
            value={Qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <select
            name="unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          >
            <option value={"ชิ้น"} id="0">
              ชิ้น
            </option>
            <option value={"Kg"} id="1">
              Kg
            </option>
          </select>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>ราคาขาย : </InputGroup.Text>
          <Form.Control
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text> เปอร์เซ็นกำไร : </InputGroup.Text>
          <select
            name="profit"
            value={profit}
            onChange={(event) => setProfit(event.target.value)}
          >
            <option value={1.1} id="0">
              10%
            </option>
            <option value={1.15} id="1">
              15%
            </option>
            <option value={1.2} id="2">
              20%
            </option>
            <option value={1.3} id="3">
              30%
            </option>
            <option value={1.5} id="4">
              50%
            </option>
            <option value={2} id="5">
              200%
            </option>
            <option value={1} id="6">
              กำหนดเอง
            </option>
          </select>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text> วันรับสินค้า </InputGroup.Text>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
          />
        </InputGroup>

        <InputGroup className="mb-3">
       
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text> ขนาด : </InputGroup.Text>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup className="mb-3">
            <InputGroup.Text>กว้าง[cm]</InputGroup.Text>{" "}
            <Form.Control
              className="form"
              type="number"
              value={width}
              min={0}
              onChange={(e) => setWidth(e.target.value)}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text> ยาว[cm]</InputGroup.Text>{" "}
            <Form.Control
              className="form"
              type="number"
              value={length}
              min={0}
              onChange={(e) => setLength(e.target.value)}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>สูง [cm]</InputGroup.Text>{" "}
            <Form.Control
              className="form"
              type="number"
              value={height}
              min={0}
              onChange={(e) => setHeight(e.target.value)}
            />
          </InputGroup>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>ผู้ขาย</InputGroup.Text>
          <Form.Control
            className="form"
            type="text"
            value={vender}
            onChange={(e) => setVender(e.target.value)}
          />
        </InputGroup>
      </div>
      <br />

      <div className="p-2">
        <Button
          variant="outline-success"
          onClick={() => {
            onCreate();
          }}
        >
          {" "}
          บันทึก
        </Button>
        <Button variant="danger" onClick={() => onRemove()}>
          ลบ
        </Button>
      </div>
    </Stack>
  );
}
