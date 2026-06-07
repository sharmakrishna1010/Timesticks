import express from "express";
import createHabit from "../controllers/habit.controller.js";

const router = express.Router();

router.post("/create", createHabit);

export default router;