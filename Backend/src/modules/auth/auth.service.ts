import { prisma } from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role, Roles } from "../../utils/types.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

type SignupInput = {
  email: string;
  password: string;
  name: string;
  role?: string; // optional, but we will enforce default USER
};

type LoginInput = {
  email: string;
  password: string;
};

export const signup = async (data: SignupInput) => {
  // Validate required fields
  if (!data.email || !data.password || !data.name) {
    throw { status: 422, message: "Email, password, and name are required" };
  }

  // Normalize email
  const email = data.email.toLowerCase().trim();

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) throw { status: 422, message: "Email already exists" };

  // Hash password
  const hashed = await bcrypt.hash(data.password, 12);

  // Enforce default role
  const role: Role = Roles.includes(data.role as Role) ? (data.role as Role) : "USER";
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: data.name,
      role, // default enforced
    },
  });

  // Exclude password from returned object
  const { password, ...safeUser } = user;
  return safeUser;
};

export const login = async (data: LoginInput) => {
  // Validate input
  if (!data.email || !data.password) {
    throw { status: 422, message: "Email and password are required" };
  }

  // Normalize email
  const email = data.email.toLowerCase().trim();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw { status: 401, message: "Invalid credentials" };

  // Verify password
  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  // Sign JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return { token };
};
