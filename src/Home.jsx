import React, { useState, useEffect } from "react";
import { Navbar, Container, Row, Col } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import api from "./config/api.json";
// import CreateVendors from './componants/Venders/createVendors'
import CreateGoods from "./componants/Goods/CreateGoods";
import DataMatrixModal from "./componants/DataMatrix/DataMatrixModal";
import BillPage from "./componants/Bill/BillPage";
import HeaderBar from "./componants/Header/Header";
import "./App.css";
import OrderPage from "./componants/Bill/OrderPage";
import CardsGoods from "./componants/Goods/CardsGoods";
import SideBar from "./componants/Sidebar/Sidebar";
import { BiHomeAlt } from "react-icons/bi";
function Home() {
  const [showModal, setShowModal] = useState(false);
  const [barcode, setBarcode] = useState("test_120");
  const [itemselect, setItemSelect] = useState("A01");
  const [orders, setOrders] = useState([]);
  const [showOrder, setShowOrder] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  

  const handleDeleteOrder = (id) => {
    setOrders(orders.filter((order) => order.id !== id));
  };
  const handleUpdateOrder = (id, qty) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, quantity: qty } : order
      )
    );
  };
  const handleUpdatediscount = (id, discount) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, discount: discount } : order
      )
    );
  };

  const onAddOrder = (Id, Name, Price) => {
    const newOrder = {
      id: Id,
      name: Name,
      price: Price,
      quantity: 1,
      discount: 0,
      size:{
        width: 0,
        height: 0,
        length: 0,
      }
    };

    const hasSameId = orders.some((order) => order.id === newOrder.id);

    if (hasSameId) {
      setOrders(
        orders.map((order) =>
          order.id === Id ? { ...order, quantity: order.quantity + 1 } : order
        )
      );
    } else {
       setOrders([...orders, newOrder]);
    }
    
   
  };

  useEffect(() => {
    console.log("item select", itemselect);
  }, [itemselect]);

  return (
    <>
   <div >
  {/* <HeaderBar className="HeaderBar" handleSetItem={setItemSelect} setSideBar={setSidebarOpen} sideBar ={sidebarOpen}/>
  <SideBar show={sidebarOpen}/> */}
  <div className="body-page"  onClick={() => setSidebarOpen(false)}>
    <div className="flex-grow-1">
      <Container fluid className="h-100">
        <Row className="h-100">
          <Col md={8} className="d-flex align-items-center ">
            <CardsGoods onAddOrder={onAddOrder} />
          </Col>
          <Col md={4} className="d-flex justify-content-center align-items-center bg-light text-dark ">
          <OrderPage
              orders={orders}
              onDelete={handleDeleteOrder}
              onUpdate={handleUpdateOrder}
              onDiscount={handleUpdatediscount}
            />
          </Col>
        </Row>
      </Container>
    </div>
  </div>
</div>
    </>
  );
}

export default Home;

