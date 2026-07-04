import "dotenv/config";
import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { AppDataSource } from "./config/database.js";
import { config } from "./config/env.js";
import grantsRouter from "./routes/grants.js";
import learningRouter from "./routes/learning.js";
import telegramRouter from "./routes/telegram.js";
import pricingRouter from "./routes/pricing.js";
import authRouter from "./routes/auth.js";
import submissionsRouter from "./routes/submissions.js";
import adminUsersRouter from "./routes/adminUsers.js";
import ordersRouter from "./routes/orders.js";
import calendarRouter from "./routes/calendar.js";
import path from "path";

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: config.jsonLimit }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/grants", grantsRouter);
app.use("/api/learning", learningRouter);
app.use("/api/telegram", telegramRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRouter);

// Public learning assets only — submission files require authentication via /api/submissions/files/:filename
app.use("/uploads/learning", express.static(path.join(process.cwd(), "uploads/learning")));

app.use("/api/submissions", submissionsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin/users", adminUsersRouter);

// Error handling middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✓ Database connected successfully");

    app.listen(config.port, () => {
      console.log(`✓ Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("✗ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
