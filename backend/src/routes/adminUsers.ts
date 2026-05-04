import { Router } from "express";
import { listUsers, getUserById, updateUserRole, deleteUser } from "../controllers/adminController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, authorizeRole("admin"), listUsers);
router.get("/:id", authenticate, authorizeRole("admin"), getUserById);
router.put("/:id/role", authenticate, authorizeRole("admin"), updateUserRole);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteUser);

export default router;
