import { apiClient } from "./apiClient";

export const HostService = {
  createEvent: (payload) => apiClient.post("/host/create", payload, { auth: true }),
  updateEvent: (id, payload) => apiClient.put(`/host/event/${id}`, payload, { auth: true }),
  toggleEvent: (id) => apiClient.put(`/host/event/toggle/${id}`, null, { auth: true }),
  myEvents: () => apiClient.get("/host/my-events", { auth: true }),
  registrations: (eventId) =>
    apiClient.get(`/host/registrations/${eventId}`, { auth: true }),
  insights: (eventId) =>
    apiClient.get(`/host/event/insights/${eventId}`, { auth: true }),
  exportRegistrations: (eventId) =>
    apiClient.get(`/host/event/export/${eventId}`, {
      auth: true,
      headers: { Accept: "text/csv" },
    }),
};
