import api from "../api/axiosClient";

export const teammateService = {
  getMatches() {
    return api.get("/teammates/matches").then((r) => r.data);
  },

  sendConnection(receiverId: string) {
    return api.post("/teammates/connect", { receiverId }).then((r) => r.data);
  },

  getChatHistory(receiverId: string) {
    return api.get(`/teammates/chat/${receiverId}`).then((r) => r.data);
  },
};
