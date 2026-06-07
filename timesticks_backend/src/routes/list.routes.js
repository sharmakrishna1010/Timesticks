import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createList, getLists, updateList, deleteList } from "../controllers/list.controller.js";

const router = express.Router();

router.post("/create", requireAuth, createList);
router.get("/", requireAuth, getLists);
router.put("/:listId", requireAuth, updateList);
router.delete("/:listId", requireAuth, deleteList);

export default router;