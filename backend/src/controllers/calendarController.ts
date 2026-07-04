import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { CalendarEvent } from "../entities/CalendarEvent.js";
import { Grant } from "../entities/Grant.js";
import { User } from "../entities/User.js";
import { AuthRequest } from "../middleware/auth.js";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

const calendarRepository = AppDataSource.getRepository(CalendarEvent);
const grantRepository = AppDataSource.getRepository(Grant);
const userRepository = AppDataSource.getRepository(User);

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 100, from, to } = req.query;
    let query = calendarRepository.createQueryBuilder("event").orderBy("event.date", "ASC");

    if (from) {
      query = query.andWhere("event.date >= :from", { from });
    }
    if (to) {
      query = query.andWhere("event.date <= :to", { to });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await query.skip(skip).take(Number(limit)).getManyAndCount();

    res.json({
      data: events,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching calendar events", error: errorMessage(error) });
  }
};

export const getPersonalCalendar = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to } = req.query;

    let eventQuery = calendarRepository.createQueryBuilder("event").orderBy("event.date", "ASC");
    if (from) eventQuery = eventQuery.andWhere("event.date >= :from", { from });
    if (to) eventQuery = eventQuery.andWhere("event.date <= :to", { to });
    const platformEvents = await eventQuery.getMany();

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["savedGrants"],
    });

    const savedGrants = user?.savedGrants ?? [];
    const grantDeadlines = savedGrants.map((grant) => ({
      id: `grant-${grant.id}`,
      title: grant.title,
      date: grant.deadline,
      category: "grant_deadline" as const,
      link: grant.link,
      source: "grant" as const,
    }));

    const items = [
      ...platformEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        category: event.category,
        link: event.link,
        source: "platform" as const,
      })),
      ...grantDeadlines,
    ].sort((a, b) => a.date.localeCompare(b.date));

    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ message: "Error fetching personal calendar", error: errorMessage(error) });
  }
};

export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, category, link } = req.body;
    const event = calendarRepository.create({ title, description, date, category, link });
    const saved = await calendarRepository.save(event);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Error creating calendar event", error: errorMessage(error) });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await calendarRepository.update(id, req.body);
    const updated = await calendarRepository.findOne({ where: { id } });
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Error updating calendar event", error: errorMessage(error) });
  }
};

export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await calendarRepository.delete(id);
    res.json({ message: "Calendar event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting calendar event", error: errorMessage(error) });
  }
};
