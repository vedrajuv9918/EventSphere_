import { apiClient } from "./apiClient";

export const TicketService = {
  byId: (ticketId) => apiClient.get(`/tickets/${ticketId}`, { auth: true }),
};
