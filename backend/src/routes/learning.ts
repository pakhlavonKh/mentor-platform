import { Router } from "express";
import {
  getLearningContent,
  getLearningContentById,
  createLearningContent,
  updateLearningContent,
  deleteLearningContent,
} from "../controllers/learningController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", getLearningContent);
router.get("/:id", getLearningContentById);
router.post("/", authenticate, createLearningContent);
router.put("/:id", authenticate, updateLearningContent);
router.delete("/:id", authenticate, deleteLearningContent);

export default router;
