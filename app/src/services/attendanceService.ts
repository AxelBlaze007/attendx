import api from "../api/axiosClient";

export const attendanceService = {
  markAttendance(data: { subjectName: string; roomNo: string; qrPayload: string }) {
    return api.post("/attendance/mark", data).then((r) => r.data);
  },

  getHistory() {
    return api.get("/attendance/history").then((r) => r.data);
  },
};
