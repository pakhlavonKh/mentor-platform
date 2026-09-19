import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { IsNull } from "typeorm";
import { AppDataSource } from "../config/database.js";
import { Submission } from "../entities/Submission.js";
import { User } from "../entities/User.js";
import { AuthRequest } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";
import { config } from "../config/env.js";
import { notifyManagement, notifyUser } from "../services/telegramService.js";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

const submissionRepository = AppDataSource.getRepository(Submission);
const userRepository = AppDataSource.getRepository(User);

type MulterUploadedFile = {
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  path: string;
};

type SubmissionFile = {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path?: string;
  url?: string;
};

function sanitizeFile(file: SubmissionFile) {
  const { path: _path, ...safe } = file;
  return {
    ...safe,
    url: safe.url || `/api/submissions/files/${safe.filename}`,
  };
}

function sanitizeSubmission(submission: Submission) {
  return {
    ...submission,
    files: (submission.files || []).map(sanitizeFile),
    feedbackFiles: (submission.feedbackFiles || []).map(sanitizeFile),
  };
}

function sanitizeSubmissions(submissions: Submission[]) {
  return submissions.map(sanitizeSubmission);
}

async function canAccessSubmission(userId: string, submission: Submission, role?: string): Promise<boolean> {
  if (submission.userId === userId) return true;
  if (submission.reviewerId === userId) return true;
  if (role === "admin" || role === "mentor" || role === "tutor") return true;
  return false;
}

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const files = Array.isArray((req as { files?: MulterUploadedFile[] }).files) ? (req as { files?: MulterUploadedFile[] }).files! : [];

    if (files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const fileMeta = files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
      path: f.path,
      url: `/api/submissions/files/${f.filename}`,
    }));

    const { learningContentId, documentType, targetUniversity, studentNotes } = req.body;

    const submission = submissionRepository.create({
      userId,
      learningContentId: learningContentId || null,
      documentType: documentType || "motivation_letter",
      targetUniversity: targetUniversity || null,
      studentNotes: studentNotes || null,
      files: fileMeta,
      status: "pending",
    } as Partial<Submission>);

    const saved = await submissionRepository.save(submission);

    // Dispatch dynamic notification to registered management chats
    notifyManagement(
      `📝 <b>New Submission Received!</b>\n\n` +
      `• <b>Type:</b> ${saved.documentType || "Document"}\n` +
      `• <b>Target:</b> ${saved.targetUniversity || "Not specified"}\n` +
      `• <b>Status:</b> ⏳ Pending Review\n` +
      `• <b>Time:</b> ${new Date().toLocaleString()}`
    ).catch((err) => console.error("Error dispatching submission telegram alert:", err));

    res.status(201).json(sanitizeSubmission(saved));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating submission", error: errorMessage(error) });
  }
};

export const downloadSubmissionFile = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const rawFilename = req.params.filename;
    const filename = path.basename(rawFilename);

    const uploadDir = path.resolve(process.cwd(), config.upload.dir);
    const filePath = path.resolve(uploadDir, filename);
    if (!filePath.startsWith(uploadDir)) {
      return res.status(403).json({ message: "Invalid file path" });
    }

    const submission = await submissionRepository
      .createQueryBuilder("submission")
      .leftJoinAndSelect("submission.user", "user")
      .leftJoinAndSelect("submission.reviewer", "reviewer")
      .where('submission."files"::text LIKE :filenamePattern OR submission."feedbackFiles"::text LIKE :filenamePattern', {
        filenamePattern: `%${filename}%`,
      })
      .getOne();

    if (!submission) return res.status(404).json({ message: "File not found" });

    const matchedFile =
      (submission.files || []).find((f) => f.filename === filename) ||
      (submission.feedbackFiles || []).find((f) => f.filename === filename);

    if (!matchedFile) return res.status(404).json({ message: "File not found" });

    const user = await userRepository.findOne({ where: { id: userId } });
    const allowed = await canAccessSubmission(userId, submission, user?.role);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    const resolvedPath = matchedFile.path && fs.existsSync(path.resolve(process.cwd(), matchedFile.path))
      ? path.resolve(process.cwd(), matchedFile.path)
      : filePath;

    if (!fs.existsSync(resolvedPath)) return res.status(404).json({ message: "File not found on disk" });

    const isPreview = req.query.preview === "true" || req.query.inline === "true";
    if (isPreview) {
      const ext = path.extname(matchedFile.originalName || filename).toLowerCase();
      let mimeType = matchedFile.mimeType;
      if (!mimeType || mimeType === "application/octet-stream") {
        if (ext === ".pdf") mimeType = "application/pdf";
        else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (ext === ".doc") mimeType = "application/msword";
        else if (ext === ".png") mimeType = "image/png";
        else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".txt") mimeType = "text/plain; charset=utf-8";
        else mimeType = "application/octet-stream";
      }

      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(matchedFile.originalName || filename)}"`
      );
      return res.sendFile(resolvedPath);
    }

    res.download(resolvedPath, matchedFile.originalName || filename);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error downloading file", error: errorMessage(error) });
  }
};

