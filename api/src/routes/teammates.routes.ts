import { Router } from "express";
import { getMatches, connect, getChatHistory } from "../controllers/teammates.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { connectSchema, chatParamsSchema } from "../schemas/teammates.schema";

const router = Router();

router.get("/matches", authenticate, getMatches);
router.post("/connect", authenticate, validate(connectSchema), connect);
router.get("/chat/:receiverId", authenticate, validate(chatParamsSchema), getChatHistory);

export default router;
