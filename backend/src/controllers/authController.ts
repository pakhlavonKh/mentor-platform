import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";
import { Grant } from "../entities/Grant.js";
import { generateToken } from "../middleware/auth.js";

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const validRoles = ["admin", "mentor", "student"];
    const userRole = validRoles.includes(role) ? role : "student";

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: userRole,
    });

    const savedUser = await userRepository.save(user);
    const token = generateToken(savedUser.id);

    res.status(201).json({
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      profilePicture: savedUser.profilePicture || null,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePicture: user.profilePicture || null,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

type AuthRequest = Request & { userId?: string };

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;

    const user = await userRepository.findOne({ where: { id: userId }, relations: ["savedGrants"] });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePicture: user.profilePicture || null,
      savedGrants: (user.savedGrants || []).map((g) => g.id),
    });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const { firstName, lastName, email, profilePicture } = req.body;

    // Validate profilePicture size and type if provided
    if (profilePicture && typeof profilePicture === "string") {
      const MAX_BYTES = parseInt(process.env.MAX_PROFILE_PIC_SIZE_BYTES || "1048576"); // 1MB default
      // basic data URL check
      const isDataUrl = /^data:image\/(png|jpeg|jpg|webp);base64,/.test(profilePicture);
      if (!isDataUrl) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      // approximate byte size from base64 length
      const approxBytes = Math.ceil((profilePicture.length - profilePicture.indexOf(',') - 1) * 3 / 4);
      if (approxBytes > MAX_BYTES) {
        return res.status(413).json({ message: "Profile image too large" });
      }
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existing = await userRepository.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const saved = await userRepository.save(user);

    // reload relations
    const reloaded = await userRepository.findOne({ where: { id: saved.id }, relations: ["savedGrants"] });

    res.json({
      id: saved.id,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      role: saved.role,
      profilePicture: saved.profilePicture || null,
      savedGrants: (reloaded?.savedGrants || []).map((g) => g.id),
    });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const addSavedGrant = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const grantId = req.params.grantId;
    const user = await userRepository.findOne({ where: { id: userId }, relations: ["savedGrants"] });
    if (!user) return res.status(404).json({ message: "User not found" });
    const grant = await AppDataSource.getRepository(Grant).findOne({ where: { id: grantId } });
    if (!grant) return res.status(404).json({ message: "Grant not found" });

    const existing = user.savedGrants || [];
    if (!existing.find((g) => g.id === grant.id)) {
      user.savedGrants = [...existing, grant];
      await userRepository.save(user);
    }

    res.json({ message: "Saved" });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ message: "Error saving grant" });
  }
};

export const removeSavedGrant = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const grantId = req.params.grantId;
    const user = await userRepository.findOne({ where: { id: userId }, relations: ["savedGrants"] });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedGrants = (user.savedGrants || []).filter((g) => g.id !== grantId);
    await userRepository.save(user);

    res.json({ message: "Removed" });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ message: "Error removing saved grant" });
  }
};
