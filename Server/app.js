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
app.get("/", (_, res) => res.send("✅ invoice-management backend is alive"));

app.get("/health/email-listeners", (_, res) => {
  try {
    res.json({
      status: "mocked",
      listenersActive: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Email listener status failed", details: err.message });
  }
});

// ----------- Dynamic Route Loader -----------
const loadRoute = async (path, mount) => {
  try {
    const route = (await import(path)).default;
    app.use(mount, route);
    console.log(`✅ ${mount} route loaded`);
  } catch (err) {
    console.error(`❌ Failed to load ${mount} route:`, err);
  }
};

await loadRoute("./Routers/invoiceRoutes.js", "/invoice");
await loadRoute("./Login_system/Router/registerRoutes.js", "/register");
await loadRoute("./Routers/emailRoutes.js", "/email");

// ----------- Static Files -----------
try {
  app.use("/file", express.static(path.join(__dirname, "email-service/downloads")));
  console.log("✅ Static file route set");
} catch (err) {
  console.error("❌ Failed to set static file route:", err);
}

// ----------- Services & Listeners -----------
let AmountServices, startEmailListeners;

try {
  AmountServices = (await import("./Services/amountService.js")).default;
  console.log("✅ amountService loaded");
} catch (err) {
  console.error("❌ Failed to load amountService:", err);
}

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

// ----------- Server Start -----------
server.listen(PORT, () => {
  (async () => {
    try {
      await startEmailListeners?.(postInvoices);
    } catch (err) {
      console.error("❌ Failed to start email listeners:", err);
    }
  })();
});