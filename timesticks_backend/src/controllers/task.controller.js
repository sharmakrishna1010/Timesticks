import { MAX_TASK_PREMIUM, MAX_TASK_FREE } from "../constants/constants.js";
import List from "../models/list.model.js";
import Task from "../models/task.model.js";

export const createDefaultTask = async (userId, listId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const task = await Task.create({
            list: listId,
            title: "Welcome To Timesticks",
            description: "This is your first task.",
            done: false,
            priority: "Medium",
            dueDate: today,
            user: userId
        });

        return task;
    } catch (error) {
        console.error("ERROR IN CREATE DEFAULT TASK:", error);
        throw error;
    }
}

export const createTask = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Create data is required." });
    }

    try {
        let {
            listId,
            title,
            description = " ",
            priority = "Medium",
            dueDate
        } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Task title is required." });
        }

        if (title.length > 50) {
            return res.status(400).json({ message: "Title must be less than 50 characters." });
        }

        if (description.length > 250) {
            return res.status(400).json({ message: "Description must be less than 250 characters." });
        }

        if (!listId) {
            const defaultList = await List.findOne({ user: req.user._id, isDefault: true });
            if (!defaultList) {
                return res.status(500).json({ message: "Critical Error: Default Inbox not found." });
            }
            listId = defaultList._id;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        if (dueDate && dueDate < todayStr) {
            return res.status(400).json({ message: "Due date cannot be in the past." });
        }

        if (!dueDate) {
            dueDate = todayStr;
        }

        const taskCount = await Task.countDocuments({ user: req.user._id });

        if (req.user.havePremium) {
            if (taskCount >= MAX_TASK_PREMIUM) {
                return res.status(400).json({ message: "Premium limit reached." });
            }
        } else {
            if (taskCount >= MAX_TASK_FREE) {
                return res.status(400).json({ message: "Limit reached. Upgrade to premium to create more tasks." });
            }
        }

        const task = await Task.create({
            list: listId,
            title: title,
            description: description,
            done: false,
            priority: priority,
            dueDate: dueDate,
            user: req.user._id
        });

        res.status(201).json(task);

    } catch (error) {
        console.error("ERROR IN CREATE TASK:", error);
        res.status(500).json({ error: "Failed to create task." });
    }
};

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("ERROR IN GET TASKS:", error);
        res.status(500).json({ error: "Failed to get tasks" });
    }
};

export const toggleComplete = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findOne({ _id: taskId, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        task.done = !task.done;

        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error("ERROR IN TOGGLE COMPLETE TASK:", error);
        res.status(500).json({ error: "Failed to toggle complete task" });
    }
}

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, priority, dueDate, listId } = req.body;

        const task = await Task.findOne({ _id: taskId, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        if (title && title.length > 50) {
            return res.status(400).json({ message: "Title must be less than 50 characters." });
        }

        if (description && description.length > 250) {
            return res.status(400).json({ message: "Description must be less than 250 characters." });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        if (dueDate && dueDate < todayStr) {
            return res.status(400).json({ message: "Due date cannot be in the past." });
        }

        if (listId) {
            const list = await List.findOne({ _id: listId, user: req.user._id });
            if (!list) {
                const defaultList = await List.findOne({ user: req.user._id, isDefault: true });
                task.list = defaultList._id;
            } else {
                task.list = list._id;
            }
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (priority) task.priority = priority;
        if (dueDate) task.dueDate = dueDate;

        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error("ERROR IN UPDATE TASK:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findOne({ _id: taskId, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        await task.deleteOne();
        res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
        console.error("ERROR IN DELETE TASK:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
}