import { Router } from "express";
import { listUsers, getUserById, updateUserRole, deleteUser, listMentors, createMentor, deactivateMentor, reactivateMentor, deleteMentor, deactivateStudent, reactivateStudent } from "../controllers/adminController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

// Mentor management routes
router.get("/mentors/list", authenticate, authorizeRole("admin"), listMentors);
router.post("/mentors", authenticate, authorizeRole("admin"), createMentor);
router.put("/mentors/:id/deactivate", authenticate, authorizeRole("admin"), deactivateMentor);
router.put("/mentors/:id/reactivate", authenticate, authorizeRole("admin"), reactivateMentor);
router.delete("/mentors/:id", authenticate, authorizeRole("admin"), deleteMentor);

// Student management routes
router.put("/students/:id/deactivate", authenticate, authorizeRole("admin"), deactivateStudent);
router.put("/students/:id/reactivate", authenticate, authorizeRole("admin"), reactivateStudent);

router.get("/", authenticate, authorizeRole("admin"), listUsers);
router.get("/:id", authenticate, authorizeRole("admin"), getUserById);
router.put("/:id/role", authenticate, authorizeRole("admin"), updateUserRole);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteUser);
router.put("/:id/telegram", authenticate, authorizeRole("admin"), updateUserTelegramId);

export default router;
