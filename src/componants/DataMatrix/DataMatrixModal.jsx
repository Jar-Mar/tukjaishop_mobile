// DataMatrixModal.js
import React, { useEffect, useRef ,useState} from 'react';
import bwipjs from 'bwip-js';
import './modal.css'; // Optional CSS file for styling

const DataMatrixModal = ({ text, onClose }) => {
  const canvasRef = useRef(null);
  const printRef = useRef(null);
  const [price, setPrice] = useState(0);
  useEffect(() => {
    try {
      let cost = text.split("_");
      setPrice(cost[cost.length-1]);
    
      bwipjs.toCanvas(canvasRef.current, {
        bcid: 'datamatrix',
        text: text,
        scale: 8,
        includetext: false,
      });
    } catch (e) {
      console.error('Error generating barcode:', e);
    }
  }, [text]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=400');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
        </head>
        <body>
          <div style="text-align:center;">
            <p>ถูกใจการค้า</p>
            <img src="${canvasRef.current.toDataURL()}" />
             <p>${text}</p>
             <h1>ราคา : ${price} บาท </h1>
             <h5>${Date.now()}</h5>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>Data Matrix Code</h3>
        <canvas ref={canvasRef}></canvas>
        <div style={{ marginTop: '10px' }}>
          <button onClick={handlePrint}>🖨️ Print</button>
          <button onClick={onClose} style={{ marginLeft: '10px' }}>❌ Close</button>
        </div>
      </div>
    </div>
  );
};

export default DataMatrixModal;