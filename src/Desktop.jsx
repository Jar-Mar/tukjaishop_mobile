import React ,{useState}from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./Home";
import BillPage from "./componants/Bill/BillPage";
import CreateVendors from './componants/Venders/CreateVendors';
import SideBar from "./componants/Sidebar/Sidebar";
import HeaderBar from "./componants/Header/Header";
export default function App() {
    const [itemselect, setItemSelect] = useState("A01");
    const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div>
    <HeaderBar className="HeaderBar" handleSetItem={setItemSelect} setSideBar={setSidebarOpen} sideBar ={sidebarOpen}/>
    <SideBar show={sidebarOpen}/>
    <div className="body-page"  onClick={() => setSidebarOpen(false)}>
  <Routes>
  <Route index element={<Home />} />
  <Route path="/billPage" element={<BillPage />} />
  <Route path="/createvendors" element={<CreateVendors/>} />
  <Route path="*" element={<div>404 Not Found</div>} />
</Routes>
    </div>
    </div>
  )
}
