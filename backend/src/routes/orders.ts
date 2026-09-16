import { Router } from "express";
import { createOrder, getUserOrders, getOrderById, listAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);
// admin
router.get("/all", authenticate, authorizeRole("admin"), listAllOrders);
router.put("/:id/status", authenticate, authorizeRole("admin"), updateOrderStatus);

// order by id
router.get("/:id", authenticate, getOrderById);

export default router;
