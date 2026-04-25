import { Router } from "express";
import {
  getGrants,
  getGrantById,
  createGrant,
  updateGrant,
  deleteGrant,
} from "../controllers/grantController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getGrants);
router.get("/:id", getGrantById);
router.post("/", authenticate, authorizeRole("admin"), createGrant);
router.put("/:id", authenticate, authorizeRole("admin"), updateGrant);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteGrant);

export default router;
