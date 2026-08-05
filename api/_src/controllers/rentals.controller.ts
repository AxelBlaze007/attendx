import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../types";
import { AppError } from "../utils/errors";
import { generateQrCodeData } from "../utils/qr";
import crypto from "crypto";

const DURATION_MULTIPLIER: Record<string, number> = {
  HOURLY: 1,
  HALF_DAY: 4,
  FULL_DAY: 8,
};

export async function getAvailableLaptops(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { labLocation, status } = req.query as {
      labLocation?: string;
      status?: string;
    };

    const where: Record<string, unknown> = {};
    if (labLocation) where.labLocation = labLocation;
    if (status) where.status = status;
    else where.status = "AVAILABLE";

    const laptops = await prisma.laptopInventory.findMany({
      where,
      orderBy: { modelName: "asc" },
    });

    res.json({
      success: true,
      message: "Available laptops fetched",
      data: laptops,
    });
  } catch (error) {
    next(error);
  }
}

export async function bookLaptop(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { laptopId, duration, startTime } = req.body;

    const laptop = await prisma.laptopInventory.findUnique({
      where: { id: laptopId },
    });

    if (!laptop) {
      throw new AppError("Laptop not found", 404);
    }

    if (laptop.status !== "AVAILABLE") {
      throw new AppError("Laptop is not available for rent", 400);
    }

    const start = new Date(startTime);
    const hours = DURATION_MULTIPLIER[duration];
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    const totalAmount = laptop.hourlyRate * hours;

    const pickupQrCode = await generateQrCodeData(
      JSON.stringify({ laptopId, userId, startTime: start.toISOString() })
    );

    const booking = await prisma.$transaction(async (tx) => {
      const booking = await tx.laptopBooking.create({
        data: {
          userId,
          laptopId,
          duration,
          startTime: start,
          endTime: end,
          totalAmount,
          paymentStatus: "PENDING",
          pickupQrCode,
        },
      });

      await tx.laptopInventory.update({
        where: { id: laptopId },
        data: { status: "RENTED" },
      });

      return booking;
    });

    res.status(201).json({
      success: true,
      message: "Laptop booked successfully",
      data: {
        bookingId: booking.id,
        totalAmount: booking.totalAmount,
        pickupQrCode: booking.pickupQrCode,
        startTime: booking.startTime,
        endTime: booking.endTime,
        razorpayOrderId: `order_${crypto.randomBytes(8).toString("hex")}`,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const bookings = await prisma.laptopBooking.findMany({
      where: { userId },
      include: { laptop: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      message: "Bookings fetched",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { bookingId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await prisma.laptopBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.paymentStatus === "COMPLETED") {
      throw new AppError("Payment already completed", 400);
    }

    // Simulated Razorpay signature verification
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "razorpay-secret")
      .update(`${bookingId}|${razorpayPaymentId}`)
      .digest("hex");

    if (razorpaySignature !== expectedSignature) {
      throw new AppError("Invalid payment signature", 400);
    }

    const updated = await prisma.laptopBooking.update({
      where: { id: bookingId },
      data: { paymentStatus: "COMPLETED" },
    });

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
