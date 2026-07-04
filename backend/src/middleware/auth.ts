import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";
import { config } from "../config/env.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRole = (...allowedRoles: Array<string>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: req.userId } });

      if (!user) return res.status(401).json({ message: "User not found" });

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: "7d",
  });
};
