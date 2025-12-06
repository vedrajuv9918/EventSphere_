import { apiClient } from "./apiClient";

export const UserService = {
  me: () => apiClient.get("/users/me", { auth: true }),
  updateProfile: (payload) => apiClient.put("/users/profile", payload, { auth: true }),
  uploadProfilePhoto: (file) => {
    const form = new FormData();
    form.append("image", file);
    return apiClient.upload("/users/profile/photo", form, { auth: true });
  },
};
