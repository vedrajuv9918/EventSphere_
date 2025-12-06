import React, { useEffect, useState } from "react";
import "./registeredEvents.css";

export default function RegisteredEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/events/my-registrations", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    const data = await res.json();
    setEvents(data);
  }

  return (
    <div className="registered-container">
      <h2>My Registered Events</h2>

      {events.map((e) => (
        <div className="registered-card" key={e._id}>
          <h3>{e.event.title}</h3>
          <p>{new Date(e.event.date).toLocaleDateString()}</p>
          <p>Seats: {e.seats}</p>
          <a href={`/ticket/${e.ticketId}`} className="ticket-btn">View Ticket</a>
        </div>
      ))}
    </div>
  );
}
