import express from "express";
import cors from "cors";
import authRoutes from "./src/modules/auth/auth.routes.js";
import worldRoutes from "./src/modules/worlds/worlds.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

//#===== ROUTES =====#

app.use("/api/auth", authRoutes);
app.use("/api/worlds", worldRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});