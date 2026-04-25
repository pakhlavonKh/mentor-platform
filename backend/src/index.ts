import "dotenv/config";
import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { AppDataSource } from "./config/database.js";
import grantsRouter from "./routes/grants.js";
import learningRouter from "./routes/learning.js";
import telegramRouter from "./routes/telegram.js";
import pricingRouter from "./routes/pricing.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
// allow larger JSON bodies for profile image uploads (base64)
const jsonLimit = process.env.JSON_LIMIT || "5mb";
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

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

    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("✗ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
