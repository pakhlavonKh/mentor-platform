import { Router } from "express";
import {
  getLearningContent,
  getLearningContentById,
  createLearningContent,
  updateLearningContent,
  deleteLearningContent,
} from "../controllers/learningController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";
import { uploadLearning } from "../middleware/upload.js";

const router = Router();

router.get("/", getLearningContent);
router.get("/:id", getLearningContentById);
router.post("/", authenticate, authorizeRole("admin", "mentor"), uploadLearning.single("file"), createLearningContent);
router.put("/:id", authenticate, authorizeRole("admin", "mentor"), updateLearningContent);
router.delete("/:id", authenticate, authorizeRole("admin", "mentor"), deleteLearningContent);

export default router;
