import React, { useState } from "react";
import { motion } from "framer-motion";
import { House, Basket, Gear, BagPlusFill,BoxSeam,Database} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const [active, setActive] = useState("Add");
  const navigate = useNavigate();

  const tabs = [
    { name: "Home", icon: <House size={22} />, path: "/Home" },
    { name: "ตะกร้าสินค้า", icon: <Basket size={22} />, path: "/" },
    { name: "เพิ่มสินค้า", icon: <BagPlusFill size={22} />, path: "/AddGoods" },
    { name: "เช็คสินค้า", icon: <BoxSeam size={22} />, path: "/CheckGoods" },
    { name: "Stock", icon: <Database size={22} />, path: "/CheckStock" },
  ];

  return (
    <nav
      className="bg-white shadow-sm fixed-bottom d-flex justify-content-around align-items-center"
      style={{
        height: "70px",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {tabs.map((tab) => (
        <motion.div
          key={tab.name}
          className="d-flex flex-column align-items-center"
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            setActive(tab.name);
            navigate(tab.path);
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            animate={{
              scale: active === tab.name ? 1.2 : 1,
              color: active === tab.name ? "#007bff" : "#6c757d",
            }}
            transition={{ duration: 0.2 }}
            style={{ color: active === tab.name ? "#007bff" : "#6c757d" }}
          >
            {tab.icon}
          </motion.div>
          <small
            className="mt-1"
            style={{
              color: active === tab.name ? "#007bff" : "#6c757d",
              fontWeight: active === tab.name ? "600" : "400",
            }}
          >
            {tab.name}
          </small>
        </motion.div>
      ))}
    </nav>
  );
};

export default BottomNav;