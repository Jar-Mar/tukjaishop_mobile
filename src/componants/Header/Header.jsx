import React, { useState } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { AiFillAppstore } from "react-icons/ai";
import "./myStyles.css";

export default function HeaderBar(props) {
  return (
    <Navbar fixed="top" expand="lg" className="topnav">
      
        <Navbar.Brand>ถูกใจการค้า</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown
              title="สินค้า"
              id="basic-nav-dropdown"
              onSelect={(e) => props.handleSetItem(e)}
              drop={"end"}
            >
              <NavDropdown.Item eventKey={"A01"}>เก้าอี้</NavDropdown.Item>
              <NavDropdown.Item eventKey={"A02"}>ท่อ</NavDropdown.Item>
              <NavDropdown.Item eventKey={"A03"}>โต๊ะ</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item eventKey={"A04"}>อื่นๆ</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Brand>
          <AiFillAppstore  onClick={()=> {props.setSideBar(!props.sideBar)}} />
        </Navbar.Brand>
      
    </Navbar>
  );
}
