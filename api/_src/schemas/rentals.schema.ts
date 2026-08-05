import { z } from "zod";

export const bookLaptopSchema = z.object({
  body: z.object({
    laptopId: z.string().min(1, "Laptop ID is required"),
    duration: z.enum(["HOURLY", "HALF_DAY", "FULL_DAY"]),
    startTime: z.string().datetime("Invalid start time"),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    razorpayPaymentId: z.string().min(1, "Payment ID is required"),
    razorpaySignature: z.string().min(1, "Signature is required"),
  }),
});

export const laptopQuerySchema = z.object({
  query: z.object({
    labLocation: z.string().optional(),
    status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
  }),
});
