import { Router } from "express";
import {
  getTelegramPosts,
  getTelegramPostById,
  createTelegramPost,
  updateTelegramPost,
  deleteTelegramPost,
} from "../controllers/telegramController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getTelegramPosts);
router.get("/:id", getTelegramPostById);
router.post("/", authenticate, authorizeRole("admin", "mentor"), createTelegramPost);
router.put("/:id", authenticate, authorizeRole("admin", "mentor"), updateTelegramPost);
router.delete("/:id", authenticate, authorizeRole("admin", "mentor"), deleteTelegramPost);

export default router;
