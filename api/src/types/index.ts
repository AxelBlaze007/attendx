import { Request } from "express";

export interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ErrorResponse {
  success: false;
  message: string;
  stack?: string;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}
