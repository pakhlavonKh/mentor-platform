import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";
import { sanitizeUser, sanitizeUsers } from "../utils/sanitizeUser.js";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

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

    res.json({ data: sanitizeUsers(users), pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users", error: errorMessage(error) });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user", error: errorMessage(error) });
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
    res.json(updated ? sanitizeUser(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error: errorMessage(error) });
  }
};

export const updateUserTelegramId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { telegramId } = req.body;
    await userRepository.update(id, { telegramId } as Partial<User>);
    const updated = await userRepository.findOne({ where: { id } });
    res.json(updated ? sanitizeUser(updated) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user telegramId", error: errorMessage(error) });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userRepository.delete(id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user", error: errorMessage(error) });
  }
};

// ---------- Mentor Management ----------
export const listMentors = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [mentors, total] = await userRepository.findAndCount({
      where: { role: "tutor" },
      order: { createdAt: "DESC" },
      skip,
      take: Number(limit),
    });

    res.json({ data: sanitizeUsers(mentors), pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching mentors", error: errorMessage(error) });
  }
};

export const createMentor = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: "tutor",
      isActive: true,
    });

    const savedMentor = await userRepository.save(mentor);
    const responseMentor = { ...savedMentor };
    delete (responseMentor as any).password;

    res.json({ message: "Mentor created successfully", mentor: responseMentor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating mentor", error: errorMessage(error) });
  }
};

export const deactivateMentor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mentor = await userRepository.findOne({ where: { id, role: "tutor" } });
    
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    await userRepository.update(id, { isActive: false });
    const updated = await userRepository.findOne({ where: { id } });
    res.json({ message: "Mentor deactivated", mentor: updated ? sanitizeUser(updated) : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deactivating mentor", error: errorMessage(error) });
  }
};

export const reactivateMentor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mentor = await userRepository.findOne({ where: { id, role: "tutor" } });
    
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    await userRepository.update(id, { isActive: true });
    const updated = await userRepository.findOne({ where: { id } });
    res.json({ message: "Mentor reactivated", mentor: updated ? sanitizeUser(updated) : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reactivating mentor", error: errorMessage(error) });
  }
};

export const deleteMentor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mentor = await userRepository.findOne({ where: { id, role: "tutor" } });
    
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    await userRepository.delete(id);
    res.json({ message: "Mentor deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting mentor", error: errorMessage(error) });
  }
};

// ---------- Student Management ----------
export const deactivateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await userRepository.findOne({ where: { id, role: "student" } });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await userRepository.update(id, { isActive: false });
    const updated = await userRepository.findOne({ where: { id } });
    res.json({ message: "Student deactivated", user: updated ? sanitizeUser(updated) : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deactivating student", error: errorMessage(error) });
  }
};

export const reactivateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await userRepository.findOne({ where: { id, role: "student" } });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await userRepository.update(id, { isActive: true });
    const updated = await userRepository.findOne({ where: { id } });
    res.json({ message: "Student reactivated", user: updated ? sanitizeUser(updated) : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reactivating student", error: errorMessage(error) });
  }
};
