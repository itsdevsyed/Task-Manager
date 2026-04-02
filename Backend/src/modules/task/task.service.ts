import { prisma } from "../../config/prisma.js";
import { Task } from "@prisma/client";

/**
 * CREATE TASK
 * Handles date conversion and default assignments
 */
export const createTask = async (
  data: {
    title: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    due_date?: string;
    assigned_to?: string;
  },
  userId: string
): Promise<Task> => {
  const assignedToId = data.assigned_to || userId;

  // Verify the assigned user exists
  const assignedUser = await prisma.user.findUnique({
    where: { id: assignedToId },
  });

  if (!assignedUser) {
    throw { status: 422, message: "Assigned user does not exist" };
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description || "",
      status: data.status || "TODO",
      priority: data.priority || "MEDIUM",
      // Convert ISO string from frontend to JS Date object
      due_date: data.due_date ? new Date(data.due_date) : null,
      assigned_to: assignedToId,
      created_by: userId,
    },
  });
};

/**
 * GET TASKS
 * Fixed: Removed 'mode: "insensitive"' to prevent Prisma/SQLite crashes
 */
export const getTasks = async (
  page: number,
  limit: number,
  filters: {
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    assignedTo?: string;
    search?: string;
  },
  user: { userId: string; role: string }
): Promise<{
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}> => {
  const where: any = {};

  // RBAC: Non-admins only see tasks they created or are assigned to
  if (user.role !== "ADMIN") {
    where.OR = [
      { created_by: user.userId },
      { assigned_to: user.userId },
    ];
  }

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedTo) where.assigned_to = filters.assignedTo;

  if (filters.search) {
    where.title = {
      contains: filters.search,
      // REMOVED mode: "insensitive" as it is not supported on all DB providers
    };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      // Note: check your schema.prisma - if it's createdAt (camelCase), change it here
      orderBy: { created_at: "desc" },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, page, limit };
};

/**
 * GET ONE BY ID
 */
export const getTaskById = async (id: string): Promise<Task | null> => {
  return prisma.task.findUnique({ where: { id } });
};

/**
 * UPDATE TASK
 */
export const updateTask = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    due_date?: string | null;
    assigned_to?: string;
  }
): Promise<Task> => {
  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;

  if (data.due_date !== undefined) {
    updateData.due_date = data.due_date ? new Date(data.due_date) : null;
  }

  if (data.assigned_to !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: data.assigned_to },
    });

    if (!user) {
      throw { status: 422, message: "Assigned user does not exist" };
    }

    updateData.assigned_to = data.assigned_to;
  }

  return prisma.task.update({
    where: { id },
    data: updateData,
  });
};

/**
 * DELETE TASK
 */
export const deleteTask = async (id: string): Promise<Task> => {
  return prisma.task.delete({
    where: { id },
  });
};
