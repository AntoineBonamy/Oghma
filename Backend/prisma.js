require("dotenv").config();
import { PrismaClient } from "@prisma/client";

console.log("DATABASE_URL =", process.env.DATABASE_URL);

export const prisma = new PrismaClient();

module.exports = prisma;