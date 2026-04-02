import { Request, Response, NextFunction } from "express";
import * as service from "./auth.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { prisma } from "../../config/prisma.js";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.signup(req.body);
    res.json(user);
  } catch (err: any) {
    // Check if the service threw a duplicate email error
    if (err.status === 422 && err.message === "Email already exists") {
      return res.status(422).json({ error: "Email is already registered" });
    }
    // Fallback to generic error handler
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.login(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};


export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw { status: 401, message: "Unauthorized" };
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, name: true, role: true, created_at: true },
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  };
