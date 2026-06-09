import { MAX_HABIT_FREE, MAX_HABIT_PREMIUM } from "../constants/constants.js";
import Habit from "../models/habit.model.js";
import { getLocalToday, getLocalYesterday } from "../utils/dateUtils.js";

export const createHabit = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Create data (title/description) is required." });
    }
    try {
        const { title, description = " " } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        if (title.length > 50) {
            return res.status(400).json({ message: "Title must be less than 50 characters." });
        }

        if (description.length > 250) {
            return res.status(400).json({ message: "Description must be less than 250 characters." });
        }

        const habit = await Habit.findOne({ user: req.user._id, title });
        if (habit) {
            return res.status(400).json({ message: "Habit already exists." });
        }

        const habitCount = await Habit.countDocuments({ user: req.user._id });

        if (req.user.havePremium) {
            if (habitCount >= MAX_HABIT_PREMIUM) {
                return res.status(400).json({ message: "Premium limit reached." });
            }
        } else {
            if (habitCount >= MAX_HABIT_FREE) {
                return res.status(400).json({ message: "Limit reached. Upgrade to premium to create more habits." });
            }
        }

        const newHabit = await Habit.create({
            user: req.user._id,
            title,
            description,
            history: []
        });

        return res.status(201).json(newHabit);

    } catch (error) {
        console.error("ERROR IN CREATE HABIT:", error);
        res.status(500).json({ error: "Failed to create habit" });
    }
}

export const getHabits = async (req, res) => {
    try {
        const userId = req.user._id; 
        const userTimezone = req.headers['x-timezone'];
        
        const todayStr = getLocalToday(userTimezone);
        const yesterdayStr = getLocalYesterday(userTimezone);

        const habits = await Habit.find({ user: userId });

        const evaluatedHabits = habits.map(habit => {
            
            const hasCompletedToday = habit.history.some(
                entry => entry.date === todayStr && entry.completed
            );

            const hasCompletedYesterday = habit.history.some(
                entry => entry.date === yesterdayStr && entry.completed
            );

            let computedStreak = habit.currentStreak;
            
            if (!hasCompletedToday && !hasCompletedYesterday) {
                computedStreak = 0;
            }

            return {
                ...habit.toObject(),
                todayStatus: hasCompletedToday,
                currentStreak: computedStreak
            };
        });

        res.status(200).json(evaluatedHabits);

    } catch (error) {
        console.error("Error fetching habits:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateHabitDetails = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Update data (title/description) is required." });
    }
    try {
        const { habitId } = req.params;
        const { title, description = " " } = req.body;

        if (title.length > 50) {
            return res.status(400).json({ message: "Title must be less than 50 characters." });
        }

        if (description.length > 250) {
            return res.status(400).json({ message: "Description must be less than 250 characters." });
        }

        const habit = await Habit.findOneAndUpdate(
            { _id: habitId, user: req.user._id },
            { title, description },
            { new: true, runValidators: true }
        );

        if (!habit) {
            return res.status(404).json({ message: "Habit not found or unauthorized." });
        }

        return res.status(200).json(habit);
    } catch (error) {
        console.error("ERROR IN UPDATE HABIT:", error);
        res.status(500).json({ error: "Failed to update habit." });
    }
};

export const deleteHabit = async (req, res) => {
    try {
        const { habitId } = req.params;

        const deletedHabit = await Habit.findOneAndDelete({
            _id: habitId,
            user: req.user._id
        });

        if (!deletedHabit) {
            return res.status(404).json({ message: "Habit not found." });
        }

        return res.status(200).json({ message: "Habit deleted successfully." });
    } catch (error) {
        console.error("ERROR IN DELETE HABIT:", error);
        res.status(500).json({ error: "Failed to delete habit." });
    }
};

export const toggleHabitToday = async (req, res) => {
    try {
        const { habitId } = req.params;
        const userTimezone = req.headers['x-timezone'];
        
        const todayStr = getLocalToday(userTimezone);
        const yesterdayStr = getLocalYesterday(userTimezone);

        const habit = await Habit.findOne({ _id: habitId, user: req.user._id });

        if (!habit) {
            return res.status(404).json({ message: "Habit not found." });
        }

        const todayEntryIndex = habit.history.findIndex(entry => entry.date === todayStr);
        const hasCompletedToday = todayEntryIndex !== -1 && habit.history[todayEntryIndex].completed;

        const hasCompletedYesterday = habit.history.some(entry => entry.date === yesterdayStr && entry.completed);

        if (hasCompletedToday) {
            
            habit.history.splice(todayEntryIndex, 1);
            
            if (hasCompletedYesterday) {
                habit.currentStreak = Math.max(0, habit.currentStreak - 1); 
            } else {
                habit.currentStreak = 0;
            }

        } else {
            
            habit.history.push({ date: todayStr, completed: true });

            if (hasCompletedYesterday) {
                habit.currentStreak += 1;
            } else {
                habit.currentStreak = 1;
            }

            if (habit.currentStreak > habit.highestStreak) {
                habit.highestStreak = habit.currentStreak;
            }
        }

        await habit.save();

        const updatedHabit = habit.toObject();
        updatedHabit.todayStatus = !hasCompletedToday;

        return res.status(200).json({
            message: !hasCompletedToday ? "Habit completed!" : "Habit unchecked.",
            habit: updatedHabit
        });

    } catch (error) {
        console.error("ERROR IN TOGGLE HABIT TODAY:", error);
        res.status(500).json({ error: "Failed to toggle habit today." });
    }
}