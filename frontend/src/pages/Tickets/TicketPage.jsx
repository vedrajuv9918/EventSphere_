import React, { useEffect, useState, useRef } from "react";
import "./ticketPage.css";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { TicketService } from "../../services/ticketService";

export default function TicketPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        setError("");
        const data = await TicketService.byId(ticketId);
        setTicket(data);
      } catch (err) {
        console.error("Failed to load ticket", err);
        setError(err.message || "Unable to load ticket details.");
      }
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

  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!ticket) return <p className="loading">Loading ticket...</p>;

  const { event = {}, user = {}, seats = 1 } = ticket;

  return (
    <div className="ticket-container">

      <div className="ticket-card">

        <h2 className="ticket-title">{event.title || "Event ticket"}</h2>

        <p className="ticket-date">
          {event.date ? new Date(event.date).toLocaleDateString() : "Date TBA"}
        </p>

        <div className="ticket-info">
          <p><strong>Name:</strong> {user.name || "Attendee"}</p>
          <p><strong>Email:</strong> {user.email || "—"}</p>
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
