import { prisma } from "../../config/prisma.js";
import { Status, Priority } from "../../utils/types.js";

export const createTask = async (data: any, userId: string) => {
  const assignedToId = data.assigned_to || userId;

  // Validate assigned user exists
  const assignedUser = await prisma.user.findUnique({ where: { id: assignedToId } });
  if (!assignedUser) {
    throw { status: 422, message: "Assigned user does not exist" };
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description || "",
      status: data.status || "todo",
      priority: data.priority || "medium",
      due_date: data.due_date ? new Date(data.due_date) : null,
      assigned_to: assignedToId,
      created_by: userId,
    },
  });
};

export const getTasks = async (
  page = 1,
  limit = 10,
  filters: Partial<{ status: Status; priority: Priority; assignedTo: string; search: string }> = {}
) => {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedTo) where.assigned_to = filters.assignedTo;
  if (filters.search) where.title = { contains: filters.search, mode: "insensitive" };

  const tasks = await prisma.task.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { created_at: "desc" },
  });

  const total = await prisma.task.count({ where });
  return { tasks, total, page, limit };
};

export const getTaskById = async (id: string) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw { status: 404, message: "Task not found" };
  return task;
};

export const updateTask = async (id: string, data: any) => {
    // Only include the fields that exist in data
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.due_date !== undefined) updateData.due_date = data.due_date ? new Date(data.due_date) : null;
    if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to;

    return prisma.task.update({
      where: { id },
      data: updateData,
    });
  };

export const deleteTask = async (id: string, userId: string, isAdmin: boolean = false) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw { status: 404, message: "Task not found" };

  // Only creator or admin can delete
  if (!isAdmin && task.created_by !== userId) {
    throw { status: 403, message: "Forbidden" };
  }

  return prisma.task.delete({ where: { id } });
};
