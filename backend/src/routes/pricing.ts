import { Router } from "express";
import {
  getPricingPlans,
  getPricingPlanById,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from "../controllers/pricingController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", getPricingPlans);
router.get("/:id", getPricingPlanById);
router.post("/", authenticate, createPricingPlan);
router.put("/:id", authenticate, updatePricingPlan);
router.delete("/:id", authenticate, deletePricingPlan);

export default router;
