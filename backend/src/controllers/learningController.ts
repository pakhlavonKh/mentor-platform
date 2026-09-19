import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { LearningContent } from "../entities/LearningContent.js";
import { User } from "../entities/User.js";
import { AuthRequest } from "../middleware/auth.js";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

const learningRepository = AppDataSource.getRepository(LearningContent);
const userRepository = AppDataSource.getRepository(User);

export const getLearningContent = async (req: Request, res: Response) => {
  try {
    const { type, topic, page = 1, limit = 10 } = req.query;
    let query = learningRepository.createQueryBuilder("content");

    if (type) {
      query = query.where("content.type = :type", { type });
    }
    if (topic) {
      query = query.where("content.topic ILIKE :topic", { topic: `%${topic}%` });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [content, total] = await query
      .orderBy("content.createdAt", "ASC")
      .skip(skip)
      .take(Number(limit))
      .getManyAndCount();

    res.json({
      data: content,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching learning content", error: errorMessage(error) });
  }
};

export const getLearningContentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await learningRepository.findOne({ where: { id } });

    if (!content) {
      return res.status(404).json({ message: "Learning content not found" });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Error fetching learning content", error: errorMessage(error) });
  }
};

export const createLearningContent = async (req: Request, res: Response) => {
  try {
    const { title, type, topic, description, duration, thumbnailUrl } = req.body;
    const file = (req as Request & { file?: Express.Multer.File }).file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const fileUrl = `/uploads/learning/${file.filename}`;
    const mimeType = file.mimetype;

    const content = learningRepository.create({
      title,
      type,
      topic,
      description,
      duration,
      fileUrl,
      mimeType,
      thumbnailUrl: thumbnailUrl || null,
    });

    const result = await learningRepository.save(content);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error creating learning content", error: errorMessage(error) });
  }
};

export const updateLearningContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    await learningRepository.update(id, updateData);
    const content = await learningRepository.findOne({ where: { id } });

    res.json(content);
  } catch (error) {
    res.status(400).json({ message: "Error updating learning content", error: errorMessage(error) });
  }
};

export const deleteLearningContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await learningRepository.delete(id);
    res.json({ message: "Learning content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting learning content", error: errorMessage(error) });
  }
};

export const saveLearningTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const test = req.body.test !== undefined ? req.body.test : req.body;

    const content = await learningRepository.findOne({ where: { id } });
    if (!content) {
      return res.status(404).json({ message: "Learning content not found" });
    }

    content.test = test || null;
    const saved = await learningRepository.save(content);
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: "Error saving learning test", error: errorMessage(error) });
  }
};

export const deleteLearningTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await learningRepository.findOne({ where: { id } });
    if (!content) {
      return res.status(404).json({ message: "Learning content not found" });
    }

    content.test = null;
    const saved = await learningRepository.save(content);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error deleting learning test", error: errorMessage(error) });
  }
};

export const submitLearningTest = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    const { id } = req.params;
    const { answers } = req.body; // map of questionId -> chosenOptionIndex

    const content = await learningRepository.findOne({ where: { id } });
    if (!content) {
      return res.status(404).json({ message: "Learning content not found" });
    }

    if (!content.test || !content.test.questions || content.test.questions.length === 0) {
      return res.status(400).json({ message: "No test available for this learning content" });
    }

    const test = content.test;
    const totalQuestions = test.questions.length;
    let correctCount = 0;

    const results = test.questions.map((q) => {
      const chosen = answers ? answers[q.id] : undefined;
      const isCorrect = chosen === q.correctOptionIndex;
      if (isCorrect) correctCount += 1;
      return {
        id: q.id,
        question: q.question,
        chosenOption: chosen,
        correctOption: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation || "",
      };
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passingScore = test.passingScore || 70;
    const passed = score >= passingScore;

    // Record user progress if authenticated
    if (userId) {
      const user = await userRepository.findOne({ where: { id: userId } });
      if (user) {
        user.testResults = user.testResults || {};
        user.testResults[id] = {
          score,
          passed,
          completedAt: new Date().toISOString(),
        };

        if (passed) {
          const completedSet = new Set(user.completedLessons || []);
          completedSet.add(id);
          user.completedLessons = Array.from(completedSet);
        }

        await userRepository.save(user);
      }
    }

    res.json({
      score,
      passed,
      passingScore,
      totalQuestions,
      correctCount,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Error grading test", error: errorMessage(error) });
  }
};

export const markLessonComplete = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const completedSet = new Set(user.completedLessons || []);
    completedSet.add(id);
    user.completedLessons = Array.from(completedSet);
    await userRepository.save(user);

    res.json({ success: true, completedLessons: user.completedLessons });
  } catch (error) {
    res.status(500).json({ message: "Error completing lesson", error: errorMessage(error) });
  }
};

export const getUserLearningProgress = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      completedLessons: user.completedLessons || [],
      testResults: user.testResults || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user progress", error: errorMessage(error) });
  }
};
