import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import invoiceRoutes from "./Routers/invoiceRoutes.js";
import RegisterRoutes from "./Login_system/Router/registerRoutes.js";
import AmountServices from "./Services/amountService.js";
import startListeningForAll from "./email-service/imap/index.js";
import emailRoutes from "./Routers/emailRoutes.js"


dotenv.config();

// ----------- Server Setup -----------
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);

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
app.use("/file/", express.static(path.join(__dirname, "email-service/downloads")));
app.use("/register", RegisterRoutes);
app.use("/email", emailRoutes);

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
startListeningForAll(async(inv)=> await postInvoices(inv))


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
  console.log("🚀 Zafir management running on port - ", port);
});
