import { Router } from "express";
import {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  listAllSubmissions,
  updateSubmissionStatus,
  addFeedback,
  assignReviewer,
  claimSubmission,
  unclaimSubmission,
  getReviewerSubmissions,
} from "../controllers/submissionController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

// User uploads submission (files field name: files)
router.post("/", authenticate, upload.array("files", 5), createSubmission);
router.get("/", authenticate, getUserSubmissions);
router.get("/:id", authenticate, getSubmissionById);

// Admin / reviewer endpoints
router.get("/all", authenticate, authorizeRole("admin", "tutor"), listAllSubmissions);
router.put("/:id/status", authenticate, authorizeRole("admin", "tutor"), updateSubmissionStatus);
router.post("/:id/feedback", authenticate, authorizeRole("admin", "tutor"), addFeedback);

// assign reviewer (admin)
router.post("/:id/assign", authenticate, authorizeRole("admin"), assignReviewer);

// claim/unclaim by reviewer
router.post("/:id/claim", authenticate, authorizeRole("tutor", "admin"), claimSubmission);
router.post("/:id/unclaim", authenticate, authorizeRole("tutor", "admin"), unclaimSubmission);
router.get("/reviewer/my", authenticate, authorizeRole("tutor", "admin"), getReviewerSubmissions);

export default router;
