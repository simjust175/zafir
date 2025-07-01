// ----------- Imports -----------
import express from "express";
import http from "http"; // <-- For creating server
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import invoiceRoutes from "./Routers/invoiceRoutes.js";
import RegisterRoutes from "./Login_system/Router/registerRoutes.js";
import AmountServices from "./Services/amountService.js";
import startListening from "./email-service/imap.js";

dotenv.config();

// ----------- Server Setup -----------
const app = express();
const server = http.createServer(app); // 👈 Replace app.listen later

const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});
app.set("io", io); // Optional: make io available in routes/middleware

// ----------- Middleware -----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ----------- Routes -----------
app.use("/invoice", invoiceRoutes);
app.use("/register", RegisterRoutes);

// ----------- Invoice Posting with Socket Emission -----------
const postInvoices = async (inv) => {
  try {
    console.log("📦 Posting invoice to DB:", inv);
    await AmountServices.postService(inv);

    // 🔊 Push invoice to connected clients
    io.emit("new-invoice", inv);
  } catch (error) {
    console.error("❌ Error handling invoice:", error);
  }
};

// ----------- Start IMAP Email Listener -----------
startListening(postInvoices);

// ----------- WebSocket Logging -----------
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❎ Socket disconnected:", socket.id);
  });
});

// ----------- Start Server -----------
const port = process.env.PORT || 1221;
server.listen(port, () => {
  console.log("🚀 Zafir management running on port", port);
});
