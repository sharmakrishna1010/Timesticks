import { MAX_HABIT_FREE, MAX_HABIT_PREMIUM } from "../constants/constants";
import Habit from "../models/habit.model.js";

export const createHabit = async (req, res) => {
    try {

        if (!req.body.title || !req.body.description) {
            return res.status(400).json({ message: "Title and description is required." });
        }

        const habitCount = await Habit.countDocuments({ user: req.user });

        if (req.user.havePremium === true) {
            if (habitCount >= MAX_HABIT_PREMIUM) {
                return res.status(400).json({ message: "Limit reached" });
            }
        } else {
            if (habitCount >= MAX_HABIT_FREE) {
                return res.status(400).json({ message: "Limit reached, Upgrade to premium to create more habits" });
            }
        }

        const newHabit = await Habit.create({
            user: req.user,
            title: req.body.title,
            description: req.body.description,
            history: []
        });
    } catch (error) {
        console.error("ERROR IN CREATE HABIT:", error);
        res.status(500).json({ error: "Failed to create habit" });
    }
}