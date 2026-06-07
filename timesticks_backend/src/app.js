import cookieParser from "cookie-parser";
import express from "express"
import authRoutes from "./routes/auth.routes.js"
import habitRoutes from "./routes/habit.routes.js"
import listRoutes from "./routes/list.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app = express()

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/habit", habitRoutes)
app.use("/api/list", listRoutes)
app.use("/api/task", taskRoutes)

export default app