
import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createHabit, getHabits, updateHabitDetails, toggleHabitToday, deleteHabit } from "../controllers/habit.controller.js";

const router = express.Router();

router.post("/create", requireAuth, createHabit);
router.get("/", requireAuth, getHabits);

router.put("/:habitId", requireAuth, updateHabitDetails);
router.patch("/:habitId/toggle", requireAuth, toggleHabitToday);
router.delete("/:habitId", requireAuth, deleteHabit);

export default router;