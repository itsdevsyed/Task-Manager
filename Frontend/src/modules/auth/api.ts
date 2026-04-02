/**
 * BASE_URL logic:
 * On Render: Uses the VITE_API_URL you set in the dashboard.
 * Locally: Defaults to localhost:3001.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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
