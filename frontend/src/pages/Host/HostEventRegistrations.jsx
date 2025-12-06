import React, { useEffect, useState } from "react";
import "./hostEventRegistrations.css";
import { useParams } from "react-router-dom";

export default function HostEventRegistrations() {
  const { id } = useParams(); // event ID
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.log("Error loading event:", err);
      }
    }

    async function loadRegistrations() {
      try {
        const res = await fetch(`/api/host/event/${id}/registrations`);
        const data = await res.json();
        setRegistrations(data);
      } catch (err) {
        console.log("Error loading registrations:", err);
      }
    }

    loadEvent();
    loadRegistrations();
  }, [id]);

  function exportCSV() {
    let csv = "Name,Email,Seats,Payment Status\n";
    registrations.forEach((r) => {
      csv += `${r.user.name},${r.user.email},${r.seats},${r.paymentStatus}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${event.title}_registrations.csv`;
    a.click();
  }

  if (!event) return <p className="loading">Loading event data...</p>;

  return (
    <div className="registrations-container">
      {/* Event Summary */}
      <div className="event-summary-box">
        <h2>{event.title}</h2>

        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Total Registered:</strong> {registrations.length}</p>
        <p><strong>Seats Left:</strong> {event.maxAttendees - event.currentAttendees}</p>

        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {/* Registrations List */}
      <h3 className="section-title">Attendees Registered</h3>

      <div className="registrations-list">
        {registrations.length > 0 ? (
          registrations.map((reg) => (
            <div key={reg._id} className="registration-card">
              <div>
                <h4>{reg.user.name}</h4>
                <p>{reg.user.email}</p>
                <p><strong>Seats:</strong> {reg.seats}</p>
                <p>
                  <strong>Payment:</strong>{" "}
                  <span className={`pay-status ${reg.paymentStatus}`}>
                    {reg.paymentStatus}
                  </span>
                </p>
              </div>

              <button
                className="ticket-btn"
                onClick={() => (window.location.href = `/ticket/${reg.ticketId}`)}
              >
                View Ticket
              </button>
            </div>
          ))
        ) : (
          <p className="no-reg">No registrations yet.</p>
        )}
      </div>
    </div>
  );
}
