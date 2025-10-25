// src/Order.js
import React from "react";
import "./Order.css";
import Stack from "react-bootstrap/Stack";
import { MdDeleteForever } from "react-icons/md";
const Order = ({ order, onDelete, onUpdate ,onDiscount}) => {
  return (
    <div className="order-txt order-postion">
    
      <Stack direction="horizontal" gap={3}>
      <div className="p-2">
     <span>
     <input
            className="set-width"
            type="number"
            placeholder="จำนวน"
            value={order.quantity}
            min="1"
            onChange={(e) => onUpdate(order.id, e.target.value)}
          />
     </span>
          
          <span>
          
          {order.name}  ฿ {order.price}  
          </span></div>
      <div className="p-2 ms-auto">ลดราคา​ :  
        <input
            className="set-width"
            type="number"
            placeholder="จำนวน"
            value={order.discount}
            min="0"
            step={10}
            onChange={(e) => onDiscount(order.id, e.target.value)}
          />
            </div>
      <div className="vr" />
      <div className="p-2">
      ฿ {order.quantity*order.price - order.discount}  
        <button className="icon" onClick={() => onDelete(order.id)}>
        <MdDeleteForever  size={36} color="red"/>
        </button>
     </div>
    </Stack>

     
    </div>
  );
};

export default Order;
