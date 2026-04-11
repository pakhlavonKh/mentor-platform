import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { TelegramPost } from "../entities/TelegramPost.js";

const telegramRepository = AppDataSource.getRepository(TelegramPost);

export const getTelegramPosts = async (req: Request, res: Response) => {
  try {
    const { source, page = 1, limit = 10 } = req.query;
    let query = telegramRepository.createQueryBuilder("post").orderBy("post.date", "DESC");

    if (source) {
      query = query.where("post.source ILIKE :source", { source: `%${source}%` });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await query
      .skip(skip)
      .take(Number(limit))
      .getManyAndCount();

    res.json({
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching telegram posts", error });
  }
};

export const getTelegramPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await telegramRepository.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: "Telegram post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching telegram post", error });
  }
};

export const createTelegramPost = async (req: Request, res: Response) => {
  try {
    const { title, description, source, link, date } = req.body;

    const post = telegramRepository.create({
      title,
      description,
      source,
      link,
      date,
    });

    const result = await telegramRepository.save(post);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error creating telegram post", error });
  }
};

export const updateTelegramPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    await telegramRepository.update(id, updateData);
    const post = await telegramRepository.findOne({ where: { id } });

    res.json(post);
  } catch (error) {
    res.status(400).json({ message: "Error updating telegram post", error });
  }
};

export const deleteTelegramPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await telegramRepository.delete(id);
    res.json({ message: "Telegram post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting telegram post", error });
  }
};
