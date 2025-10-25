import React from "react";
import { goods } from "./data.jsx";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import "./Good.css";
export default function CardsGoods({ onAddOrder }) {
  return (
    <div>
      <CardGroup>
        {goods.A02.data.map((data) => (
          <div className="me-3" key={data.id}>
            <Card style={{ width: "16rem" }} onClick={() => onAddOrder(data.id, data.name, data.price)}>
              <Card.Img
                className="custom-img"
                variant="top"
                src={data.img}
                alt="Card image"
              />
              <Card.Body>
                <Card.Title>{data.name}</Card.Title>
                <Card.Text> Stock {data.stock} || {data.price}฿ </Card.Text>         
              </Card.Body>
            </Card>
          </div>
        ))}
      </CardGroup>
    </div>
  );
}
