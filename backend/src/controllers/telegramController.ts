import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { TelegramPost } from "../entities/TelegramPost.js";
import { config } from "../config/env.js";
import { createBot } from "../services/telegramService.js";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

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
    res.status(500).json({ message: "Error fetching telegram posts", error: errorMessage(error) });
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
    res.status(500).json({ message: "Error fetching telegram post", error: errorMessage(error) });
  }
};

export const createTelegramPost = async (req: Request, res: Response) => {
  try {
    const { title, description, source, link, date, publish } = req.body;

    const post = telegramRepository.create({
      title,
      description,
      source: source || config.telegram.channelUsername,
      link: link || config.telegram.channelUrl,
      date: date || new Date().toISOString().slice(0, 10),
    });

    const result = await telegramRepository.save(post);

    // Try to publish to Telegram channel if bot is configured and publish flag is true
    try {
      const bot = createBot();
      if (bot && (config.telegram.channelUsername || config.telegram.channelUrl)) {
        if (!publish) {
          // caller chose not to publish
        } else {
        const chatId = config.telegram.channelUsername || config.telegram.channelUrl;
        const text = `${title.en}\n\n${description.en}\n\n${link || ""}`;

        // detect first image link in description or link
        const imageRegex = /(https?:\\/\\/[^\s]+\.(?:jpg|jpeg|png|gif))/i;
        const imageMatch = (description.en || "").match(imageRegex) || (link || "").match(imageRegex);

          if (imageMatch) {
            await bot.telegram.sendPhoto(chatId as string, imageMatch[0], { caption: text, parse_mode: "HTML" });
          } else {
            await bot.telegram.sendMessage(chatId as string, text, { parse_mode: "HTML" });
          }
        }
      }
    } catch (e) {
      console.error("Error publishing to Telegram:", e);
    }
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error creating telegram post", error: errorMessage(error) });
  }
};

export const updateTelegramPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    await telegramRepository.update(id, updateData);
    const post = await telegramRepository.findOne({ where: { id } });

    // Optionally publish when update contains publish flag
    try {
      const { publish } = req.body;
      if (publish && post) {
        const bot = createBot();
        if (bot && (config.telegram.channelUsername || config.telegram.channelUrl)) {
          const chatId = config.telegram.channelUsername || config.telegram.channelUrl;
          const text = `${post.title.en}\n\n${post.description.en}\n\n${post.link || ""}`;
          const imageRegex = /(https?:\\/\\/[^\s]+\.(?:jpg|jpeg|png|gif))/i;
          const imageMatch = (post.description.en || "").match(imageRegex) || (post.link || "").match(imageRegex);
          if (imageMatch) await bot.telegram.sendPhoto(chatId as string, imageMatch[0], { caption: text, parse_mode: "HTML" });
          else await bot.telegram.sendMessage(chatId as string, text, { parse_mode: "HTML" });
        }
      }
    } catch (e) {
      console.error("Error publishing updated post to Telegram:", e);
    }

    res.json(post);
  } catch (error) {
    res.status(400).json({ message: "Error updating telegram post", error: errorMessage(error) });
  }
};

export const deleteTelegramPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await telegramRepository.delete(id);
    res.json({ message: "Telegram post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting telegram post", error: errorMessage(error) });
  }
};

export const getTelegramConfig = async (req: Request, res: Response) => {
  try {
    res.json({
      telegramPhone: config.telegram.phone,
      telegramChannelUrl: config.telegram.channelUrl,
      telegramChannelUsername: config.telegram.channelUsername,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching telegram config", error: errorMessage(error) });
  }
};
