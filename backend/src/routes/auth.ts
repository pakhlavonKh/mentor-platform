import { Router } from "express";
import { register, login, getProfile, updateProfile, addSavedGrant, removeSavedGrant } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/profile/saved/:grantId", authenticate, addSavedGrant);
router.delete("/profile/saved/:grantId", authenticate, removeSavedGrant);

export default router;
