import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { Order } from "../entities/Order.js";
import { AuthRequest } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";

const orderRepository = AppDataSource.getRepository(Order);

export const createOrder = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { pricingPlanId, price, documents, submissionIds } = req.body;
    const order = orderRepository.create({ userId, pricingPlanId, price: Number(price || 0), documents: Number(documents || 1), submissionIds: submissionIds || null, status: "pending" } as Partial<Order>);
    const saved = await orderRepository.save(order);

    // notify user
    try {
      if (saved.user?.email) {
        await sendMail(saved.user.email, "Order created", `Your order ${saved.id} has been created and is pending payment.`);
      }
    } catch (err) {
      console.error("Failed to send order email", err);
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating order", error });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await orderRepository.findAndCount({ where: { userId }, order: { createdAt: "DESC" }, skip, take: Number(limit) });
    res.json({ data: orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderRepository.findOne({ where: { id } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching order", error });
  }
};

export const listAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await orderRepository.findAndCount({ order: { createdAt: "DESC" }, skip, take: Number(limit) });

    res.json({ data: orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "in_review", "completed", "failed"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    await orderRepository.update(id, { status } as Partial<Order>);
    const updated = await orderRepository.findOne({ where: { id } });

    // notify user
    try {
      if (updated?.user?.email) {
        await sendMail(updated.user.email, `Order ${updated.id} status updated`, `Your order status is now ${status}.`);
      }
    } catch (err) {
      console.error("Failed to send order status email", err);
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order status", error });
  }
};
