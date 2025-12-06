import { apiClient } from "./apiClient";

export const AttendeeService = {
  myProfile: () => apiClient.get("/users/me", { auth: true }),
  myRegistrations: () => apiClient.get("/events/my-registrations", { auth: true }),
};
