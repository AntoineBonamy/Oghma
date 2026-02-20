import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-test", async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({users: userCount});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})