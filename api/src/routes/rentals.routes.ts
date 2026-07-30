import { Router } from "express";
import {
  getAvailableLaptops,
  bookLaptop,
  getMyBookings,
  verifyPayment,
} from "../controllers/rentals.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { bookLaptopSchema, verifyPaymentSchema, laptopQuerySchema } from "../schemas/rentals.schema";

const router = Router();

router.get("/available-laptops", authenticate, validate(laptopQuerySchema), getAvailableLaptops);
router.get("/my-bookings", authenticate, getMyBookings);
router.post("/book", authenticate, validate(bookLaptopSchema), bookLaptop);
router.post("/verify-payment", authenticate, validate(verifyPaymentSchema), verifyPayment);

export default router;
