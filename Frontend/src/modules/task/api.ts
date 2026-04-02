const BASE_URL = "http://localhost:3001";

/**
 * Helper to get the token for Protected Routes
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Define the shape of our Task for TypeScript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date?: string;
}

// Define the shape of the Task List response
interface GetTasksResponse {
  tasks: Task[];
  total: number;
  completedCount: number;
  page: number;
  limit: number;
}

// --- AUTH API ---

export const signupApi = async (data: any) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    const err: any = new Error(result.error || "Signup failed");
    err.response = { data: result };
    throw err;
  }
  return result;
};

export const loginApi = async (data: any) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    const err: any = new Error(result.error || "Login failed");
    err.response = { data: result };
    throw err;
  }
  return result;
};

// --- TASKS API (PROTECTED) ---

export const getTasksApi = async (params: any = {}): Promise<GetTasksResponse> => {
  // CLEANER: Remove undefined or null values so they don't appear in the URL
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value != null && value !== "")
  );

  const query = new URLSearchParams(cleanParams as any).toString();

  const res = await fetch(`${BASE_URL}/tasks?${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to fetch tasks");

  return result as GetTasksResponse;
};

export const createTaskApi = async (data: any) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to create task");
  return result;
};

export const updateTaskApi = async (id: string, data: any) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to update task");
  return result;
};

export const deleteTaskApi = async (id: string) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || "Failed to delete task");
  }
  return true;
};
