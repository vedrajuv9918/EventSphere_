import { apiClient } from "./apiClient";

export const AdminService = {
  events: (status) =>
    apiClient.get(
      status ? `/admin/events?status=${encodeURIComponent(status)}` : "/admin/events",
      { auth: true }
    ),
  approve: (id, payload) =>
    apiClient.put(`/admin/event/approve/${id}`, payload || {}, { auth: true }),
  reject: (id, payload) =>
    apiClient.put(`/admin/event/reject/${id}`, payload || {}, { auth: true }),
  updateStatus: (id, payload) =>
    apiClient.put(`/admin/event/status/${id}`, payload, { auth: true }),
  stats: () => apiClient.get("/admin/stats", { auth: true }),
};
