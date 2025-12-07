import { apiClient } from "./apiClient";

export const EventService = {
  list: () => apiClient.get("/events"),
  featured: () => apiClient.get("/events/featured"),
  byId: (id) => apiClient.get(`/events/${id}`),
  teamInfo: (id) => apiClient.get(`/events/team-size/${id}`),
  register: (id, payload) => apiClient.post(`/events/${id}/register`, payload, { auth: true }),
  myRegistrations: () => apiClient.get("/events/my-registrations", { auth: true }),
};
