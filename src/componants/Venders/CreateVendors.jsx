import {React,useState} from "react";
import axios from "axios";
import Form from "react-bootstrap/Form";
import { InputGroup, Button,Modal } from "react-bootstrap";

import api from "../../config/api.json"
export default function CreateVendors() {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

  const [vendor,setVendor] = useState({
    "vendorId": "",
    "name": "",
    "phone": "",
    "bank": {
      "account": "",
      "name": "",
      "promptPay": ""
    }
  });
 
const onBankChange = (data,value) =>{
    let Bank =  vendor;
    Bank.bank[data] = value;
    setVendor(Bank);
}

const onSave = ()=>{
    console.log("onSave");
   
    axios.post(api.Backend+'/Vendor/Create', vendor)
      .then(function (response) {
        console.log(response);
        handleShow()
        
      })
      .catch(function (error) {
        console.log(error);
      });
   
}



  return (
    <div>
      <Form.Label htmlFor="basic-url">ร้านค้า</Form.Label>
      <InputGroup className="mb-3">
        <Form.Control size="lg" type="text" placeholder="ชื่อร้านค้า" onChange={(e)=>  setVendor({...vendor,  "name":e.target.value})}/>
        <br />
        <Form.Control size="lg" type="text" placeholder="เบอร์โทร" onChange={(e)=>  setVendor({...vendor,  "phone":e.target.value})} />
      </InputGroup>
      <br />
      <Form.Label htmlFor="basic-url">บัชชีธนาคาร</Form.Label>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon3">
          <Form.Control size="lg" type="text" placeholder="บัชชี" onChange={(e)=> onBankChange("account",e.target.value) } />
          <br />
          <Form.Control size="lg" type="text" placeholder="ธนาคาร" onChange={(e)=>  onBankChange("name",e.target.value) } />
          <br />
          <Form.Control size="lg" type="text" placeholder="พร้อมเพย์" onChange={(e)=>  onBankChange("promptPay",e.target.value) }/>
          <br />
        </InputGroup.Text>
      </InputGroup>
      <br />
      <Button onClick={()=>onSave()}>บันทึก</Button>
    
  
    </div>
  );
}
