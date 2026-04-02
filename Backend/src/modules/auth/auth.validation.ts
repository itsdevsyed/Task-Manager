import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  name: z.string().min(1, "Name is required").max(100),
});

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});
