import { Request, Response, NextFunction } from "express";
import * as service from "./task.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { Status, Priority } from "./task.types.js";

// CREATE TASK
export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await service.createTask(req.body, req.user!.userId);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// LIST TASKS
export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, priority, assignedTo, search } = req.query as any;

    const result = await service.getTasks(
      Number(page) || 1,
      Number(limit) || 10,
      {
        status: status as Status,
        priority: priority as Priority,
        assignedTo: assignedTo as string,
        search: search as string,
      }
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET ONE TASK
export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await service.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// UPDATE TASK
export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await service.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Permission check: Admin, Owner, or Assignee can update
    const isAdmin = req.user!.role === "ADMIN";
    const isOwner = task.created_by === req.user!.userId;
    const isAssignee = task.assigned_to === req.user!.userId;

    if (!isAdmin && !isOwner && !isAssignee) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Only update fields present in body (partial update)
    const updated = await service.updateTask(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE TASK
export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await service.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Only Admin or Owner can delete
    const isAdmin = req.user!.role === "ADMIN";
    const isOwner = task.created_by === req.user!.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await service.deleteTask(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};
