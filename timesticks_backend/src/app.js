import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express"
import authRoutes from "./routes/auth.routes.js"
import habitRoutes from "./routes/habit.routes.js"
import listRoutes from "./routes/list.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app = express()

app.use(cors({
    origin: 'https://timesticks.onrender.com',
    credentials: true,
}));

app.use(express.json())
app.use(cookieParser());

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRoutes)
app.use("/api/habit", habitRoutes)
app.use("/api/list", listRoutes)
app.use("/api/task", taskRoutes)

export default app