export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [submissions, total] = await submissionRepository.findAndCount({
      where: { userId },
      relations: ["reviewer"],
      order: { createdAt: "DESC" },
      skip,
      take: Number(limit),
    });

    res.json({ data: sanitizeSubmissions(submissions), pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching submissions", error: errorMessage(error) });
  }
};

export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    const submission = await submissionRepository.findOne({ where: { id }, relations: ["user", "reviewer"] });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!(await canAccessSubmission(userId!, submission, user?.role))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(sanitizeSubmission(submission));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching submission", error: errorMessage(error) });
  }
};

export const getPoolSubmissions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [submissions, total] = await submissionRepository.findAndCount({
      where: { reviewerId: IsNull(), status: "pending" },
      relations: ["user"],
      order: { createdAt: "ASC" },
      skip,
      take: Number(limit),
    });

    res.json({
      data: sanitizeSubmissions(submissions),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pool submissions", error: errorMessage(error) });
  }
};

export const listAllSubmissions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let reviewerId: string | undefined;
    const rawReviewer = req.query.reviewerId;
    if (Array.isArray(rawReviewer)) reviewerId = typeof rawReviewer[0] === "string" ? rawReviewer[0] : undefined;
    else if (typeof rawReviewer === "string") reviewerId = rawReviewer;

    const isUuid = (v?: string) => !!v && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

    const qb = submissionRepository.createQueryBuilder("submission")
      .leftJoinAndSelect("submission.user", "user")
      .leftJoinAndSelect("submission.reviewer", "reviewer");

    if (isUuid(reviewerId)) {
      qb.where("submission.reviewerId = :reviewerId", { reviewerId });
    }
    qb.orderBy("submission.createdAt", "DESC");

    const [submissions, total] = await qb.skip(skip).take(Number(limit)).getManyAndCount();

    res.json({ data: sanitizeSubmissions(submissions), pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching submissions", error: errorMessage(error) });
  }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "in_review", "completed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await submissionRepository.update(id, { status } as Partial<Submission>);
    const updated = await submissionRepository.findOne({ where: { id }, relations: ["user", "reviewer"] });
    try {
      if (updated?.user?.email) {
        await sendMail(updated.user.email, `Submission status updated: ${status}`, `Your submission status is now ${status}.`);
      }
    } catch (err) {
      console.error("Failed to send notification email", err);
    }
    res.json(updated ? sanitizeSubmission(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating status", error: errorMessage(error) });
  }
};

export const addFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback, status, rating } = req.body;

    const files = Array.isArray((req as { files?: MulterUploadedFile[] }).files) ? (req as { files?: MulterUploadedFile[] }).files! : [];

    const feedbackFilesMeta = files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
      path: f.path,
      url: `/api/submissions/files/${f.filename}`,
    }));

    const updatePayload: Partial<Submission> = {
      feedback: feedback || null,
      status: status === "rejected" ? "rejected" : "completed",
      reviewedAt: new Date(),
    };

    if (rating) {
      updatePayload.rating = parseInt(rating, 10);
    }

    if (feedbackFilesMeta.length > 0) {
      updatePayload.feedbackFiles = feedbackFilesMeta;
    }

    await submissionRepository.update(id, updatePayload as Partial<Submission>);
    const updated = await submissionRepository.findOne({ where: { id }, relations: ["user", "reviewer"] });

    try {
      if (updated?.user?.email) {
        await sendMail(updated.user.email, `Feedback Ready for Your Submission`, `Your mentor has completed the review on your document. Log in to StudyQadam to view your feedback.`);
      }
    } catch (err) {
      console.error("Failed to send feedback email", err);
    }

    res.json(updated ? sanitizeSubmission(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding feedback", error: errorMessage(error) });
  }
};

export const assignReviewer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewerId } = req.body;

    if (!reviewerId || reviewerId === "unassigned") {
      await submissionRepository.update(id, { reviewerId: null, status: "pending" } as any);
      const updated = await submissionRepository.findOne({ where: { id }, relations: ["user", "reviewer"] });
      return res.json(updated ? sanitizeSubmission(updated) : null);
    }

    await submissionRepository.update(id, { reviewerId, status: "in_review" } as Partial<Submission>);
    const updated = await submissionRepository.findOne({ where: { id }, relations: ["user", "reviewer"] });

    if (updated) {
      const studentName = updated.user ? `${updated.user.firstName} ${updated.user.lastName}` : "Student";
      const mentorName = updated.reviewer ? `${updated.reviewer.firstName} ${updated.reviewer.lastName}` : "Mentor";

      // 1. Notify mentor directly if Telegram account is linked
      if (updated.reviewer?.telegramId) {
        notifyUser(
          updated.reviewer.telegramId,
          `🔔 <b>New Task Assigned to You!</b>\n\n` +
          `• <b>Student:</b> ${studentName}\n` +
          `• <b>Document:</b> ${updated.documentType || "Submission"}\n` +
          `• <b>Target:</b> ${updated.targetUniversity || "General"}\n` +
          `• <b>Status:</b> ⏳ In Review\n\n` +
          `<i>Check your mentor portal:</i> <a href="${config.frontendUrl}/mentor">Open Mentor Dashboard</a>`
        ).catch(() => {});
      }

      // 2. Notify management group
      notifyManagement(
        `📋 <b>Submission Review Assigned</b>\n\n` +
        `• <b>Student:</b> ${studentName}\n` +
        `• <b>Document:</b> ${updated.documentType || "Submission"}\n` +
        `• <b>Assigned Mentor:</b> ${mentorName}\n` +
        `• <b>Time:</b> ${new Date().toLocaleTimeString()}`
      ).catch(() => {});
    }

    res.json(updated ? sanitizeSubmission(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning reviewer", error: errorMessage(error) });
  }
};

