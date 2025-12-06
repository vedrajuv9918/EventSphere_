import React from "react";
import "./eventCardSmall.css";

export default function EventCardSmall({ reg }) {
  const event = reg.event;
  const today = new Date();
  const eventDate = new Date(event.date);
  const status = eventDate < today ? "Completed" : "Upcoming";

  return (
    <div className="event-small-card">
      <div className="left">
        <h3>{event.title}</h3>
        <p>{eventDate.toLocaleDateString()}</p>
        <span className={`status ${status.toLowerCase()}`}>{status}</span>
      </div>

      <button
        className="ticket-btn"
        onClick={() => (window.location.href = `/ticket/${reg.ticketId}`)}
      >
        View Ticket
      </button>
    </div>
  );
}
