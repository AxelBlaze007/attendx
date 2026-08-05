import { z } from "zod";

export const markAttendanceSchema = z.object({
  body: z.object({
    subjectName: z.string().min(1, "Subject name is required"),
    roomNo: z.string().min(1, "Room number is required"),
    qrPayload: z.string().min(1, "QR payload is required"),
  }),
});
