import { MAX_LIST_FREE, MAX_LIST_PREMIUM } from "../constants/constants.js";
import List from "../models/list.model.js";

export const createList = async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ message: "List title is required." });
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
            title: req.body.title,
            user: req.user._id
        });

        res.status(201).json(newList);
    } catch (error) {
        console.error("ERROR IN CREATE LIST:", error);
        res.status(500).json({ error: "Failed to create list" });
    }
};