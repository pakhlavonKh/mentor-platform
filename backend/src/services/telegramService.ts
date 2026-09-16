import { Telegraf, Context } from "telegraf";
import bcrypt from "bcryptjs";
import { config } from "../config/env.js";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";
import { TelegramChat } from "../entities/TelegramChat.js";
import { Submission } from "../entities/Submission.js";
import { TelegramPost } from "../entities/TelegramPost.js";
import { Order } from "../entities/Order.js";

const botToken = config.telegram.botToken;

if (!botToken) {
  console.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot will be disabled in this environment.");
}

let botInstance: Telegraf | null = null;

/** Helper: Find authenticated user linked to Telegram ID */
export const getUserByTelegramId = async (telegramId: number | string): Promise<User | null> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.findOne({ where: { telegramId: String(telegramId), isActive: true } });
  } catch (e) {
    console.error("Error fetching user by telegramId:", e);
    return null;
  }
};

/** Helper: Notify all dynamically registered management groups */
export const notifyManagement = async (message: string, parseMode: "HTML" | "Markdown" = "HTML"): Promise<void> => {
  const bot = getBot();
  if (!bot) return;

  try {
    const chatRepo = AppDataSource.getRepository(TelegramChat);
    const managementChats = await chatRepo.find({ where: { purpose: "management", isActive: true } });

    for (const chat of managementChats) {
      try {
        await bot.telegram.sendMessage(chat.chatId, message, { parse_mode: parseMode });
      } catch (err) {
        console.error(`Failed to send telegram notification to management chat ${chat.chatId}:`, err);
      }
    }
  } catch (err) {
    console.error("Error dispatching management notification:", err);
  }
};

/** Helper: Notify a specific user directly via Telegram DM */
export const notifyUser = async (telegramId: string, message: string, parseMode: "HTML" | "Markdown" = "HTML"): Promise<boolean> => {
  const bot = getBot();
  if (!bot || !telegramId) return false;

  try {
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: parseMode });
    return true;
  } catch (err) {
    console.error(`Failed to send direct notification to telegram user ${telegramId}:`, err);
    return false;
  }
};

/** Helper: Publish message/photo to registered or configured public channel */
export const publishToChannel = async (text: string, photoUrl?: string): Promise<boolean> => {
  const bot = getBot();
  if (!bot) return false;

  try {
    const chatRepo = AppDataSource.getRepository(TelegramChat);
    const channelChat = await chatRepo.findOne({ where: { purpose: "channel", isActive: true } });
    const targetChat = channelChat?.chatId || config.telegram.channelUsername || config.telegram.channelUrl;

    if (!targetChat) {
      console.warn("No public channel configured or registered for broadcasting.");
      return false;
    }

    if (photoUrl) {
      await bot.telegram.sendPhoto(targetChat, photoUrl, { caption: text, parse_mode: "HTML" });
    } else {
      await bot.telegram.sendMessage(targetChat, text, { parse_mode: "HTML" });
    }
    return true;
  } catch (err) {
    console.error("Error publishing to Telegram channel:", err);
    return false;
  }
};

/** Helper: Get real bot username dynamically */
export const getBotUsername = async (): Promise<string> => {
  const bot = getBot();
  if (bot) {
    try {
      const me = await bot.telegram.getMe();
      if (me?.username) return me.username;
    } catch (_) {}
  }
  return (config.telegram.botUsername || "studyqadam_bot").replace(/^@/, "");
};

