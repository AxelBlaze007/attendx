import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import attendanceRoutes from "./routes/attendance.routes";
import rewardsRoutes from "./routes/rewards.routes";
import rentalsRoutes from "./routes/rentals.routes";
import teammatesRoutes from "./routes/teammates.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "AttendX API is running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/rentals", rentalsRoutes);
app.use("/api/teammates", teammatesRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);
