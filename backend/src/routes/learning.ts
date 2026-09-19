import { Router } from "express";
import {
  getLearningContent,
  getLearningContentById,
  createLearningContent,
  updateLearningContent,
  deleteLearningContent,
  saveLearningTest,
  deleteLearningTest,
  submitLearningTest,
  markLessonComplete,
  getUserLearningProgress,
} from "../controllers/learningController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";
import { uploadLearning } from "../middleware/upload.js";

const router = Router();

// User progress route (must be before /:id)
router.get("/user/progress", authenticate, getUserLearningProgress);

// Public learning content
router.get("/", getLearningContent);
router.get("/:id", getLearningContentById);

// Admin & Mentor content management
router.post("/", authenticate, authorizeRole("admin", "mentor"), uploadLearning.single("file"), createLearningContent);
router.put("/:id", authenticate, authorizeRole("admin", "mentor"), updateLearningContent);
router.delete("/:id", authenticate, authorizeRole("admin", "mentor"), deleteLearningContent);

// Optional Assessment Test management (Admin/Mentor)
router.put("/:id/test", authenticate, authorizeRole("admin", "mentor"), saveLearningTest);
router.delete("/:id/test", authenticate, authorizeRole("admin", "mentor"), deleteLearningTest);

// Student Test Submission & Completion
router.post("/:id/test/submit", authenticate, submitLearningTest);
router.post("/:id/complete", authenticate, markLessonComplete);

export default router;
