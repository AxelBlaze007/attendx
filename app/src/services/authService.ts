import api from "../api/axiosClient";

export const authService = {
  register(data: { email: string; password: string; name: string; department: string; year: number; skills?: string[]; interests?: string[] }) {
    return api.post("/auth/register", data).then((r) => r.data);
  },

  login(email: string, password: string) {
    return api.post("/auth/login", { email, password }).then((r) => r.data);
  },

  getProfile() {
    return api.get("/auth/profile").then((r) => r.data);
  },

  forgotPassword(email: string) {
    return api.post("/auth/forgot-password", { email }).then((r) => r.data);
  },

  resetPassword(email: string, token: string, password: string) {
    return api.post("/auth/reset-password", { email, token, password }).then((r) => r.data);
  },

  updateProfile(data: { name?: string; department?: string; year?: number; phoneNumber?: string; skills?: string[]; interests?: string[] }) {
    return api.put("/auth/profile", data).then((r) => r.data);
  },

  updateAvatar(avatarUrl: string) {
    return api.post("/auth/update-avatar", { avatarUrl }).then((r) => r.data);
  },

  changePassword(currentPassword: string, newPassword: string) {
    return api.put("/auth/change-password", { currentPassword, newPassword }).then((r) => r.data);
  },
};
