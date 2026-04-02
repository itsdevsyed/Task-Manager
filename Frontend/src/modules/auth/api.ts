const BASE_URL = "http://localhost:3001";


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};


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


export const getTasksApi = async (params: any = {}) => {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(`${BASE_URL}/tasks?${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to fetch tasks");
  return result;
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
