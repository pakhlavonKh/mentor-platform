import { Router } from "express";
import {
  getCalendarEvents,
  getPersonalCalendar,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../controllers/calendarController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getCalendarEvents);
router.get("/personal", authenticate, getPersonalCalendar);
router.post("/", authenticate, authorizeRole("admin"), createCalendarEvent);
router.put("/:id", authenticate, authorizeRole("admin"), updateCalendarEvent);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteCalendarEvent);

export default router;
