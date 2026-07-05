import express, { Express, Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { connectDB } from "./backend/db_store";
import { authenticate } from "./backend/middleware/authMiddleware";
import authRoutes from "./backend/routes/auth";
import erpRoutes from "./backend/routes/erp";
import aiRoutes from "./backend/routes/ai";

dotenv.config();

const app: Express = express();

// ========================================
// Middleware
// ========================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ========================================
// Health Check (no auth required)
// ========================================
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ========================================
// Authentication Routes (no auth required)
// ========================================
app.use("/api/auth", authRoutes);

// ========================================
// Protected Routes (auth required)
// ========================================
// Apply authenticate middleware to all routes below
app.use("/api/erp", authenticate);
app.use("/api/erp", erpRoutes);

app.use("/api/ai", authenticate);
app.use("/api/ai", aiRoutes);

// ========================================
// Vite / Static SPA Setup
// ========================================
async function startServer() {
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Initialize database
  await connectDB();

  // Development mode: use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback to SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "index.html"));
    });
  } else {
    // Production mode: serve static build
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Fallback to SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 CampusPilot AI Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export default app;
