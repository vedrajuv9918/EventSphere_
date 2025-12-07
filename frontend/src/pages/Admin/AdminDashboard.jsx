import React, { useEffect, useMemo, useState } from "react";
import "./adminDashboard.css";
import AdminEventCard from "../../components/AdminEventCard";
import { AdminService } from "../../services/adminService";

const formatNumber = (value = 0) => value.toLocaleString();

export default function AdminDashboard() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminName = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      return stored?.name || "Admin";
    } catch (err) {
      return "Admin";
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    await Promise.all([loadEvents(), loadStats()]);
  }

  async function loadEvents() {
    try {
      setError("");
      const data = await AdminService.events();
      setPendingEvents(data.filter((event) => event.status === "pending"));
      setApprovedEvents(data.filter((event) => event.status === "approved"));
      setRejectedEvents(data.filter((event) => event.status === "rejected"));
    } catch (err) {
      console.log("Error loading events:", err);
      setError("Unable to load events");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await AdminService.stats();
      setStats(data);
    } catch (err) {
      console.log("Error loading stats:", err);
    }
  }

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="loading">Loading stats...</p>;

  const totals = stats.totals || {};
  const eventsByStatus = stats.eventsByStatus || {};
  const registrationTrend = stats.registrationTrend || [];

  const statusBreakdown = {
    approved: eventsByStatus.approved ?? approvedEvents.length,
    pending: eventsByStatus.pending ?? pendingEvents.length,
    rejected: eventsByStatus.rejected ?? rejectedEvents.length,
  };

  const totalStatusCount =
    statusBreakdown.approved + statusBreakdown.pending + statusBreakdown.rejected || 1;

  const statusAngles = {
    approved: (statusBreakdown.approved / totalStatusCount) * 360,
    pending: (statusBreakdown.pending / totalStatusCount) * 360,
    rejected: (statusBreakdown.rejected / totalStatusCount) * 360,
  };

  const totalRegistrations = totals.registrations || 0;
  const activeAttendees = Math.max(totalRegistrations - statusBreakdown.rejected * 5, 0);

  const trendDelta =
    registrationTrend.length > 1
      ? registrationTrend[registrationTrend.length - 1].count -
        registrationTrend[registrationTrend.length - 2].count
      : 0;

  const metricCards = [
    {
      label: "Total Users",
      value: formatNumber(totals.users || 0),
      icon: "users",
      change: "+12.5% from last month",
    },
    {
      label: "Approved Events",
      value: formatNumber(statusBreakdown.approved),
      icon: "calendar",
      change: "+8.2% from last month",
    },
    {
      label: "Total Revenues",
      value: `₹${formatNumber(totals.revenue || 0)}`,
      icon: "revenue",
      change: "+23.1% from last month",
    },
    {
      label: "Active Attendees",
      value: formatNumber(activeAttendees),
      icon: "trend",
      change: "+4.3% from last month",
    },
  ];

  const chartBackground = {
    background: `conic-gradient(#22c55e 0deg ${statusAngles.approved}deg,
      #facc15 ${statusAngles.approved}deg ${statusAngles.approved + statusAngles.pending}deg,
      #f87171 ${statusAngles.approved + statusAngles.pending}deg 360deg)`,
  };

  const engagementBars = [
    { label: "Total Registrations", value: totalRegistrations },
    { label: "Active Attendees", value: activeAttendees },
  ];

  const maxEngagementValue =
    Math.max(...engagementBars.map((item) => item.value || 0), 1) || 1;

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__shell">
        <header className="admin-dashboard__hero">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">System overview and management, {adminName}!</p>
          </div>
        </header>

        <section className="admin-dashboard__metrics">
          {metricCards.map((metric) => (
            <article className="admin-metric-card" key={metric.label}>
              <div className="metric-header">
                <p>{metric.label}</p>
                <span className={`metric-icon ${metric.icon}`} aria-hidden="true" />
              </div>
              <h3>{metric.value}</h3>
              <p className="metric-change">{metric.change}</p>
            </article>
          ))}
        </section>

        <section className="admin-insights-grid">
          <article className="admin-panel">
            <header className="panel-heading">
              <div>
                <h2>Event Status Distribution</h2>
                <p>Overview of event approval status</p>
              </div>
            </header>
            <div className="status-split">
              <div className="status-chart" style={chartBackground} />
              <div className="status-legend">
                <p>Approved: {statusBreakdown.approved}</p>
                <p>Pending: {statusBreakdown.pending}</p>
                <p>Rejected: {statusBreakdown.rejected}</p>
              </div>
            </div>
          </article>

          <article className="admin-panel">
            <header className="panel-heading">
              <div>
                <h2>User Engagement</h2>
                <p>Registration and attendance metrics</p>
              </div>
            </header>
            <div className="engagement-bars">
              {engagementBars.map((item) => (
                <div className="bar" key={item.label}>
                  <div
                    className="bar-value"
                    style={{ height: `${(item.value / maxEngagementValue) * 100 || 0}%` }}
                  />
                  <p>{item.label}</p>
                  <span>{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="admin-panel">
          <header className="panel-heading">
            <div>
              <h2>Pending Event Approvals</h2>
              <p>Events awaiting your review</p>
            </div>
          </header>
          <div className="pending-list">
            {pendingEvents.length === 0 ? (
              <p className="empty-message">No pending events for approval</p>
            ) : (
              pendingEvents.map((event) => (
                <AdminEventCard key={event._id} event={event} refresh={refreshAll} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
