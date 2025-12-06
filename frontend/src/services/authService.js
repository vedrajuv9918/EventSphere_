import { apiClient } from "./apiClient";

async function persistAuth(res) {
  const data = await res;
  if (data?.token) {
    localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export const AuthService = {
  login: async (payload) => {
    try {
      const data = await persistAuth(apiClient.post("/auth/login", payload));
      return { ok: true, data };
    } catch (err) {
      return { ok: false, data: { error: err.message } };
    }
  },
  register: async (payload) => {
    try {
      const data = await persistAuth(apiClient.post("/auth/register", payload));
      return { ok: true, data };
    } catch (err) {
      return { ok: false, data: { error: err.message } };
    }
  },
  me: () => apiClient.get("/auth/me", { auth: true }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
