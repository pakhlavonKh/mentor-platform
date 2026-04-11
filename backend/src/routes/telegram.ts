import { Router } from "express";
import {
  getTelegramPosts,
  getTelegramPostById,
  createTelegramPost,
  updateTelegramPost,
  deleteTelegramPost,
} from "../controllers/telegramController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", getTelegramPosts);
router.get("/:id", getTelegramPostById);
router.post("/", authenticate, createTelegramPost);
router.put("/:id", authenticate, updateTelegramPost);
router.delete("/:id", authenticate, deleteTelegramPost);

export default router;
