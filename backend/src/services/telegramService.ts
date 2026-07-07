import { Telegraf, Context } from "telegraf";
import { config } from "../config/env.js";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";

const botToken = config.telegram.botToken;

if (!botToken) {
  console.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot will be disabled in this environment.");
}

export const createBot = () => {
  if (!botToken) return null;

  const bot = new Telegraf(botToken);

  // Helper to verify admin by telegram id
  const isAdminTelegramUser = async (telegramId: number) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { telegramId: String(telegramId), role: "admin" } });
      return !!user;
    } catch (e) {
      console.error("Error checking admin telegram id", e);
      return false;
    }
  };

  // Basic /health command
  bot.command("health", async (ctx) => {
    await ctx.reply("Bot is running");
  });

  // Admin-only broadcast scaffold
  bot.command("broadcast", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const allowed = await isAdminTelegramUser(tgUser.id as number);
    if (!allowed) return ctx.reply("Forbidden: only platform admins can use this command.");

    const text = ctx.message?.text?.replace(/\/broadcast\s*/i, "") || "";
    // Placeholder: actual broadcast implementation depends on stored list
    await ctx.reply("Broadcast received. (Not implemented: sending to users)");
    console.log(`Admin ${tgUser.id} issued broadcast: ${text}`);
  });

  // Inline keyboard handler
  bot.on("callback_query", async (ctx) => {
    try {
      const data = ctx.callbackQuery?.data;
      await ctx.answerCbQuery("Received");
      console.log("Callback data:", data);
    } catch (e) {
      console.error("Callback handling error", e);
    }
  });

  return bot;
};
