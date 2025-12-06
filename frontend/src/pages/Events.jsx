import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import "./events.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.log("Error fetching events:", err);
      }
    }
    fetchEvents();
  }, []);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="events-container">
      <h1 className="events-title">Explore Events</h1>

      {/* Search Bar */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Events List */}
      <div className="events-grid">
        {filtered.length > 0 ? (
          filtered.map((event) => <EventCard key={event._id} event={event} />)
        ) : (
          <p className="no-events">No events found.</p>
        )}
      </div>
    </div>
  );
}
