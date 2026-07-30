import { Router } from "express";
import { getItems, redeem } from "../controllers/rewards.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { redeemSchema, itemQuerySchema } from "../schemas/rewards.schema";

const router = Router();

router.get("/items", authenticate, validate(itemQuerySchema), getItems);
router.post("/redeem", authenticate, validate(redeemSchema), redeem);

export default router;
