import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Current users in PostgreSQL:", users);

  // Sync soujanyadasroy@gmail.com as ADMIN
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "soujanyadasroy@gmail.com" },
    update: {
      name: "Soujanya Das Roy",
      role: "ADMIN",
      passwordHash,
      department: "IT Support",
    },
    create: {
      name: "Soujanya Das Roy",
      email: "soujanyadasroy@gmail.com",
      passwordHash,
      role: "ADMIN",
      department: "IT Support",
      initials: "SR",
      avatarTone: "#0F1B33",
    },
  });

  console.log("Synced Soujanya as ADMIN in DB:", user);
}

main().finally(() => prisma.$disconnect());
