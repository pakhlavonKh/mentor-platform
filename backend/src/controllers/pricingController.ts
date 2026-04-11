import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { PricingPlan } from "../entities/PricingPlan.js";

const pricingRepository = AppDataSource.getRepository(PricingPlan);

export const getPricingPlans = async (req: Request, res: Response) => {
  try {
    const plans = await pricingRepository.find({
      order: {
        price: "ASC",
      },
    });

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pricing plans", error });
  }
};

export const getPricingPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await pricingRepository.findOne({ where: { id } });

    if (!plan) {
      return res.status(404).json({ message: "Pricing plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pricing plan", error });
  }
};

export const createPricingPlan = async (req: Request, res: Response) => {
  try {
    const { name, documents, price, features, popular } = req.body;

    const plan = pricingRepository.create({
      name,
      documents,
      price,
      features,
      popular: popular || false,
    });

    const result = await pricingRepository.save(plan);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error creating pricing plan", error });
  }
};

export const updatePricingPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    await pricingRepository.update(id, updateData);
    const plan = await pricingRepository.findOne({ where: { id } });

    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: "Error updating pricing plan", error });
  }
};

export const deletePricingPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pricingRepository.delete(id);
    res.json({ message: "Pricing plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting pricing plan", error });
  }
};
