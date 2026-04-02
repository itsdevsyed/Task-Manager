import { Request, Response, NextFunction } from "express";
import * as service from "./auth.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { prisma } from "../../config/prisma.js";
import { signupSchema, loginSchema } from "./auth.validation.js";

/**
 * Helper to format Zod errors safely.
 * Uses .issues (standard in newer Zod versions) and includes
 * a fallback check to prevent "Cannot read property of undefined" crashes.
 */
const formatZodError = (error: any) => {
  const fields: Record<string, string> = {};

  // Use .issues or .errors, whichever exists. Fallback to empty array.
  const errors = error?.issues || error?.errors || [];

  errors.forEach((err: any) => {
    if (err.path && err.path[0]) {
      fields[err.path[0].toString()] = err.message;
    }
  });

  return fields;
};

// SIGNUP
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(422).json({
        error: "Validation failed",
        fields: formatZodError(parsed.error),
      });
    }

    const user = await service.signup(parsed.data);
    res.status(201).json(user);
  } catch (err: any) {
    // If the service throws a specific error (like "Email already exists")
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};

// LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(422).json({
        error: "Validation failed",
        fields: formatZodError(parsed.error),
      });
    }

    const data = await service.login(parsed.data);
    res.json(data);
  } catch (err: any) {
    // Catch common login errors (Incorrect password/email)
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};

// ME
export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
