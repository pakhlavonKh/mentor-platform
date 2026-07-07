import { Router } from "express";
import {
  getTelegramPosts,
  getTelegramPostById,
  createTelegramPost,
  updateTelegramPost,
  deleteTelegramPost,
  getTelegramConfig,
} from "../controllers/telegramController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getTelegramPosts);
router.get("/config", getTelegramConfig);
router.get("/:id", getTelegramPostById);
router.post("/", authenticate, authorizeRole("admin"), createTelegramPost);
router.put("/:id", authenticate, authorizeRole("admin"), updateTelegramPost);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteTelegramPost);

export default router;
