import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { LearningContent } from "../entities/LearningContent.js";

const learningRepository = AppDataSource.getRepository(LearningContent);

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
    res.status(500).json({ message: "Error fetching learning content", error });
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
    res.status(500).json({ message: "Error fetching learning content", error });
  }
};

export const createLearningContent = async (req: Request, res: Response) => {
  try {
    const { title, type, topic, description, duration } = req.body;

    const content = learningRepository.create({
      title,
      type,
      topic,
      description,
      duration,
    });

    const result = await learningRepository.save(content);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error creating learning content", error });
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
    res.status(400).json({ message: "Error updating learning content", error });
  }
};

export const deleteLearningContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await learningRepository.delete(id);
    res.json({ message: "Learning content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting learning content", error });
  }
};
