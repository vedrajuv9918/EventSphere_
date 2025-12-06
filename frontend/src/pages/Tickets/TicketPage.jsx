import React, { useEffect, useState, useRef } from "react";
import "./ticketPage.css";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function TicketPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    async function loadTicket() {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      setTicket(data);
    }
    loadTicket();
  }, [ticketId]);

  function downloadQR() {
    const canvas = qrRef.current.querySelector("canvas");
    const url = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${ticketId}.png`;
    link.click();
  }

  if (!ticket) return <p className="loading">Loading ticket...</p>;

  const { event, user, seats } = ticket;

  return (
    <div className="ticket-container">

      <div className="ticket-card">

        <h2 className="ticket-title">{event.title}</h2>

        <p className="ticket-date">
          {new Date(event.date).toLocaleDateString()}
        </p>

        <div className="ticket-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Seats:</strong> {seats}</p>
        </div>

        <div className="qr-box" ref={qrRef}>
          <QRCodeCanvas
            value={ticketId}
            size={180}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        </div>

        <button className="download-btn" onClick={downloadQR}>
          Download Ticket
        </button>

      </div>
    </div>
  );
}
