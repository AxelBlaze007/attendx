import crypto from "crypto";
import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../types";
import { AppError, UnauthorizedError } from "../utils/errors";

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password, name, department, year, skills, interests } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        department,
        year,
        pointsBalance: 0,
        skills: skills || [],
        interests: interests || [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        year: true,
        role: true,
        pointsBalance: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken({ userId: user.id, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({
        success: true,
        message: "If that email is registered, a reset code has been sent.",
      });
    }

    const rawToken = crypto.randomInt(100000, 999999).toString();
    const hashedToken = await bcrypt.hash(rawToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    console.log(`[DEV] Reset OTP for ${email}: ${rawToken}`);

    res.json({
      success: true,
      message: "If that email is registered, a reset code has been sent.",
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, token, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    if (user.resetPasswordExpiresAt < new Date()) {
      throw new AppError("Reset token has expired. Please request a new one.", 410);
    }

    const valid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!valid) {
      throw new AppError("Invalid reset token", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    });

    res.json({
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        phoneNumber: true,
        department: true,
        year: true,
        role: true,
        subscriptionStatus: true,
        pointsBalance: true,
        skills: true,
        interests: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      message: "Profile fetched",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, department, year, phoneNumber, skills, interests } = req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (department !== undefined) data.department = department;
    if (year !== undefined) data.year = year;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (skills !== undefined) data.skills = skills;
    if (interests !== undefined) data.interests = interests;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        phoneNumber: true,
        department: true,
        year: true,
        role: true,
        subscriptionStatus: true,
        pointsBalance: true,
        skills: true,
        interests: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAvatar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
}
