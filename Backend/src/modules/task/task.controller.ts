import { Response, NextFunction } from "express";
import * as service from "./task.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  listQuerySchema,
} from "./task.validation.js";

/**
 * HELPER: Formats Zod validation issues into a clean object
 * e.g., { title: "Required", priority: "Invalid enum value" }
 */
const formatError = (error: any) => {
  if (!error || !error.issues) return {};
  return Object.fromEntries(
    error.issues.map((e: any) => [e.path[0], e.message])
  );
};

// CREATE
export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(422).json({
        error: "Validation failed",
        fields: formatError(parsed.error),
      });
    }

    const task = await service.createTask(parsed.data, req.user!.userId);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// LIST
export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(422).json({ error: "Invalid query params" });
    }

    const result = await service.getTasks(
      parsed.data.page,
      parsed.data.limit,
      parsed.data,
      req.user!
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET ONE
export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await service.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const user = req.user!;

    if (
      user.role !== "ADMIN" &&
      task.created_by !== user.userId &&
      task.assigned_to !== user.userId
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(422).json({
        error: "Validation failed",
        fields: formatError(parsed.error),
      });
    }

    const task = await service.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const user = req.user!;

    if (
      user.role !== "ADMIN" &&
      task.created_by !== user.userId &&
      task.assigned_to !== user.userId
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await service.updateTask(req.params.id, parsed.data);

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE
export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await service.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const user = req.user!;

    if (user.role !== "ADMIN" && task.created_by !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await service.deleteTask(req.params.id);

    res.json({ message: "Task deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
};
