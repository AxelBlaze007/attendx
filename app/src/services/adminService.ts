import api from "../api/axiosClient";

export const adminService = {
  getStats() {
    return api.get("/admin/stats").then((r) => r.data);
  },

  getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    return api.get("/admin/users", { params }).then((r) => r.data);
  },

  getUserById(id: string) {
    return api.get(`/admin/users/${id}`).then((r) => r.data);
  },

  updateUser(id: string, data: Record<string, unknown>) {
    return api.put(`/admin/users/${id}`, data).then((r) => r.data);
  },

  deleteUser(id: string) {
    return api.delete(`/admin/users/${id}`).then((r) => r.data);
  },

  getRewards() {
    return api.get("/admin/rewards").then((r) => r.data);
  },

  createReward(data: { title: string; category: string; pointCost: number; availableQty: number; imageUrl?: string }) {
    return api.post("/admin/rewards", data).then((r) => r.data);
  },

  updateReward(id: string, data: Record<string, unknown>) {
    return api.put(`/admin/rewards/${id}`, data).then((r) => r.data);
  },

  deleteReward(id: string) {
    return api.delete(`/admin/rewards/${id}`).then((r) => r.data);
  },

  getAttendance(params?: { page?: number; limit?: number }) {
    return api.get("/admin/attendance", { params }).then((r) => r.data);
  },

  getLaptops() {
    return api.get("/admin/laptops").then((r) => r.data);
  },

  createLaptop(data: { modelName: string; specs: string; labLocation: string; hourlyRate: number; status?: string }) {
    return api.post("/admin/laptops", data).then((r) => r.data);
  },

  updateLaptop(id: string, data: Record<string, unknown>) {
    return api.put(`/admin/laptops/${id}`, data).then((r) => r.data);
  },

  deleteLaptop(id: string) {
    return api.delete(`/admin/laptops/${id}`).then((r) => r.data);
  },

  getBookings(params?: { page?: number; limit?: number }) {
    return api.get("/admin/bookings", { params }).then((r) => r.data);
  },

  getMatchRequests(params?: { page?: number; limit?: number }) {
    return api.get("/admin/match-requests", { params }).then((r) => r.data);
  },

  getClaims() {
    return api.get("/admin/claims").then((r) => r.data);
  },

  exportUsersCSV() {
    return api.get("/admin/users/export-csv", { responseType: "blob" }).then((r) => r.data);
  },
};
