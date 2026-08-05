import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../types";
import { AppError } from "../utils/errors";

export async function markAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { subjectName, roomNo, qrPayload } = req.body;

    // Validate QR payload (simulated QR verification)
    if (!qrPayload || qrPayload !== "ATTENDX_VALID_CLASS_QR") {
      throw new AppError("Invalid or expired QR code", 400);
    }

    const POINTS_EARNED = 2;

    const [attendance] = await prisma.$transaction([
      prisma.attendance.create({
        data: {
          userId,
          subjectName,
          roomNo,
          pointsEarned: POINTS_EARNED,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { increment: POINTS_EARNED } },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: {
        attendance,
        pointsEarned: POINTS_EARNED,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { subjectName } = req.query as { subjectName?: string };

    const where: Record<string, unknown> = { userId };
    if (subjectName) {
      where.subjectName = subjectName;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });

    const total = attendances.length;
    const presentDays = total;
    const percentage = total > 0 ? 100 : 0;

    res.json({
      success: true,
      message: "Attendance history fetched",
      data: {
        records: attendances,
        summary: {
          total,
          presentDays,
          percentage: Math.round(percentage * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
