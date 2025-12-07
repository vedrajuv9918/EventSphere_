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
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [activeEventId, setActiveEventId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = useMemo(() => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("Failed to parse stored user", err);
      return null;
    }
  }, []);
  const userRole = storedUser?.role || null;
  const isHostOrAdmin = userRole === "host" || userRole === "admin";
  const activeEvent = useMemo(
    () => events.find((evt) => evt._id === activeEventId) || null,
    [events, activeEventId]
  );

  useEffect(() => {
    loadEvents();
    loadRegistrations();
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

  async function loadRegistrations() {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token || userRole !== "attendee") return;
    try {
      const registrations = await EventService.myRegistrations();
      const ids = new Set(
        (registrations || [])
          .map((reg) => reg.event?._id || reg.eventId || reg.event)
          .filter(Boolean)
      );
      setRegisteredIds(ids);
    } catch (err) {
      console.warn("Unable to load registrations for CTA state", err);
    }
  }

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((event) => {
      set.add(event.category || event.type || "General");
    });
    return ["All Categories", ...Array.from(set)];
  }, [events]);

  function getStatusMeta(event) {
    if (!event) return { code: "upcoming", label: "Upcoming" };
    const now = new Date();
    const eventDate = event.date ? new Date(event.date) : null;
    const backendStatus = (event.status || "").toLowerCase();

    if (event.adminRejected || backendStatus === "rejected") {
      return { code: "rejected", label: "Rejected" };
    }

    if (eventDate && eventDate < now) {
      return { code: "completed", label: "Completed" };
    }

    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return { code: "full", label: "Full" };
    }

    if (backendStatus === "approved") {
      return { code: "upcoming", label: "Upcoming" };
    }

    return {
      code: "upcoming-pending",
      label: "Upcoming · Awaiting Approval",
    };
  }

  function matchesQuickFilter(event, statusMeta) {
    if (activeFilter === "All Events") return true;
    if (activeFilter === "Upcoming") {
      return statusMeta.code === "upcoming" || statusMeta.code === "upcoming-pending";
    }
    if (activeFilter === "Completed") return statusMeta.code === "completed";
    const tag = event.category || event.type || "General";
    return tag === activeFilter;
  }

  const filteredEvents = events.filter((event) => {
    const statusMeta = getStatusMeta(event);
    const titleMatch = event.title?.toLowerCase().includes(search.toLowerCase());
    const cat = event.category || event.type || "General";
    const categoryMatch = category === "All Categories" || cat === category;
    return titleMatch && categoryMatch && matchesQuickFilter(event, statusMeta);
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

  function getCTA(event, statusMeta) {
    const now = new Date();
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
    const deadlinePassed = registrationDeadline && registrationDeadline < now;
    const eventPassed = event.date && new Date(event.date) < now;
    const userRegistered = registeredIds.has(event._id);

    if (statusMeta.code === "rejected") {
      return { label: "Registration Not Available", disabled: true };
    }

    if (userRegistered) {
      return { label: "Already Registered", disabled: true };
    }

    if (statusMeta.code === "upcoming-pending") {
      return { label: "Pending Approval", disabled: true };
    }

    if (deadlinePassed || eventPassed || statusMeta.code === "completed") {
      return {
        label: "Registration Not Available",
        disabled: true,
      };
    }

    if (statusMeta.code === "full") {
      return { label: "Waitlist", disabled: true };
    }

    return { label: "Register Now", disabled: false };
  }

  function handleCardSelect(event) {
    if (!event) return;
    setActiveEventId(event._id);
  }

  function closeActiveEvent() {
    setActiveEventId(null);
  }

  useEffect(() => {
    if (!activeEvent) return undefined;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        closeActiveEvent();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeEvent]);

  function renderCard(event, { variant = "grid" } = {}) {
    if (!event) return null;
    const statusMeta = getStatusMeta(event);
    const badgeTone =
      statusMeta.code === "upcoming-pending"
        ? "pending"
        : statusMeta.code.startsWith("upcoming")
        ? "success"
        : "muted";
    const categoryLabel = event.category || event.type || "General";
    const seatsLeft =
      typeof event.maxAttendees === "number"
        ? Math.max(event.maxAttendees - (event.currentAttendees || 0), 0)
        : null;
    const attendees = event.maxAttendees
      ? `${event.currentAttendees || 0} / ${event.maxAttendees} attendees`
      : `${event.currentAttendees || 0} attendees`;
    const rawPrice =
      event.ticketPrice ?? event.price ?? event.amount ?? event.cost ?? event.ticket_price ?? null;
    const formattedPrice = formatPriceValue(rawPrice);
    const price = formattedPrice || "Free";
    const cta = getCTA(event, statusMeta);
    const posterSrc =
      event.posterUrl ||
      event.imageUrl ||
      event.poster ||
      event.banner ||
      event.coverImage ||
      FALLBACK_IMAGE;
    const cardClasses = ["event-card-modern"];
    if (variant === "grid") cardClasses.push("clickable");
    if (variant === "modal") cardClasses.push("modal");

    const cardProps = {
      key: variant === "grid" ? event._id : `${event._id}-preview`,
      className: cardClasses.join(" "),
    };

    if (variant === "grid") {
      cardProps.onClick = () => handleCardSelect(event);
      cardProps.onKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardSelect(event);
        }
      };
      cardProps.role = "button";
      cardProps.tabIndex = 0;
      cardProps["aria-label"] = `Preview ${event.title || "event"}`;
    }

    return (
      <article {...cardProps}>
        <div className="card-image">
          <img src={posterSrc} alt={event.title} />
          <div className="card-badges">
            <span className="badge">{categoryLabel}</span>
            <span className={`badge ${badgeTone}`}>{statusMeta.label}</span>
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
          {isHostOrAdmin ? (
            <p
              className="cta-note"
              onClick={(e) => {
                if (variant === "grid") e.stopPropagation();
              }}
            >
              Host/Admin accounts cannot register. Please log in as an attendee.
            </p>
          ) : (
            <button
              type="button"
              className={`cta ${cta.disabled ? "secondary" : ""}`}
              onClick={(e) => {
                if (variant === "grid") {
                  e.stopPropagation();
                }
                if (!cta.disabled) {
                  window.location.href = `/register/${event._id}`;
                }
              }}
              disabled={cta.disabled}
            >
              {cta.label}
            </button>
          )}
        </div>
      </article>
    );
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

        {filteredEvents.map((event) => renderCard(event))}
      </section>

      {activeEvent && (
        <>
          <div className="event-card-overlay" onClick={closeActiveEvent} />
          <div className="event-card-modal" role="dialog" aria-modal="true" aria-label="Event preview">
            <div className="event-modal-content">
              <button
                type="button"
                className="event-modal-close"
                onClick={closeActiveEvent}
                aria-label="Close event preview"
              >
                ×
              </button>
              {renderCard(activeEvent, { variant: "modal" })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
