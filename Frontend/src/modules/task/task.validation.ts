import { z } from "zod";

/**
 * Validation for Creating a Task
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  // Matching your frontend Select values: "low", "medium", "high"
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  // Accept an empty string from the frontend and convert it to undefined/null
  due_date: z.preprocess((arg: string) => (arg === "" ? undefined : arg), z.string().datetime().optional()),
});

/**
 * Validation for Updating a Task
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.preprocess((arg: string) => (arg === "" ? undefined : arg), z.string().datetime().optional()),
});

/**
 * Validation for List/Search Query Parameters
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z.enum(["todo", "done", "all"]).optional(),
  priority: z.enum(["low", "medium", "high", "all"]).optional(),
  search: z.string().optional(),
});
