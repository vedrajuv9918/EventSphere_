import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const heroStats = [
  { label: "Easy Registration", description: "Register for events in seconds" },
  { label: "Community Driven", description: "Connect with like-minded people" },
  { label: "Personalized Discovery", description: "Get event suggestions tailored to you" },
  { label: "Smart Recommendations", description: "AI-powered event suggestions" },
];

const featuredEvents = [
  {
    title: "Tech Innovation Summit 2024",
    description: "Industry leaders discussing the future of technology and innovation.",
    date: "March 15, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "San Francisco Convention Center",
    category: "Technology",
    attendees: "487 / 500",
    price: "₹299",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Digital Marketing Workshop",
    description: "Learn the latest digital marketing strategies from experts.",
    date: "March 20, 2024",
    time: "2:00 PM - 6:00 PM",
    location: "Online",
    category: "Business",
    attendees: "234 / 300",
    price: "Free",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Art & Culture Festival",
    description: "Experience local art, music, and cultural performances.",
    date: "April 5, 2024",
    time: "10:00 AM - 8:00 PM",
    location: "Central Park",
    category: "Arts",
    attendees: "1,250 / 2,000",
    price: "₹25",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function Home() {
  const navigate = useNavigate();

  function handleProtectedNav(path) {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    navigate(path);
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-inner">
          <p className="hero-eyebrow">EventSphere</p>
          <h1>
            Discover &amp; Host
            <span> Amazing Events</span>
          </h1>
          <p className="hero-subtitle">
            EventSphere brings together event organizers and attendees with AI-powered recommendations
            and seamless registration.
          </p>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => handleProtectedNav("/events")}>
              Browse Events
            </button>
            <button className="btn outline" onClick={() => handleProtectedNav("/host-dashboard")}>
              Create Event
            </button>
          </div>

          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat-card">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-description">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-featured">
        <div className="section-header">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Featured Events</h2>
            <p className="section-description">
              Discover the most popular events happening now across technology, business, arts, and more.
            </p>
          </div>
          <button className="btn ghost" onClick={() => navigate("/events")}>
            View All
          </button>
        </div>

        <div className="featured-grid">
          {featuredEvents.map((event) => (
            <article key={event.title} className="featured-card">
              <div className="card-image">
                <img src={event.image} alt={event.title} loading="lazy" />
              </div>
              <div className="card-body">
                <div className="card-badges">
                  <span className="badge">{event.category}</span>
                  <span className="badge secondary">Upcoming</span>
                </div>
                <h3>{event.title}</h3>
                <p className="card-description">{event.description}</p>
                <ul className="card-meta">
                  <li>{event.date}</li>
                  <li>{event.time}</li>
                  <li>{event.location}</li>
                  <li>{event.attendees}</li>
                </ul>
              </div>
              <div className="card-footer">
                <span className="price">{event.price}</span>
                <button className="btn primary" onClick={() => handleProtectedNav("/events")}>
                  Register Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <h2>Ready to get started?</h2>
        <p>Join thousands of event organizers and attendees on EventSphere.</p>
        <button className="btn primary" onClick={() => navigate("/auth?mode=signup")}>
          Create Your Account
        </button>
      </section>
    </div>
  );
}
