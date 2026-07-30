import { Router } from "express";
import { markAttendance, getHistory } from "../controllers/attendance.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { markAttendanceSchema } from "../schemas/attendance.schema";

const router = Router();

router.post("/mark", authenticate, validate(markAttendanceSchema), markAttendance);
router.get("/history", authenticate, getHistory);

export default router;