export const assignStudentSubmissions = async (req: Request, res: Response) => {
  try {
    const { studentId, reviewerId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId required" });

    const newReviewerId = (!reviewerId || reviewerId === "unassigned") ? null : reviewerId;
    const newStatus = newReviewerId ? "in_review" : "pending";

    await submissionRepository
      .createQueryBuilder()
      .update(Submission)
      .set({ reviewerId: newReviewerId, status: newStatus } as any)
      .where("userId = :studentId AND status IN (:...statuses)", {
        studentId,
        statuses: ["pending", "in_review"],
      })
      .execute();

    if (newReviewerId) {
      const reviewer = await userRepository.findOne({ where: { id: newReviewerId } });
      const student = await userRepository.findOne({ where: { id: studentId } });
      const studentName = student ? `${student.firstName} ${student.lastName}` : "Student";
      const mentorName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "Mentor";

      if (reviewer?.telegramId) {
        notifyUser(
          reviewer.telegramId,
          `🔔 <b>Student Submissions Assigned to You!</b>\n\n` +
          `• <b>Student:</b> ${studentName}\n` +
          `• <b>Action:</b> All active submissions assigned\n` +
          `<i>Check your mentor portal:</i> <a href="${config.frontendUrl}/mentor">Open Mentor Dashboard</a>`
        ).catch(() => {});
      }

      notifyManagement(
        `📋 <b>Student Assigned to Mentor</b>\n\n` +
        `• <b>Student:</b> ${studentName}\n` +
        `• <b>Assigned Mentor:</b> ${mentorName}\n` +
        `• <b>Time:</b> ${new Date().toLocaleTimeString()}`
      ).catch(() => {});
    }

    res.json({ message: "Student submissions updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning student submissions", error: errorMessage(error) });
  }
};

export const claimSubmission = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const submission = await submissionRepository.findOne({ where: { id } });
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (submission.reviewerId) return res.status(400).json({ message: "Already claimed" });

    await submissionRepository.update(id, { reviewerId: userId, status: "in_review" } as Partial<Submission>);
    const updated = await submissionRepository.findOne({ where: { id }, relations: ["user", "reviewer"] });

    if (updated) {
      const studentName = updated.user ? `${updated.user.firstName} ${updated.user.lastName}` : "Student";
      const mentorName = updated.reviewer ? `${updated.reviewer.firstName} ${updated.reviewer.lastName}` : "Mentor";

      // 1. Notify mentor directly
      if (updated.reviewer?.telegramId) {
        notifyUser(
          updated.reviewer.telegramId,
          `✅ <b>You Claimed a Submission!</b>\n\n` +
          `• <b>Student:</b> ${studentName}\n` +
          `• <b>Document:</b> ${updated.documentType || "Submission"}\n` +
          `• <b>Target:</b> ${updated.targetUniversity || "General"}\n\n` +
          `<i>Happy reviewing!</i>`
        ).catch(() => {});
      }

      // 2. Notify management group
      notifyManagement(
        `📌 <b>Submission Claimed by Mentor</b>\n\n` +
        `• <b>Student:</b> ${studentName}\n` +
        `• <b>Mentor:</b> ${mentorName}\n` +
        `• <b>Document:</b> ${updated.documentType || "Submission"}`
      ).catch(() => {});
    }

    res.json(updated ? sanitizeSubmission(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error claiming submission", error: errorMessage(error) });
  }
};

export const unclaimSubmission = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const submission = await submissionRepository.findOne({ where: { id } });
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (submission.reviewerId !== userId) return res.status(403).json({ message: "Not your claim" });

    await submissionRepository.update(id, { reviewerId: null, status: "pending" } as Partial<Submission>);
    const updated = await submissionRepository.findOne({ where: { id }, relations: ["user", "reviewer"] });
    res.json(updated ? sanitizeSubmission(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error unclaiming submission", error: errorMessage(error) });
  }
};

export const getReviewerSubmissions = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [submissions, total] = await submissionRepository.findAndCount({
      where: { reviewerId: userId },
      relations: ["user", "reviewer"],
      order: { createdAt: "DESC" },
      skip,
      take: Number(limit),
    });

    res.json({ data: sanitizeSubmissions(submissions), pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching reviewer submissions", error: errorMessage(error) });
  }
};

