import React from "react";
import Order from "./Order";
import "./Order.css";

export default function OrderPage({ orders, onDelete, onUpdate, onDiscount }) {
  const totalAmount = orders.reduce(
    (sum, order) => sum + order.price * order.quantity - order.discount,
    0
  );

  return (
    <div className="order-page-container">
      <div className="order-list">
        {orders.map((order) => (
          <Order
            key={order.id}
            order={order}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onDiscount={onDiscount}
          />
        ))}
      </div>
      <div className="order-total">
        <h2>Total Amount: ฿{totalAmount.toFixed(2)}</h2>
      </div>
    </div>
  );
}
