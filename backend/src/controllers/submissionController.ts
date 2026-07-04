import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../config/database.js";
import { Submission } from "../entities/Submission.js";
import { User } from "../entities/User.js";
import { AuthRequest } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";
import { config } from "../config/env.js";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

const submissionRepository = AppDataSource.getRepository(Submission);
const userRepository = AppDataSource.getRepository(User);

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
  };
}

function sanitizeSubmissions(submissions: Submission[]) {
  return submissions.map(sanitizeSubmission);
}

async function canAccessSubmission(userId: string, submission: Submission): Promise<boolean> {
  if (submission.userId === userId) return true;
  if (submission.reviewerId === userId) return true;
  const user = await userRepository.findOne({ where: { id: userId } });
  return user?.role === "admin";
}

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const files = Array.isArray((req as { files?: Express.Multer.File[] }).files) ? (req as { files?: Express.Multer.File[] }).files! : [];

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

    const { learningContentId } = req.body;

    const submission = submissionRepository.create({
      userId,
      learningContentId: learningContentId || null,
      files: fileMeta,
      status: "pending",
    } as Partial<Submission>);

    const saved = await submissionRepository.save(submission);

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

    const { filename } = req.params;
    const submissions = await submissionRepository.find();
    const submission = submissions.find((s) =>
      (s.files || []).some((f) => f.filename === filename),
    );

    if (!submission) return res.status(404).json({ message: "File not found" });

    const allowed = await canAccessSubmission(userId, submission);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    const filePath = path.join(process.cwd(), config.upload.dir, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

    res.sendFile(filePath);
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

    const submission = await submissionRepository.findOne({ where: { id } });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (!(await canAccessSubmission(userId!, submission))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(sanitizeSubmission(submission));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching submission", error: errorMessage(error) });
  }
};

export const listAllSubmissions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let reviewerId: string | undefined;
    const rawReviewer = req.query.reviewerId;
    if (Array.isArray(rawReviewer)) reviewerId = rawReviewer[0];
    else if (typeof rawReviewer === "string") reviewerId = rawReviewer;

    const isUuid = (v?: string) => !!v && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

    const qb = submissionRepository.createQueryBuilder("submission");
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
    const updated = await submissionRepository.findOne({ where: { id } });
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
    const { feedback } = req.body;

    await submissionRepository.update(id, { feedback, status: "completed" } as Partial<Submission>);
    const updated = await submissionRepository.findOne({ where: { id } });
    try {
      if (updated?.user?.email) {
        await sendMail(updated.user.email, `Feedback for your submission`, `A reviewer has added feedback to your submission.`);
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

    if (!reviewerId) return res.status(400).json({ message: "reviewerId required" });

    await submissionRepository.update(id, { reviewerId, status: "in_review" } as Partial<Submission>);
    const updated = await submissionRepository.findOne({ where: { id } });
    res.json(updated ? sanitizeSubmission(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning reviewer", error: errorMessage(error) });
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
    const updated = await submissionRepository.findOne({ where: { id } });
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
    const updated = await submissionRepository.findOne({ where: { id } });
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
