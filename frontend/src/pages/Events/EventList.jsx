import React, { useEffect, useMemo, useState } from "react";
import { EventService } from "../../services/eventService";
import "./eventList.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80";

const DUMMY_EVENTS = [
  {
    _id: "demo-aurora-summit",
    title: "Aurora Tech Summit 2025",
    description:
      "A full-day deep dive into AI, cloud-native tooling, and developer productivity with hands-on labs.",
    posterUrl:
      "https://images.unsplash.com/photo-1503424886306-717c0d1d02d4?auto=format&fit=crop&w=1000&q=80",
    date: "2025-02-15T09:00:00Z",
    venue: "Skyline Convention Center, Bengaluru",
    category: "Technology",
    ticketPrice: 1499,
    currentAttendees: 120,
    maxAttendees: 200,
    status: "approved",
  },
  {
    _id: "demo-design-weekend",
    title: "Design Weekend: Storytelling in Spaces",
    description:
      "Immersive design showcase featuring interactive installations, panels, and networking lounges.",
    posterUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80",
    date: "2025-03-02T15:30:00Z",
    venue: "The Grid Art District, Mumbai",
    category: "Arts",
    ticketPrice: 999,
    currentAttendees: 85,
    maxAttendees: 150,
    status: "approved",
  },
  {
    _id: "demo-founder-forum",
    title: "Founders' Forum: Scaling Sustainably",
    description:
      "Roundtables with climate-tech leaders, pitch lounge, and curated investor speed meets.",
    posterUrl:
      "https://images.unsplash.com/photo-1522199873710-1e2f9a1232f2?auto=format&fit=crop&w=1000&q=80",
    date: "2025-01-28T11:00:00Z",
    venue: "Seaport Hub, Chennai",
    category: "Business",
    ticketPrice: 0,
    currentAttendees: 60,
    maxAttendees: 120,
    status: "approved",
  },
];

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
      setEvents(normalized.length ? normalized : DUMMY_EVENTS);
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
        <div className="hero-search-row">
          <label className="search-field" aria-label="Search events">
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="select-field" aria-label="Filter by category">
            <span className="filter-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" role="presentation">
                <path
                  d="M3 5h14l-5 6v4l-4 2v-6L3 5z"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="select-icon" aria-hidden="true">
              ▾
            </span>
          </label>
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
          const price =
            event.price || event.ticketPrice
              ? `₹${event.price || event.ticketPrice}`
              : "Free";
          const cta = getCTA(status);

          return (
            <article key={event._id} className="event-card-modern">
              <div className="card-image">
                <img
                  src={event.posterUrl || event.imageUrl || FALLBACK_IMAGE}
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
