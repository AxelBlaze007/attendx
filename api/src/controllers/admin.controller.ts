import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../types";
import { AppError } from "../utils/errors";
import bcrypt from "bcryptjs";

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalAttendances,
      totalRewardItems,
      totalClaims,
      totalLaptops,
      totalBookings,
      totalMatchRequests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.attendance.count(),
      prisma.rewardItem.count(),
      prisma.rewardClaim.count(),
      prisma.laptopInventory.count(),
      prisma.laptopBooking.count(),
      prisma.matchRequest.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, department: true, role: true, createdAt: true },
    });

    const recentAttendances = await prisma.attendance.findMany({
      orderBy: { timestamp: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    });

    res.json({
      success: true,
      message: "Admin stats fetched",
      data: {
        counts: {
          totalUsers,
          totalStudents,
          totalAdmins,
          totalAttendances,
          totalRewardItems,
          totalClaims,
          totalLaptops,
          totalBookings,
          totalMatchRequests,
        },
        recentUsers,
        recentAttendances,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "20", search, role } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          department: true,
          year: true,
          role: true,
          subscriptionStatus: true,
          pointsBalance: true,
          skills: true,
          interests: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { attendances: true, rewardClaims: true, laptopBookings: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Users fetched",
      data: { users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        year: true,
        role: true,
        subscriptionStatus: true,
        pointsBalance: true,
        skills: true,
        interests: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { attendances: true, rewardClaims: true, laptopBookings: true, sentMatchRequests: true, receivedMatchRequests: true } },
      },
    });
    if (!user) throw new AppError("User not found", 404);

    res.json({ success: true, message: "User fetched", data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, email, department, year, role, subscriptionStatus, pointsBalance, skills, interests } = req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (department !== undefined) data.department = department;
    if (year !== undefined) data.year = year;
    if (role !== undefined) data.role = role;
    if (subscriptionStatus !== undefined) data.subscriptionStatus = subscriptionStatus;
    if (pointsBalance !== undefined) data.pointsBalance = pointsBalance;
    if (skills !== undefined) data.skills = skills;
    if (interests !== undefined) data.interests = interests;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        year: true,
        role: true,
        subscriptionStatus: true,
        pointsBalance: true,
        skills: true,
        interests: true,
      },
    });

    res.json({ success: true, message: "User updated", data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (id === req.user!.userId) {
      throw new AppError("Cannot delete your own account", 400);
    }
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
}

export async function createRewardItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, category, pointCost, availableQty, imageUrl } = req.body;
    const item = await prisma.rewardItem.create({
      data: { title, category, pointCost, availableQty, imageUrl },
    });
    res.status(201).json({ success: true, message: "Reward item created", data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateRewardItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { title, category, pointCost, availableQty, imageUrl } = req.body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (category !== undefined) data.category = category;
    if (pointCost !== undefined) data.pointCost = pointCost;
    if (availableQty !== undefined) data.availableQty = availableQty;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const item = await prisma.rewardItem.update({ where: { id }, data });
    res.json({ success: true, message: "Reward item updated", data: item });
  } catch (error) {
    next(error);
  }
}

export async function deleteRewardItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.rewardItem.delete({ where: { id } });
    res.json({ success: true, message: "Reward item deleted" });
  } catch (error) {
    next(error);
  }
}

export async function getAllAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        skip,
        take: Number(limit),
        orderBy: { timestamp: "desc" },
        include: { user: { select: { id: true, name: true, email: true, department: true } } },
      }),
      prisma.attendance.count(),
    ]);

    res.json({
      success: true,
      message: "Attendance records fetched",
      data: { records, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

export async function createLaptop(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { modelName, specs, labLocation, hourlyRate, status } = req.body;
    const laptop = await prisma.laptopInventory.create({
      data: { modelName, specs, labLocation, hourlyRate: Number(hourlyRate), status: status || "AVAILABLE" },
    });
    res.status(201).json({ success: true, message: "Laptop created", data: laptop });
  } catch (error) {
    next(error);
  }
}

export async function updateLaptop(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { modelName, specs, labLocation, hourlyRate, status } = req.body;

    const data: Record<string, unknown> = {};
    if (modelName !== undefined) data.modelName = modelName;
    if (specs !== undefined) data.specs = specs;
    if (labLocation !== undefined) data.labLocation = labLocation;
    if (hourlyRate !== undefined) data.hourlyRate = Number(hourlyRate);
    if (status !== undefined) data.status = status;

    const laptop = await prisma.laptopInventory.update({ where: { id }, data });
    res.json({ success: true, message: "Laptop updated", data: laptop });
  } catch (error) {
    next(error);
  }
}

export async function deleteLaptop(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.laptopInventory.delete({ where: { id } });
    res.json({ success: true, message: "Laptop deleted" });
  } catch (error) {
    next(error);
  }
}

export async function getAllLaptops(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const laptops = await prisma.laptopInventory.findMany({
      orderBy: { modelName: "asc" },
      include: { _count: { select: { bookings: true } } },
    });
    res.json({ success: true, message: "Laptops fetched", data: laptops });
  } catch (error) {
    next(error);
  }
}

export async function getAllBookings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      prisma.laptopBooking.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          laptop: { select: { id: true, modelName: true, labLocation: true } },
        },
      }),
      prisma.laptopBooking.count(),
    ]);

    res.json({
      success: true,
      message: "Bookings fetched",
      data: { bookings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllMatchRequests(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);

    const [requests, total] = await Promise.all([
      prisma.matchRequest.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true, email: true, department: true } },
          receiver: { select: { id: true, name: true, email: true, department: true } },
        },
      }),
      prisma.matchRequest.count(),
    ]);

    res.json({
      success: true,
      message: "Match requests fetched",
      data: { requests, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllRewards(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await prisma.rewardItem.findMany({
      orderBy: { title: "asc" },
      include: { _count: { select: { claims: true } } },
    });
    res.json({ success: true, message: "Reward items fetched", data: items });
  } catch (error) {
    next(error);
  }
}

export async function getAllClaims(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const claims = await prisma.rewardClaim.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
        rewardItem: { select: { id: true, title: true, category: true } },
      },
    });
    res.json({ success: true, message: "Claims fetched", data: claims });
  } catch (error) {
    next(error);
  }
}

export async function exportUsersCSV(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        email: true,
        department: true,
        year: true,
        role: true,
        subscriptionStatus: true,
        pointsBalance: true,
        createdAt: true,
      },
    });

    const header = "Name,Email,Department,Year,Role,Status,Points,Created At\n";
    const rows = users
      .map((u) => `${u.name},${u.email},${u.department},${u.year},${u.role},${u.subscriptionStatus},${u.pointsBalance},${u.createdAt.toISOString()}`)
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(header + rows);
  } catch (error) {
    next(error);
  }
}
