import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../types";
import { AppError } from "../utils/errors";

export async function getMatches(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true, interests: true, department: true },
    });

    if (!currentUser) {
      throw new AppError("User not found", 404);
    }

    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        year: true,
        skills: true,
        interests: true,
      },
    });

    const matches = allUsers
      .map((user) => {
        const skillOverlap = user.skills.filter((s) =>
          currentUser.skills.some((cs) => cs.toLowerCase() === s.toLowerCase())
        ).length;

        const interestOverlap = user.interests.filter((i) =>
          currentUser.interests.some((ci) => ci.toLowerCase() === i.toLowerCase())
        ).length;

        const totalSkills = Math.max(
          new Set([...currentUser.skills.map((s) => s.toLowerCase()), ...user.skills.map((s) => s.toLowerCase())]).size,
          1
        );
        const totalInterests = Math.max(
          new Set([...currentUser.interests.map((i) => i.toLowerCase()), ...user.interests.map((i) => i.toLowerCase())]).size,
          1
        );

        const skillScore = (skillOverlap / totalSkills) * 60;
        const interestScore = (interestOverlap / totalInterests) * 40;
        const matchPercentage = Math.round((skillScore + interestScore) * 100) / 100;

        return {
          ...user,
          matchPercentage,
          matchingSkills: user.skills.filter((s) =>
            currentUser.skills.some((cs) => cs.toLowerCase() === s.toLowerCase())
          ),
          matchingInterests: user.interests.filter((i) =>
            currentUser.interests.some((ci) => ci.toLowerCase() === i.toLowerCase())
          ),
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 20);

    res.json({
      success: true,
      message: "Teammate matches fetched",
      data: matches,
    });
  } catch (error) {
    next(error);
  }
}

export async function connect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const senderId = req.user!.userId;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      throw new AppError("Cannot send request to yourself", 400);
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      throw new AppError("Receiver not found", 404);
    }

    const existing = await prisma.matchRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existing) {
      throw new AppError("A match request already exists between you and this user", 409);
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: senderId },
      select: { skills: true, interests: true },
    });

    const skillOverlap = receiver.skills.filter((s) =>
      currentUser!.skills.some((cs) => cs.toLowerCase() === s.toLowerCase())
    ).length;
    const interestOverlap = receiver.interests.filter((i) =>
      currentUser!.interests.some((ci) => ci.toLowerCase() === i.toLowerCase())
    ).length;

    const total = Math.max(
      new Set([
        ...currentUser!.skills.map((s) => s.toLowerCase()),
        ...receiver.skills.map((s) => s.toLowerCase()),
        ...currentUser!.interests.map((i) => i.toLowerCase()),
        ...receiver.interests.map((i) => i.toLowerCase()),
      ]).size,
      1
    );

    const matchPercentage = Math.round(((skillOverlap + interestOverlap) / total) * 10000) / 100;

    const request = await prisma.matchRequest.create({
      data: {
        senderId,
        receiverId,
        matchPercentage,
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

export async function getChatHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const senderId = req.user!.userId;
    const receiverId = req.params.receiverId as string;

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      orderBy: { timestamp: "asc" },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: "Chat history fetched",
      data: messages,
    });
  } catch (error) {
    next(error);
  }
}
