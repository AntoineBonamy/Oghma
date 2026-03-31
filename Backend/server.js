import http from "http";
import { app } from "./app.js";
import { initSocket } from "./src/lib/socket.js";

const PORT = process.env.PORT || 3001;

// On crée le serveur HTTP manuellement pour y attacher Socket.io
const httpServer = http.createServer(app);

//Initialisation de Socket.io sur le même serveur
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready`);
});