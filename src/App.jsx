import React from "react";
import { Routes, Route } from "react-router-dom";
import AddOrderPage from "./componants/Moblie/AddOrderPage";
import AddGoodsPage from "./componants/Moblie/AddGoodsPage";
import CheckStockPage from "./componants/Moblie/CheckStockPage";
import AllStockPage from "./componants/Moblie/AllStockPage";
import SalesReportPage from "./componants/Moblie/SalesReportPage";
import BottomNav from "./componants/Moblie/BottomNav";

function App() {
  return (
    <div style={{ paddingBottom: "70px" }}>
      <Routes>
        <Route path="/" element={<AddOrderPage />} />
        <Route path="/AddGoods" element={<AddGoodsPage />} />
        <Route path="/CheckGoods" element={<CheckStockPage />} />
        <Route path="/CheckStock" element={<AllStockPage />} />
        <Route path="/Home" element={<SalesReportPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;