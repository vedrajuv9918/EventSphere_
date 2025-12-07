import React, { useEffect, useMemo, useState } from "react";
import { EventService } from "../../services/eventService";
import "./eventList.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80";

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

function formatPriceValue(value) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return INR_FORMATTER.format(numeric);
}

const quickFilters = ["All Events", "Upcoming", "Completed", "Technology", "Business", "Arts"];

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      const data = await EventService.list();
      const normalized = Array.isArray(data) ? data : [];
      setEvents(normalized);
    } catch (err) {
      console.error("Error loading events", err);
      setError("Unable to load events right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((event) => {
      set.add(event.category || event.type || "General");
    });
    return ["All Categories", ...Array.from(set)];
  }, [events]);

  function getStatus(event) {
    if (!event) return "Upcoming";
    const backendStatus = event.status
      ? event.status.charAt(0).toUpperCase() + event.status.slice(1)
      : null;
    if (backendStatus === "Rejected") return "Rejected";
    if (backendStatus === "Completed") return "Completed";

    const today = new Date();
    const eventDate = event.date ? new Date(event.date) : null;
    if (eventDate && eventDate < today) return "Completed";
    if (event.currentAttendees >= event.maxAttendees) return "Full";
    return backendStatus || "Upcoming";
  }

  function matchesQuickFilter(event) {
    if (activeFilter === "All Events") return true;
    const status = getStatus(event);
    if (activeFilter === "Upcoming") return status === "Upcoming";
    if (activeFilter === "Completed") return status === "Completed";
    const tag = event.category || event.type || "General";
    return tag === activeFilter;
  }

  const filteredEvents = events.filter((event) => {
    const titleMatch = event.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const cat = event.category || event.type || "General";
    const categoryMatch =
      category === "All Categories" || cat === category;
    return titleMatch && categoryMatch && matchesQuickFilter(event);
  });

  function formatDate(dateString) {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(dateString) {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getCTA(status) {
    if (status === "Completed") return { label: "Already Registered", disabled: true };
    if (status === "Full") return { label: "Waitlist", disabled: true };
    return { label: "Register Now", disabled: false };
  }

  return (
    <div className="event-list-page">
      <section className="events-hero">
        <div className="hero-copy">
          <p className="eyebrow-label">Discover</p>
          <h1>Discover Events</h1>
          <p>Find and register for amazing events happening near you</p>
        </div>
        <div className="search-controls" role="group" aria-label="Search and filter events">
          <div className="control-group" aria-label="Search events">
            <span className="control-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path
                  d="M11 3a8 8 0 0 1 6.32 12.9l3.4 3.4a1 1 0 0 1-1.42 1.4l-3.38-3.38A8 8 0 1 1 11 3zm0 2a6 6 0 1 0 3.78 10.66l.34-.3.32-.37A6 6 0 0 0 11 5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="control-input"
            />
          </div>

          <div className="control-group select-control" aria-label="Filter by category">
            <span className="control-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path
                  d="M4 5h16a1 1 0 0 1 .8 1.6L15 14v4a1 1 0 0 1-.55.9l-4 2A1 1 0 0 1 9 20v-6L3.2 6.6A1 1 0 0 1 4 5zm2.3 2 4.5 6.2a1 1 0 0 1 .2.6v4l2-1v-3a1 1 0 0 1 .2-.6L17.7 7H6.3z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="control-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="select-caret" aria-hidden="true">
              ▾
            </span>
          </div>
        </div>
        <div className="filter-chips">
          {quickFilters.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`chip ${activeFilter === chip ? "selected" : ""}`}
              onClick={() => setActiveFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      <section className="event-grid">
        {loading && <p className="empty-state">Loading events...</p>}
        {!loading && error && <p className="empty-state error">{error}</p>}
        {!loading && !error && filteredEvents.length === 0 && (
          <p className="empty-state">
            No events match your search. Try a different keyword or category.
          </p>
        )}

        {filteredEvents.map((event) => {
          const status = getStatus(event);
          const categoryLabel = event.category || event.type || "General";
          const seatsLeft =
            typeof event.maxAttendees === "number"
              ? Math.max(event.maxAttendees - (event.currentAttendees || 0), 0)
              : null;
          const attendees = event.maxAttendees
            ? `${event.currentAttendees || 0} / ${event.maxAttendees} attendees`
            : `${event.currentAttendees || 0} attendees`;
          const rawPrice =
            event.ticketPrice ??
            event.price ??
            event.amount ??
            event.cost ??
            event.ticket_price ??
            null;
          const formattedPrice = formatPriceValue(rawPrice);
          const price = formattedPrice || "Free";
          const cta = getCTA(status);
          const posterSrc =
            event.posterUrl ||
            event.imageUrl ||
            event.poster ||
            event.banner ||
            event.coverImage ||
            FALLBACK_IMAGE;

          return (
            <article key={event._id} className="event-card-modern">
              <div className="card-image">
                <img
                  src={posterSrc}
                  alt={event.title}
                />
                <div className="card-badges">
                  <span className="badge">{categoryLabel}</span>
                  <span className={`badge ${status !== "Upcoming" ? "muted" : "success"}`}>
                    {status}
                  </span>
                </div>
                <span className="price-tag">{price}</span>
              </div>

              <div className="card-body">
                <h3>{event.title}</h3>
                <p className="card-description">{event.description}</p>

                <ul className="card-meta">
                  <li>
                    <span className="meta-icon">📅</span>
                    {formatDate(event.date)}
                  </li>
                  <li>
                    <span className="meta-icon">⏰</span>
                    {formatTime(event.date)}
                  </li>
                  <li>
                    <span className="meta-icon">📍</span>
                    {event.venue || "Venue TBA"}
                  </li>
                  <li>
                    <span className="meta-icon">👥</span>
                    {attendees}
                  </li>
                  {typeof seatsLeft === "number" && (
                    <li>
                      <span className="meta-icon">🎟</span>
                      Seats left: {seatsLeft}
                    </li>
                  )}
                </ul>
              </div>

              <div className="card-footer">
                <button
                  type="button"
                  className={`cta ${cta.disabled ? "secondary" : ""}`}
                  onClick={() => (window.location.href = `/event/${event._id}`)}
                  disabled={cta.disabled}
                >
                  {cta.label}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
