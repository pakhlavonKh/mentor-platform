import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";

const userRepository = AppDataSource.getRepository(User);

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await userRepository.findAndCount({
      order: { createdAt: "DESC" },
      skip,
      take: Number(limit),
    });

    res.json({ data: users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user", error });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ["admin", "mentor", "student", "tutor"];
    if (!validRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    await userRepository.update(id, { role } as Partial<User>);
    const updated = await userRepository.findOne({ where: { id } });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userRepository.delete(id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};
