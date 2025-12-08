import React, { useEffect, useState } from "react";
import "./hostEventSettings.css";
import { useNavigate, useParams } from "react-router-dom";
import { HostService } from "../../services/hostService";

export default function HostEventSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  const [settings, setSettings] = useState({
    isActive: true,
    registrationDeadline: "",
    oneSeatPerUser: false,
    allowCancellation: true,
    enableReminders: true,
    maxTicketsPerUser: 1,
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await HostService.eventSettings(id);
        setEvent(data.event);
        setSettings(data.settings);
      } catch (err) {
        console.log("Error loading settings:", err);
        alert(err.message || "Unable to load settings");
      }
    }
    load();
  }, [id]);

  function changeSetting(e) {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveSettings() {
    try {
      const data = await HostService.updateEventSettings(id, settings);
      alert(data.message || "Settings updated");
      navigate("/host-dashboard");
    } catch (err) {
      alert(err.message || "Unable to update settings");
    }
  }

  if (!event) return <p className="loading">Loading settings...</p>;

  return (
    <div className="host-settings-page">
      <div className="settings-card">
        <header className="settings-header">
          <div>
            <p className="eyebrow">Event Settings</p>
            <h2>{event.title}</h2>
            <p className="muted">Control registration rules for this event.</p>
          </div>
          <button className="icon-btn" type="button" aria-label="Close" onClick={() => window.history.back()}>
            ×
          </button>
        </header>

        <section className="toggle-row modern">
          <div>
            <p className="toggle-title">Enable Event</p>
            <span className="toggle-sub">Allow new registrations</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              name="isActive"
              checked={settings.isActive}
              onChange={changeSetting}
            />
            <span className="slider" />
          </label>
        </section>

        <div className="field-group">
          <label>
            <span>Registration Deadline</span>
            <input
              type="datetime-local"
              name="registrationDeadline"
              value={settings.registrationDeadline}
              onChange={changeSetting}
            />
          </label>

          <label>
            <span>Max Tickets Per User</span>
            <input
              type="number"
              min="1"
              name="maxTicketsPerUser"
              value={settings.maxTicketsPerUser}
              onChange={changeSetting}
            />
          </label>
        </div>

        <section className="toggle-row modern">
          <div>
            <p className="toggle-title">Allow registration cancellation</p>
            <span className="toggle-sub">Attendees can cancel their tickets</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              name="allowCancellation"
              checked={settings.allowCancellation}
              onChange={changeSetting}
            />
            <span className="slider" />
          </label>
        </section>

        <button className="save-settings" type="button" onClick={saveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
