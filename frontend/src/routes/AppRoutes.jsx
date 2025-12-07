import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Auth from "../pages/Auth/Auth";
import EventList from "../pages/Events/EventList";
import EventDetails from "../pages/Events/EventDetails";
import EventRegister from "../pages/Events/EventRegister";
import TicketPage from "../pages/Tickets/TicketPage";

import AttendeeDashboard from "../pages/Attendee/AttendeeDashboard";
import HostDashboard from "../pages/Host/HostDashboard";
import HostEventRegistrations from "../pages/Host/HostEventRegistrations";
import HostEventSettings from "../pages/Host/HostEventSettings";
import AdminDashboard from "../pages/Admin/AdminDashboard";

import ProfileSetup from "../pages/Profile/ProfileSetup";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />

      <Route path="/events" element={<EventList />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/register/:id" element={<EventRegister />} />

      <Route path="/ticket/:ticketId" element={<TicketPage />} />

      <Route path="/attendee-dashboard" element={<AttendeeDashboard />} />
      <Route path="/host-dashboard" element={<HostDashboard />} />
      <Route path="/host/event/:id/registrations" element={<HostEventRegistrations />} />
      <Route path="/host/event/:id/settings" element={<HostEventSettings />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      <Route path="/profile" element={<ProfileSetup />} />
    </Routes>
  );
}
