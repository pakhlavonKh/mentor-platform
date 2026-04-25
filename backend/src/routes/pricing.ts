import { Router } from "express";
import {
  getPricingPlans,
  getPricingPlanById,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from "../controllers/pricingController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getPricingPlans);
router.get("/:id", getPricingPlanById);
router.post("/", authenticate, authorizeRole("admin"), createPricingPlan);
router.put("/:id", authenticate, authorizeRole("admin"), updatePricingPlan);
router.delete("/:id", authenticate, authorizeRole("admin"), deletePricingPlan);

export default router;