/** Get or initialize the Telegram Bot singleton */
export const getBot = (): Telegraf | null => {
  if (botInstance) return botInstance;
  if (!botToken) return null;

  const bot = new Telegraf(botToken);

  // ----------------------------------------------------
  // CHANNEL & GROUP MEMBERSHIP TRACKING (DYNAMIC ROLES)
  // ----------------------------------------------------
  bot.on("my_chat_member", async (ctx) => {
    try {
      const chat = ctx.chat;
      const status = ctx.myChatMember.new_chat_member.status;
      const chatRepo = AppDataSource.getRepository(TelegramChat);

      if (status === "administrator" || status === "member") {
        // SECURITY GUARD: Only verified platform Admins can add the bot to groups/channels
        const addedBy = ctx.myChatMember.from;
        const adminUser = await getUserByTelegramId(addedBy.id);

        if (!adminUser || adminUser.role !== "admin") {
          console.warn(`[Bot Security] Unauthorized addition to ${chat.type} (${chat.id}) by user ${addedBy.id} (@${addedBy.username || "unknown"})`);
          try {
            await ctx.reply(
              `⛔ <b>Private Corporate Bot</b>\n\n` +
              `This bot is restricted to authorized StudyQadam platform operations.\n` +
              `Only verified platform administrators can add this bot to groups or channels.\n\n` +
              `<i>Leaving chat now...</i>`,
              { parse_mode: "HTML" }
            );
            await ctx.leaveChat();
          } catch (_) {}
          return;
        }

        let record = await chatRepo.findOne({ where: { chatId: String(chat.id) } });
        const purpose = chat.type === "channel" ? "channel" : "management";

        if (!record) {
          record = chatRepo.create({
            chatId: String(chat.id),
            chatType: chat.type as any,
            title: (chat as any).title || "Telegram Chat",
            purpose,
            isActive: true,
            registeredByUserId: adminUser.id,
          });
        } else {
          record.isActive = true;
          record.purpose = purpose;
          record.title = (chat as any).title || record.title;
          record.registeredByUserId = adminUser.id;
        }
        await chatRepo.save(record);
        console.log(`✓ Telegram bot registered in ${chat.type}: "${(chat as any).title || chat.id}" (Purpose: ${purpose})`);
      } else if (status === "kicked" || status === "left") {
        await chatRepo.update({ chatId: String(chat.id) }, { isActive: false });
        console.log(`Telegram bot removed from ${chat.type}: "${(chat as any).title || chat.id}"`);
      }
    } catch (e) {
      console.error("Error handling my_chat_member event:", e);
    }
  });

  // ----------------------------------------------------
  // /start COMMAND (WITH DEEP-LINKING SUPPORT)
  // ----------------------------------------------------
  bot.command("start", async (ctx) => {
    const chatType = ctx.chat.type as string;

    // In public channel: Bot does not respond to user chat commands
    if (chatType === "channel") return;

    // In management group / supergroup
    if (chatType === "group" || chatType === "supergroup") {
      return ctx.reply(
        `👋 <b>StudyQadam Management Bot</b>\n\n` +
        `This bot operates in <b>Team Management Mode</b> for this group.\n\n` +
        `• Admins can type <code>/register_management</code> to enable real-time alerts (new submissions, orders) here.\n` +
        `• Authorized team members can check <code>/stats</code> or <code>/submissions</code>.\n\n` +
        `🔒 <i>To log in with your platform credentials or mentor link, message this bot privately!</i>`,
        { parse_mode: "HTML" }
      );
    }

    // In private 1-on-1 chat
    const tgUser = ctx.from;
    if (!tgUser) return;

    const messageText = ctx.message && "text" in ctx.message ? ctx.message.text : "";
    const parts = messageText.trim().split(/\s+/);
    const startPayload = parts.length > 1 ? parts[1] : "";

    // Check mentor onboarding deep link: /start link_m_...
    if (startPayload.startsWith("link_")) {
      const token = startPayload.replace(/^link_/, "").trim();
      const userRepo = AppDataSource.getRepository(User);
      const mentor = await userRepo.findOne({ where: { telegramLinkToken: token, isActive: true } });

      if (mentor) {
        mentor.telegramId = String(tgUser.id);
        mentor.telegramLinkToken = null; // consume one-time token
        await userRepo.save(mentor);

        // Notify management group
        notifyManagement(
          `👨‍🏫 <b>Mentor Connected via Onboarding Link!</b>\n\n` +
          `• <b>Mentor:</b> ${mentor.firstName} ${mentor.lastName}\n` +
          `• <b>Email:</b> ${mentor.email}\n` +
          `• <b>Telegram:</b> @${tgUser.username || "user"} (ID: <code>${tgUser.id}</code>)\n\n` +
          `<i>Mentor is now linked and will receive assignment notifications directly.</i>`
        ).catch(() => {});

        return ctx.reply(
          `🎉 <b>Welcome to StudyQadam, ${mentor.firstName}!</b>\n\n` +
          `Your Telegram account has been successfully linked as an official <b>${mentor.role === "tutor" ? "Mentor / Reviewer" : mentor.role.toUpperCase()}</b>.\n\n` +
          `✅ <b>Real-Time Assignment Alerts:</b>\n` +
          `Whenever a student submission or review task is assigned to you, you will receive an instant notification here with full document details.\n\n` +
          `<b>Available Commands:</b>\n` +
          `• <code>/submissions</code> - View your active review queue\n` +
          `• <code>/stats</code> - View platform statistics\n` +
          `• <code>/whoami</code> - View your linked profile\n` +
          `• <code>/logout</code> - Unlink this account\n\n` +
          `Thank you for helping students achieve their global study dreams! 🚀`,
          { parse_mode: "HTML" }
        );
      } else {
        return ctx.reply(
          `⚠️ <b>Invalid or Expired Onboarding Link</b>\n\n` +
          `This mentor onboarding link is invalid or has already been used.\n` +
          `Please contact your platform administrator for a new invite link.`,
          { parse_mode: "HTML" }
        );
      }
    }

    const user = await getUserByTelegramId(tgUser.id);

    if (user) {
      return ctx.reply(
        `👋 Welcome back, <b>${user.firstName} ${user.lastName}</b>!\n` +
        `Role: <b>${user.role.toUpperCase()}</b>\n\n` +
        `<b>Available Commands:</b>\n` +
        (user.role === "admin"
          ? `• <code>/stats</code> - View platform metrics\n• <code>/submissions</code> - Review recent submissions\n• <code>/broadcast &lt;msg&gt;</code> - Post to public channel\n• <code>/chats</code> - List registered management groups\n`
          : user.role === "tutor"
          ? `• <code>/submissions</code> - View pending reviews\n• <code>/stats</code> - Platform summary\n`
          : `• <code>/mysubmissions</code> - View your document status\n`) +
        `• <code>/whoami</code> - Your profile info\n` +
        `• <code>/logout</code> - Unlink your account`,
        { parse_mode: "HTML" }
      );
    }

    return ctx.reply(
      `👋 <b>Welcome to StudyQadam!</b>\n\n` +
      `To access management tools and view your status dynamically, log in with your StudyQadam account credentials:\n\n` +
      `👉 <code>/login &lt;email&gt; &lt;password&gt;</code>\n\n` +
      `<i>Your permissions (Admin, Tutor, Student) will be applied automatically upon login.</i>`,
      { parse_mode: "HTML" }
    );
  });

  // ----------------------------------------------------
  // /login <email> <password> (DYNAMIC CREDENTIAL AUTH)
  // ----------------------------------------------------
  bot.command("login", async (ctx) => {
    const chatType = ctx.chat.type;

    // Prevent credentials leak in public or group chats
    if (chatType !== "private") {
      try {
        await ctx.deleteMessage();
      } catch (_) {}
      return ctx.reply(
        `⚠️ <b>Security Warning:</b> Never type your password in a group or channel!\n` +
        `Please open a private direct message with me to log in securely.`,
        { parse_mode: "HTML" }
      );
    }

    const messageText = ctx.message && "text" in ctx.message ? ctx.message.text : "";
    const parts = messageText.trim().split(/\s+/);

    if (parts.length < 3) {
      return ctx.reply(
        `❌ <b>Usage:</b>\n<code>/login &lt;email&gt; &lt;password&gt;</code>\n\n` +
        `Example:\n<code>/login admin@studyqadam.com secret123</code>`,
        { parse_mode: "HTML" }
      );
    }

    const email = parts[1];
    const password = parts.slice(2).join(" ");
    const tgUser = ctx.from;

    if (!tgUser) return;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository
        .createQueryBuilder("user")
        .addSelect("user.password")
        .where("LOWER(user.email) = LOWER(:email)", { email: email.trim() })
        .getOne();

      if (!user) {
        return ctx.reply("❌ Invalid credentials: user not found.");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return ctx.reply("❌ Invalid credentials: password incorrect.");
      }

      // Link Telegram account
      user.telegramId = String(tgUser.id);
      await userRepository.save(user);

      return ctx.reply(
        `✅ <b>Authentication Successful!</b>\n\n` +
        `Logged in as: <b>${user.firstName} ${user.lastName}</b>\n` +
        `Email: <code>${user.email}</code>\n` +
        `Role: <b>${user.role.toUpperCase()}</b>\n\n` +
        `You now have dynamic access to management features across private and group chats.\n` +
        `Type <code>/help</code> or <code>/start</code> to view commands.`,
        { parse_mode: "HTML" }
      );
    } catch (err) {
      console.error("Login error in telegram bot:", err);
      return ctx.reply("❌ An error occurred while authenticating. Please try again.");
    }
  });

  // ----------------------------------------------------
  // /logout COMMAND
  // ----------------------------------------------------
  bot.command("logout", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    try {
      const user = await getUserByTelegramId(tgUser.id);
      if (!user) {
        return ctx.reply("You are not currently logged in.");
      }

      const userRepository = AppDataSource.getRepository(User);
      user.telegramId = null;
      await userRepository.save(user);

      return ctx.reply("✅ You have been successfully logged out and unlinked.");
    } catch (e) {
      console.error("Logout error:", e);
      return ctx.reply("Error logging out.");
    }
  });

  // ----------------------------------------------------
  // /whoami or /status COMMAND
  // ----------------------------------------------------
  bot.command(["whoami", "status"], async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await getUserByTelegramId(tgUser.id);
    if (!user) {
      return ctx.reply(
        `ℹ️ <b>Account Status:</b> Not Authenticated\n` +
        `Your Telegram ID: <code>${tgUser.id}</code>\n\n` +
        `To link your account, use: <code>/login &lt;email&gt; &lt;password&gt;</code>`,
        { parse_mode: "HTML" }
      );
    }

    return ctx.reply(
      `👤 <b>User Profile:</b>\n` +
      `• Name: <b>${user.firstName} ${user.lastName}</b>\n` +
      `• Email: <code>${user.email}</code>\n` +
      `• Role: <b>${user.role.toUpperCase()}</b>\n` +
      `• Telegram ID: <code>${user.telegramId}</code>`,
      { parse_mode: "HTML" }
    );
  });

  // ----------------------------------------------------
  // /register_management COMMAND (FOR GROUPS)
  // ----------------------------------------------------
  bot.command(["register_management", "set_management"], async (ctx) => {
    const chat = ctx.chat;
    const chatType = chat.type as string;
    if (chatType === "private" || chatType === "channel") {
      return ctx.reply("This command can only be used inside a Telegram group or supergroup.");
    }

    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await getUserByTelegramId(tgUser.id);
    if (!user || user.role !== "admin") {
      return ctx.reply("⛔ <b>Forbidden:</b> Only authenticated platform Admins can register a management group.", {
        parse_mode: "HTML",
      });
    }

    try {
      const chatRepo = AppDataSource.getRepository(TelegramChat);
      let record = await chatRepo.findOne({ where: { chatId: String(chat.id) } });

      if (!record) {
        record = chatRepo.create({
          chatId: String(chat.id),
          chatType: chat.type as any,
          title: (chat as any).title || "Management Group",
          purpose: "management",
          isActive: true,
          registeredByUserId: user.id,
        });
      } else {
        record.purpose = "management";
        record.isActive = true;
        record.title = (chat as any).title || record.title;
        record.registeredByUserId = user.id;
      }

      await chatRepo.save(record);

      return ctx.reply(
        `✅ <b>Management Group Registered!</b>\n\n` +
        `This group (<b>${(chat as any).title || chat.id}</b>) is now dynamically registered for StudyQadam management alerts.\n` +
        `Real-time submission alerts, order updates, and notifications will be sent here.`,
        { parse_mode: "HTML" }
      );
    } catch (e) {
      console.error("Error registering management group:", e);
      return ctx.reply("Failed to register management group.");
    }
  });

  // ----------------------------------------------------
  // /unregister_management COMMAND
  // ----------------------------------------------------
  bot.command("unregister_management", async (ctx) => {
    const chat = ctx.chat;
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await getUserByTelegramId(tgUser.id);
    if (!user || user.role !== "admin") {
      return ctx.reply("⛔ Forbidden: Admin only.");
    }

    try {
      const chatRepo = AppDataSource.getRepository(TelegramChat);
      await chatRepo.update({ chatId: String(chat.id) }, { isActive: false });
      return ctx.reply("✓ This group has been unlinked from management alerts.");
    } catch (e) {
      return ctx.reply("Error unregistering group.");
    }
  });

  // ----------------------------------------------------
  // /chats COMMAND (Admin list of registered chats)
  // ----------------------------------------------------
  bot.command("chats", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await getUserByTelegramId(tgUser.id);
    if (!user || user.role !== "admin") {
      return ctx.reply("⛔ Admin only.");
    }

    try {
      const chatRepo = AppDataSource.getRepository(TelegramChat);
      const chats = await chatRepo.find();

      if (!chats.length) {
        return ctx.reply("No registered telegram chats or channels found.");
      }

      let text = `📋 <b>Registered Telegram Chats:</b>\n\n`;
      chats.forEach((c) => {
        text += `• <b>${c.title || c.chatId}</b> (${c.chatType})\n  Purpose: <code>${c.purpose}</code> | Active: ${c.isActive ? "🟢" : "🔴"}\n  ID: <code>${c.chatId}</code>\n\n`;
      });

      return ctx.reply(text, { parse_mode: "HTML" });
    } catch (e) {
      return ctx.reply("Error querying chats.");
    }
  });

  // ----------------------------------------------------
  // /stats COMMAND (DYNAMIC METRICS)
  // ----------------------------------------------------
  bot.command("stats", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await getUserByTelegramId(tgUser.id);
    if (!user || (user.role !== "admin" && user.role !== "tutor")) {
      return ctx.reply("⛔ Forbidden: You must be an authenticated Admin or Tutor to view platform metrics.");
    }

    try {
      const userRepo = AppDataSource.getRepository(User);
      const subRepo = AppDataSource.getRepository(Submission);
      const postRepo = AppDataSource.getRepository(TelegramPost);
      const orderRepo = AppDataSource.getRepository(Order);

      const totalUsers = await userRepo.count();
      const students = await userRepo.count({ where: { role: "student" } });
      const tutors = await userRepo.count({ where: { role: "tutor" } });
      const admins = await userRepo.count({ where: { role: "admin" } });

      const totalSubmissions = await subRepo.count();
      const pendingSubmissions = await subRepo.count({ where: { status: "pending" } });
      const completedSubmissions = await subRepo.count({ where: { status: "completed" } });

      const totalPosts = await postRepo.count();
      const totalOrders = await orderRepo.count();

      const msg =
        `📊 <b>StudyQadam Platform Statistics</b>\n\n` +
        `👥 <b>Users (${totalUsers} total):</b>\n` +
        `  • Students: ${students}\n` +
        `  • Tutors: ${tutors}\n` +
        `  • Admins: ${admins}\n\n` +
        `📝 <b>Submissions (${totalSubmissions} total):</b>\n` +
        `  • ⏳ Pending Review: ${pendingSubmissions}\n` +
        `  • ✅ Completed: ${completedSubmissions}\n\n` +
        `📦 <b>Orders:</b> ${totalOrders}\n` +
        `📢 <b>Telegram Posts:</b> ${totalPosts}\n` +
        `🕒 <i>Updated: ${new Date().toLocaleTimeString()}</i>`;

      return ctx.reply(msg, { parse_mode: "HTML" });
    } catch (e) {
      console.error("Stats error:", e);
      return ctx.reply("Error calculating statistics.");
    }
  });

  // ----------------------------------------------------
  // /submissions COMMAND (RECENT / PENDING SUBMISSIONS)
  // ----------------------------------------------------
  bot.command("submissions", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await getUserByTelegramId(tgUser.id);
    if (!user) {
      return ctx.reply("⛔ Please log in first with <code>/login &lt;email&gt; &lt;password&gt;</code> in private chat.", {
        parse_mode: "HTML",
      });
    }

    try {
      const subRepo = AppDataSource.getRepository(Submission);

      let query = subRepo.createQueryBuilder("sub").orderBy("sub.createdAt", "DESC").take(5);

      if (user.role === "tutor") {
        query = query.where("sub.status = :status", { status: "pending" });
      } else if (user.role === "student") {
        query = query.where("sub.userId = :userId", { userId: user.id });
      }

      const submissions = await query.getMany();

      if (!submissions.length) {
        return ctx.reply("No submissions found.");
      }

      let text = `📝 <b>Recent Submissions:</b>\n\n`;
      submissions.forEach((s) => {
        text += `• <b>${s.documentType || "Document"}</b> (${s.targetUniversity || "General"})\n  Status: <code>${s.status}</code> | Date: ${new Date(s.createdAt).toLocaleDateString()}\n\n`;
      });

      return ctx.reply(text, { parse_mode: "HTML" });
    } catch (e) {
      return ctx.reply("Error fetching submissions.");
    }
  });

  // ----------------------------------------------------
  // /broadcast <message> COMMAND (ADMIN -> PUBLIC CHANNEL)
  // ----------------------------------------------------
  bot.command("broadcast", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await getUserByTelegramId(tgUser.id);
    if (!user || user.role !== "admin") {
      return ctx.reply("⛔ Forbidden: Only platform Admins can broadcast messages.");
    }

    const messageText = ctx.message && "text" in ctx.message ? ctx.message.text : "";
    const content = messageText.replace(/^\/broadcast\s*/i, "").trim();

    if (!content) {
      return ctx.reply("Usage: <code>/broadcast &lt;message text to publish to channel&gt;</code>", {
        parse_mode: "HTML",
      });
    }

    const published = await publishToChannel(content);
    if (published) {
      return ctx.reply("📣 <b>Broadcast dispatched successfully to public channel!</b>", { parse_mode: "HTML" });
    } else {
      return ctx.reply("⚠️ Failed to publish. Check if bot is added as administrator to the channel.");
    }
  });

  // ----------------------------------------------------
  // /health COMMAND
  // ----------------------------------------------------
  bot.command("health", async (ctx) => {
    await ctx.reply("✓ StudyQadam Telegram Bot is operational.");
  });

  botInstance = bot;
  return botInstance;
};

export const createBot = (): Telegraf | null => {
  return getBot();
};
