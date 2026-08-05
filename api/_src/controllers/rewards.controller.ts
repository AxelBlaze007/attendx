import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../types";
import { AppError } from "../utils/errors";
import { generateVoucherCode } from "../utils/qr";

export async function getItems(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { category } = req.query as { category?: string };

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }

    const items = await prisma.rewardItem.findMany({
      where,
      orderBy: { title: "asc" },
    });

    res.json({
      success: true,
      message: "Reward items fetched",
      data: items,
    });
  } catch (error) {
    next(error);
  }
}

export async function redeem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { rewardItemId } = req.body;

    const item = await prisma.rewardItem.findUnique({
      where: { id: rewardItemId },
    });

    if (!item) {
      throw new AppError("Reward item not found", 404);
    }

    if (item.availableQty <= 0) {
      throw new AppError("Reward item is out of stock", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true },
    });

    if (!user || user.pointsBalance < item.pointCost) {
      throw new AppError(
        `Insufficient points. You need ${item.pointCost} but have ${user?.pointsBalance ?? 0}`,
        400
      );
    }

    const qrVoucherCode = generateVoucherCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const [claim] = await prisma.$transaction([
      prisma.rewardClaim.create({
        data: {
          userId,
          rewardItemId,
          qrVoucherCode,
          expiresAt,
          status: "PENDING",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { decrement: item.pointCost } },
      }),
      prisma.rewardItem.update({
        where: { id: rewardItemId },
        data: { availableQty: { decrement: 1 } },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Reward redeemed successfully",
      data: {
        claimId: claim.id,
        qrVoucherCode: claim.qrVoucherCode,
        expiresAt: claim.expiresAt,
        itemTitle: item.title,
        pointsSpent: item.pointCost,
      },
    });
  } catch (error) {
    next(error);
  }
}
