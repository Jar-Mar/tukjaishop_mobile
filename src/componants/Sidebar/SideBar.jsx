import React, { useState ,useEffect} from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './Sidebar.css';

export default function SideBar({show}) {
  const [expanded, setExpanded] = useState(false);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

useEffect(() => {setExpanded(show);}, [show]);
  return (
    <>
     

      {/* Sidebar */}
      <div className={`sidebar ${expanded ? '' : 'collapsed'}`}>
        <Nav className="flex-column text-white">
          <Nav.Link href="/addproduct" className="text-white mb-2">
            เพิ่มสินค้า
          </Nav.Link>
          <Nav.Link href="/createvendors" className="text-white mb-2">
            เพิ่มคู่ค้า
          </Nav.Link>
          <Nav.Link href="/totalsale" className="text-white mb-2">
            ยอดขาย
          </Nav.Link>
          <Nav.Link href="/setting" className="text-white mb-2">
            Settings
          </Nav.Link>
        </Nav>
      </div>
    </>
  );
}
