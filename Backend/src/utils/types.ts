// Use string literal union
export type Role = "ADMIN" | "USER";
export type Status = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

// Arrays for validation
export const Roles: Role[] = ["ADMIN", "USER"];
export const Statuses: Status[] = ["TODO", "IN_PROGRESS", "DONE"];
export const Priorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];

