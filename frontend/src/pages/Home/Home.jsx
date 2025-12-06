import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const features = [
  {
    icon: "🌀",
    title: "Easy Registration",
    description: "Register for events in seconds",
  },
  {
    icon: "👥",
    title: "Community Driven",
    description: "Connect with like-minded people",
  },
  {
    icon: "🤖",
    title: "Smart Recommendations",
    description: "AI-powered event suggestions",
  },
];

const featuredEvents = [
  {
    id: 1,
    badge: ["Technology", "Completed"],
    title: "Tech Innovation Summit 2024",
    description:
      "Join industry leaders discussing the future of technology and innovation",
    meta: [
      "March 15, 2024",
      "9:00 AM - 5:00 PM",
      "San Francisco Convention Center",
      "450 / 500 attendees",
    ],
    price: "₹299",
    status: "Registration Not Available",
  },
  {
    id: 2,
    badge: ["Business", "Completed"],
    title: "Digital Marketing Workshop",
    description:
      "Learn the latest digital marketing strategies from experts.",
    meta: ["March 20, 2024", "2:00 PM - 6:00 PM", "Online", "234 / 300 attendees"],
    price: "Free",
    status: "Registration Not Available",
  },
  {
    id: 3,
    badge: ["Arts", "Completed"],
    title: "Art & Culture Festival",
    description: "Experience local art, music, and cultural performances.",
    meta: ["April 5, 2024", "10:00 AM - 2:00 PM", "Central Park", "1250 / 3000 attendees"],
    price: "$25",
    status: "Registration Not Available",
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
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">EventSphere</p>
          <h1>
            Discover & Host
            <br />
            Amazing Events
          </h1>
          <p className="subtitle">
            EventSphere brings together event organizers and attendees with AI-powered
            recommendations and seamless registration.
          </p>
          <div className="hero-cta">
            <button
              className="primary"
              onClick={() => handleProtectedNav("/events")}
            >
              Browse Events
            </button>
            <button
              className="secondary"
              onClick={() => handleProtectedNav("/host-dashboard")}
            >
              Create Event
            </button>
          </div>
        </div>
        <div className="hero-features">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <div>
                <p className="feature-title">{feature.title}</p>
                <p className="feature-desc">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured Events</p>
            <h2>Discover the most popular events happening now</h2>
          </div>
          <button className="text-link">View All</button>
        </div>

        <div className="featured-grid">
          {featuredEvents.map((event) => (
            <article key={event.id} className="featured-card">
              <div className="card-top">
                <div className="badge-row">
                  {event.badge.map((label) => (
                    <span key={label} className="badge">
                      {label}
                    </span>
                  ))}
                </div>
                <p className="price">{event.price}</p>
              </div>

              <h3>{event.title}</h3>
              <p className="card-desc">{event.description}</p>

              <ul>
                {event.meta.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <button className="disabled">{event.status}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <p className="eyebrow">Ready to get started?</p>
        <h2>Join thousands of event organizers and attendees on EventSphere</h2>
        <button
          className="primary"
          onClick={() => navigate("/auth?mode=signup")}
        >
          Create Your Account
        </button>
      </section>
    </div>
  );
}
