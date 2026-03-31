import express from "express";
import cors from "cors";

import { errorHandler } from "./src/middlewares/errorHandler.js";

import authRoutes from "./src/modules/auth/auth.routes.js";
import worldRoutes from "./src/modules/worlds/worlds.routes.js";
import invitationRoutes from "./src/modules/invitations/invitations.routes.js";
import worldMemberRoutes from "./src/modules/world members/worldMember.routes.js";
import campaignRoutes from "./src/modules/campaigns/campaign.routes.js";
import characterRoutes from "./src/modules/characters/characters.routes.js";
import diceRollRoutes from "./src/modules/diceRolls/diceRoll.routes.js";
import gameSessionRoutes from "./src/modules/gameSessions/gameSession.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

//#===== ROUTES =====#

app.use("/api/auth", authRoutes);
app.use("/api/worlds", worldRoutes);
app.use("/api", invitationRoutes);
app.use("/api/worlds", worldMemberRoutes);
app.use("/api/worlds", campaignRoutes);
app.use("/api", characterRoutes);
app.use("/api/worlds", diceRollRoutes);
app.use("/api", gameSessionRoutes); 

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

//#===== ERROR HANDLER (doit rester en dernier) =====#

app.use(errorHandler);
