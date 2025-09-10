// app.js
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

// ------------------- CORS Setup -------------------
const allowedOrigins = [
  "https://billio.me",      // production frontend
  "http://localhost:5173"   // dev frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight OPTIONS
app.options("*", cors());

// ------------------- Middlewares -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ------------------- Health Check -------------------
app.get("/", (req, res) => res.send("✅ invoice-management backend is alive"));

// ------------------- Socket.IO -------------------
const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins }
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❎ Socket disconnected:", socket.id);
  });
});

// ------------------- Safe Imports -------------------
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

// ------------------- Routes -------------------
try {
  const invoiceRoutes = (await import("./Routers/invoiceRoutes.js")).default;
  app.use("/invoice", invoiceRoutes);
  console.log("✅ invoiceRoutes loaded");
} catch (err) {
  console.error("❌ Failed to load invoiceRoutes:", err);
}

try {
  const registerRoutes = (await import("./Login_system/Router/registerRoutes.js")).default;
  app.use("/register", registerRoutes);
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

// ------------------- POST Invoices -------------------
const postInvoices = async (inv) => {
  try {
    console.log("📦 Posting invoice to DB:", inv);
    if (AmountServices) await AmountServices.postService(inv);
    io.emit("new-invoice", inv);
  } catch (err) {
    console.error("❌ Error posting invoice:", err);
  }
};

// ------------------- Server Start -------------------
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Start email listeners asynchronously so they don't block POST requests
  setImmediate(async () => {
    try {
      if (startEmailListeners) {
        await startEmailListeners(async (inv) => await postInvoices(inv));
        console.log("✅ Email listeners started");
      }
    } catch (err) {
      console.error("❌ Failed to start email listeners:", err);
    }
  });
});