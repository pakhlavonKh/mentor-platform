import { Router } from "express";
import {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  listAllSubmissions,
  updateSubmissionStatus,
  addFeedback,
  assignReviewer,
  assignStudentSubmissions,
  claimSubmission,
  unclaimSubmission,
  getPoolSubmissions,
  getReviewerSubmissions,
  downloadSubmissionFile,
} from "../controllers/submissionController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

// Student submission creation and downloads
router.post("/", authenticate, upload.array("files", 5), createSubmission);
router.get("/files/:filename", authenticate, downloadSubmissionFile);
router.get("/", authenticate, getUserSubmissions);

// Mentor review pool & claimed reviews
router.get("/pool", authenticate, authorizeRole("admin", "mentor", "tutor"), getPoolSubmissions);
router.get("/reviewer/my", authenticate, authorizeRole("admin", "mentor", "tutor"), getReviewerSubmissions);
router.get("/all", authenticate, authorizeRole("admin"), listAllSubmissions);

// Claim and manage submissions
router.post("/:id/claim", authenticate, authorizeRole("admin", "mentor", "tutor"), claimSubmission);
router.post("/:id/unclaim", authenticate, authorizeRole("admin", "mentor", "tutor"), unclaimSubmission);
router.post("/:id/feedback", authenticate, authorizeRole("admin", "mentor", "tutor"), upload.array("feedbackFiles", 5), addFeedback);
router.put("/:id/status", authenticate, authorizeRole("admin", "mentor", "tutor"), updateSubmissionStatus);
router.put("/assign-student", authenticate, authorizeRole("admin"), assignStudentSubmissions);
router.put("/:id/assign", authenticate, authorizeRole("admin"), assignReviewer);

// Single submission details
router.get("/:id", authenticate, getSubmissionById);

export default router;

