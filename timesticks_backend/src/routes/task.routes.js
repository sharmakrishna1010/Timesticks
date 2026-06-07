import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createTask, getTasks, updateTask, toggleComplete, deleteTask } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create", requireAuth, createTask);
router.get("/", requireAuth, getTasks);

router.put("/:taskId", requireAuth, updateTask);
router.patch("/:taskId/toggle", requireAuth, toggleComplete);
router.delete("/:taskId", requireAuth, deleteTask);

export default router;