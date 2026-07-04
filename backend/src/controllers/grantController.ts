import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { Grant } from "../entities/Grant.js";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

const grantRepository = AppDataSource.getRepository(Grant);

export const getGrants = async (req: Request, res: Response) => {
  try {
    const { type, funding, country, page = 1, limit = 10 } = req.query;
    let query = grantRepository.createQueryBuilder("grant");

    if (type) {
      query = query.andWhere("grant.type = :type", { type });
    }
    if (funding) {
      query = query.andWhere("grant.funding = :funding", { funding });
    }
    if (country) {
      query = query.andWhere("grant.country ILIKE :country", { country: `%${country}%` });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [grants, total] = await query
      .skip(skip)
      .take(Number(limit))
      .getManyAndCount();

    res.json({
      data: grants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching grants", error: errorMessage(error) });
  }
};

export const getGrantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grant = await grantRepository.findOne({ where: { id } });

    if (!grant) {
      return res.status(404).json({ message: "Grant not found" });
    }

    res.json(grant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching grant", error: errorMessage(error) });
  }
};

export const createGrant = async (req: Request, res: Response) => {
  try {
    const { title, country, type, funding, deadline, description, link } = req.body;

    const grant = grantRepository.create({
      title,
      country,
      type,
      funding,
      deadline,
      description,
      link,
    });

    const result = await grantRepository.save(grant);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error creating grant", error: errorMessage(error) });
  }
};

export const updateGrant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    await grantRepository.update(id, updateData);
    const grant = await grantRepository.findOne({ where: { id } });

    res.json(grant);
  } catch (error) {
    res.status(400).json({ message: "Error updating grant", error: errorMessage(error) });
  }
};

export const deleteGrant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await grantRepository.delete(id);
    res.json({ message: "Grant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting grant", error: errorMessage(error) });
  }
};
