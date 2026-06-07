import { MAX_LIST_FREE, MAX_LIST_PREMIUM } from "../constants/constants.js";
import List from "../models/list.model.js";
import Task from "../models/task.model.js";

export const createDefaultList = async (userId) => {
    try {
        const newList = await List.create({
            title: "Inbox",
            user: userId,
            isDefault: true,
        });
        return newList;
    } catch (error) {
        console.error("ERROR IN CREATE DEFAULT LIST:", error);
        throw error;
    }
};

export const createList = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Create data (title) is required." });
    }
    try {
        const title = req.body.title;

        if (!title) {
            return res.status(400).json({ message: "List title is required." });
        }

        if (title.length > 50) {
            return res.status(400).json({ message: "List title must be less than 50 characters." });
        }

        const list = await List.findOne({ title: title, user: req.user._id });

        if (list) {
            return res.status(400).json({ message: "List already exists." });
        }

        const listCount = await List.countDocuments({ user: req.user._id });

        if (req.user.havePremium) {
            if (listCount >= MAX_LIST_PREMIUM) {
                return res.status(400).json({ message: "Limit reached. Premium max is 50." });
            }
        } else {
            if (listCount >= MAX_LIST_FREE) {
                return res.status(400).json({ message: "Limit reached. Upgrade to premium to create more lists." });
            }
        }

        const newList = await List.create({
            title: title,
            user: req.user._id,
        });

        res.status(201).json(newList);
    } catch (error) {
        console.error("ERROR IN CREATE LIST:", error);
        res.status(500).json({ error: "Failed to create list" });
    }
};

export const getLists = async (req, res) => {
    try {
        const lists = await List.find({ user: req.user._id });
        res.status(200).json(lists);
    } catch (error) {
        console.error("ERROR IN GET LISTS:", error);
        res.status(500).json({ error: "Failed to get lists" });
    }
};

export const updateList = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Update data (title) is required." });
    }

    try {
        const { listId } = req.params;
        const { title } = req.body;

        if (!title || title.length > 50) {
            return res.status(400).json({ message: "Valid title under 50 characters is required." });
        }

        const list = await List.findOne({ _id: listId, user: req.user._id });

        if (!list) {
            return res.status(404).json({ message: "List not found." });
        }

        if (list.isDefault) {
            return res.status(403).json({ message: "You cannot rename your default Inbox." });
        }

        list.title = title;
        await list.save();

        res.status(200).json(list);
    } catch (error) {
        console.error("ERROR IN UPDATE LIST:", error);
        res.status(500).json({ error: "Failed to update list." });
    }
};

export const deleteList = async (req, res) => {
    try {
        const { listId } = req.params;
        const deleteAllTasks = req.query.deleteAllTasks === 'true';

        const list = await List.findOne({ _id: listId, user: req.user._id });

        if (!list) {
            return res.status(404).json({ message: "List not found." });
        }

        if (list.isDefault) {
            return res.status(403).json({ message: "You cannot delete your default Inbox." });
        }

        if (deleteAllTasks) {
            await Task.deleteMany({ list: listId });
        } else {
            const defaultList = await List.findOne({ user: req.user._id, isDefault: true });
            await Task.updateMany({ list: listId }, { $set: { list: defaultList._id } });
        }

        await list.deleteOne();

        res.status(200).json({ message: "List deleted successfully." });
    } catch (error) {
        console.error("ERROR IN DELETE LIST:", error);
        res.status(500).json({ error: "Failed to delete list." });
    }
};