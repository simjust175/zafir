import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });
app.set("io", io);

const PORT = process.env.PORT || 8080;

// ----------- Middleware -----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ----------- Health Check -----------
app.get("/", (req, res) => res.send("✅ invoice-management backend is alive"));
app.get("/health/email-listeners", (req, res) => {
  try {
    const status = getEmailListenerStatus?.() || {};
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "Email listener status failed", details: err.message });
  }
});

// ----------- Safe Imports -----------
try {
  const invoiceRoutes = (await import("./Routers/invoiceRoutes.js")).default;
  app.use("/invoice", invoiceRoutes);
  console.log("✅ invoiceRoutes loaded");
} catch (err) {
  console.error("❌ Failed to load invoiceRoutes:", err);
}

try {
  const RegisterRoutes = (await import("./Login_system/Router/registerRoutes.js")).default;
  app.use("/register", RegisterRoutes);
  console.log("✅ registerRoutes loaded");
} catch (err) {
  console.error("❌ Failed to load registerRoutes:", err);
}

try {
  const emailRoutes = (await import("./Routers/emailRoutes.js")).default;
  app.use("/email", emailRoutes);
  console.log("✅ emailRoutes loaded");
} catch (err) {
  console.error("❌ Failed to load emailRoutes:", err);
}

try {
  app.use("/file/", express.static(path.join(__dirname, "email-service/downloads")));
  console.log("✅ Static file route set");
} catch (err) {
  console.error("❌ Failed to set static file route:", err);
}

let AmountServices;
try {
  AmountServices = (await import("./Services/amountService.js")).default;
  console.log("✅ amountService loaded");
} catch (err) {
  console.error("❌ Failed to load amountService:", err);
}

let startEmailListeners;
try {
  startEmailListeners = (await import("./email-service/imap/useEmailListners.js")).startEmailListeners;
  console.log("✅ Email listeners module loaded");
} catch (err) {
  console.error("❌ Failed to load email listener module:", err);
}


// ----------- Invoice Posting with Socket Emission -----------
const postInvoices = async (inv) => {
  try {
    console.log("📦 Posting invoice to DB:", inv);
    await AmountServices?.postService(inv);
    io.emit("new-invoice", inv);
  } catch (error) {
    console.error("❌ Error handling invoice:", error);
  }
};

// ----------- WebSocket Logging -----------
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❎ Socket disconnected:", socket.id);
  });
});

// ----------- Start Server -----------
server.listen(PORT, () => {
  console.log(`🔫 Invoice management running on port ${PORT}`);
  try {
    startEmailListeners?.(async (inv) => await postInvoices(inv));
  } catch (err) {
    console.error("❌ Failed to start email listeners:", err);
  }
});
