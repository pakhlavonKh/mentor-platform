import "reflect-metadata";
import { DataSource } from "typeorm";
import { Grant } from "../entities/Grant.js";
import { LearningContent } from "../entities/LearningContent.js";
import { TelegramPost } from "../entities/TelegramPost.js";
import { PricingPlan } from "../entities/PricingPlan.js";
import { User } from "../entities/User.js";
import { Submission } from "../entities/Submission.js";
import { Order } from "../entities/Order.js";
import { CalendarEvent } from "../entities/CalendarEvent.js";
import { config } from "./env.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  entities: [Grant, LearningContent, TelegramPost, PricingPlan, User, Submission, Order, CalendarEvent],
  synchronize: !config.isProduction,
  logging: !config.isProduction,
  ssl: config.isProduction,
});
