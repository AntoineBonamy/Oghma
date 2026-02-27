import express from "express";
import cors from "cors";
import authRoutes from "./src/modules/auth/authRoutes.js";

export const app = express();

app.use(cors());
app.use(express.json());

//#===== ROUTES =====#

app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});