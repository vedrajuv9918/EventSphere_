import React, { useEffect, useState } from "react";
import "./hostEventSettings.css";
import { useParams } from "react-router-dom";
import { HostService } from "../../services/hostService";

export default function HostEventSettings() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  const [settings, setSettings] = useState({
    isActive: true,
    registrationDeadline: "",
    oneSeatPerUser: false,
    allowCancellation: true,
    enableReminders: true,
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
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function saveSettings() {
    try {
      const data = await HostService.updateEventSettings(id, settings);
      alert(data.message || "Settings updated");
    } catch (err) {
      alert(err.message || "Unable to update settings");
    }
  }

  if (!event) return <p className="loading">Loading settings...</p>;

  const today = new Date();
  const eventDate = new Date(event.date);
  const status =
    event.adminRejected
      ? "Rejected"
      : event.approved
      ? "Approved"
      : "Pending Approval";

  return (
    <div className="settings-container">

      {/* Event Summary */}
      <div className="event-settings-card">
        <h2>{event.title}</h2>

        <p><strong>Date:</strong> {eventDate.toLocaleDateString()}</p>
        <p><strong>Status:</strong> {status}</p>

        {status === "Rejected" && (
          <p className="reject-reason">
            <strong>Reason:</strong> {event.rejectReason || "Not provided"}
          </p>
        )}
      </div>

      {/* Settings Box */}
      <div className="settings-box">

        <h3>Event Settings</h3>

        {/* Enable/Disable */}
        <label className="setting-row">
          <span>Event Active</span>
          <input
            type="checkbox"
            name="isActive"
            checked={settings.isActive}
            onChange={changeSetting}
          />
        </label>

        {/* Deadline */}
        <label className="setting-row">
          <span>Registration Deadline</span>
          <input
            type="date"
            name="registrationDeadline"
            value={settings.registrationDeadline}
            onChange={changeSetting}
          />
        </label>

        {/* 1 seat rule */}
        <label className="setting-row">
          <span>Only 1 Seat Per User</span>
          <input
            type="checkbox"
            name="oneSeatPerUser"
            checked={settings.oneSeatPerUser}
            onChange={changeSetting}
          />
        </label>

        {/* Cancellation */}
        <label className="setting-row">
          <span>Allow Attendee Cancellation</span>
          <input
            type="checkbox"
            name="allowCancellation"
            checked={settings.allowCancellation}
            onChange={changeSetting}
          />
        </label>

        {/* Reminders */}
        <label className="setting-row">
          <span>Enable Reminder Notifications</span>
          <input
            type="checkbox"
            name="enableReminders"
            checked={settings.enableReminders}
            onChange={changeSetting}
          />
        </label>

        {/* Save Button */}
        <button className="save-btn" onClick={saveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
