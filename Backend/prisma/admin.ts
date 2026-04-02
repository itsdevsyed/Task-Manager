import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const email = "admin@gmail.com";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash("AdminPass1", 12);
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: "Admin User",
        role: "ADMIN",
      },
    });
    console.log("Admin user created");
  } else {
    console.log("Admin already exists");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
