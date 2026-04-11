import { Router } from "express";
import {
  getGrants,
  getGrantById,
  createGrant,
  updateGrant,
  deleteGrant,
} from "../controllers/grantController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", getGrants);
router.get("/:id", getGrantById);
router.post("/", authenticate, createGrant);
router.put("/:id", authenticate, updateGrant);
router.delete("/:id", authenticate, deleteGrant);

export default router;
