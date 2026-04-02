import { prisma } from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

/**
 * SIGNUP SERVICE
 * Now returns both the user and a token so they don't have to login again immediately.
 */
export const signup = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  const { email, password, name } = data;

  // 1. Check if email exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    // Controller will catch this and send a 422
    throw { status: 422, message: "Email already registered" };
  }

  // 2. Securely hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Create user in DB
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(), // Normalize email
      password: hashedPassword,
      name: name.trim(),
      role: "USER",
    },
  });

  // 4. Generate token for immediate login
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
  };
};

/**
 * LOGIN SERVICE
 */
export const login = async (data: {
  email: string;
  password: string;
}) => {
  const { email, password } = data;

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw { status: 401, message: "Invalid email or password" };
  }

  // 3. Generate JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role // Included role for frontend RBAC
    },
  };
};
