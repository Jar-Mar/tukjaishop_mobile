
import React ,{useState}from 'react'
import AddOrderPage from './componants/Moblie/AddOrderPage';
import BottomNav from './componants/Moblie/BottomNav'
import { Routes, Route } from "react-router-dom";
function App() {
    return (
        <div style={{ paddingBottom: "70px" }}>
        <Routes>
          <Route path="/" element={<AddOrderPage />} />
        </Routes>
        <BottomNav />
      </div>
    );
  }
  
  export default App;
