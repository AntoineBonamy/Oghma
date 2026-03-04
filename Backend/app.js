import express from "express";
import cors from "cors";
import authRoutes from "./src/modules/auth/auth.routes.js";
import worldRoutes from "./src/modules/worlds/worlds.routes.js";
import invitationRoutes from "./src/modules/invitations/invitations.routes.js";
import worldMemberRoutes from "./src/modules/world members/worldMember.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

//#===== ROUTES =====#

app.use("/api/auth", authRoutes);
app.use("/api/worlds", worldRoutes);
app.use("/api", invitationRoutes);
app.use("/api/worlds", worldMemberRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});