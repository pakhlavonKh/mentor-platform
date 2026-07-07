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
  downloadSubmissionFile,
} from "../controllers/submissionController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

// User uploads submission (files field name: files)
router.post("/", authenticate, upload.array("files", 5), createSubmission);
router.get("/files/:filename", authenticate, downloadSubmissionFile);
router.get("/", authenticate, getUserSubmissions);
router.get("/:id", authenticate, getSubmissionById);
// NOTE: Submissions are intentionally NOT exposed to Admin or Mentor panels per policy.

export default router;
