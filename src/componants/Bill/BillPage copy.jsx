// src/BillPage.js
import React, { useState } from "react";
import Order from "./Order";
import logo from'./image.svg';
const BillPage = () => {
  const [orders, setOrders] = useState([]);
  const [orderName, setOrderName] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDiscount, setOrderDiscount] = useState(0);

  const handleAddOrder = () => {
    const newOrder = {
      id: Date.now(),
      name: orderName,
      price: parseFloat(orderPrice),
      quantity: parseInt(orderQuantity, 10),
      discount: orderDiscount,
    };

    setOrders([...orders, newOrder]);
    setOrderName("");
    setOrderPrice("");
    setOrderQuantity(1); // Reset quantity
  };

  const handleDeleteOrder = (id) => {
    setOrders(orders.filter((order) => order.id !== id));
  };
  const handleUpdateOrder = (id, qty) => {
    
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, quantity: qty } : order
      )
    );
  }

  const totalAmount = orders.reduce(
    (sum, order) => sum + order.price * order.quantity - order.discount,
    0
  );
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=20,height=100%");
    printWindow.document.write(`
      <html>
        <head>
          <title>ใบเสร็จ</title>
        </head>
        <body>
          <div style="text-align:center;">
             <img src="${logo}"  width="256" hight="256"/>
            <h5>${new Date().toLocaleDateString()}</h5> 
            <h5>${new Date().toLocaleTimeString()}</h5> 
              <h2>Orders</h2>
      ${orders.map((order) => (
              `<div>${order.name} - $${order.price} x ${order.quantity} ${order.discount!= 0?'-':''} ${order.discount!= 0?order.discount:''} = ${order.price *  order.quantity - order.discount}</div>`
      ))}
              <h2>Total Amount: ${totalAmount.toFixed(2)}</h2>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function() {
      printWindow.print();
      printWindow.close();
      }, 250);
   
  };

  return (
    <div>
      <h1>Bill Page</h1>
      <input
        type="text"
        placeholder="ชื่อสินค้า"
        value={orderName}
        onChange={(e) => setOrderName(e.target.value)}
      />
      <input
        type="number"
        placeholder="จำนวน"
        value={orderQuantity}
        min="1"
        onChange={(e) => setOrderQuantity(e.target.value)}
      />
      <input
        type="number"
        placeholder="ราคาขาย"
        value={orderPrice}
        onChange={(e) => setOrderPrice(e.target.value)}
      />
       <input
        type="number"
        placeholder="ส่วนลด"
        value={orderDiscount}
        onChange={(e) => setOrderDiscount(e.target.value)}
      />

      <button onClick={handleAddOrder}>Add Order</button>
      <div>
      <button onClick={handlePrint}>Print</button>
      <button onClick={handleAddOrder}>Record</button>
      </div>

      <h2>Orders</h2>
      {orders.map((order) => (
        <Order key={order.id} order={order} onDelete={handleDeleteOrder} onUpdate= {handleUpdateOrder}/>
      ))}

      <h2>Total Amount: ${totalAmount.toFixed(2)}</h2>
    </div>
  );
};

export default BillPage;
