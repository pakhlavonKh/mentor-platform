import "reflect-metadata";
import { DataSource } from "typeorm";
import { Grant } from "../entities/Grant.js";
import { LearningContent } from "../entities/LearningContent.js";
import { TelegramPost } from "../entities/TelegramPost.js";
import { PricingPlan } from "../entities/PricingPlan.js";
import { User } from "../entities/User.js";

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "yerkenaz",
  entities: [Grant, LearningContent, TelegramPost, PricingPlan, User],
  synchronize: !isProduction,
  logging: !isProduction,
  ssl: isProduction,
});
