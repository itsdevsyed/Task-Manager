import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  // ✅ ZOD VALIDATION ERROR
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};

    err.issues.forEach((e) => {
      const key = e.path.join(".");
      fields[key] = e.message;
    });

    return res.status(422).json({
      error: "Validation failed",
      fields,
    });
  }

  // ✅ CUSTOM ERROR (your throw { status, message })
  if (err?.status) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
  });
};
