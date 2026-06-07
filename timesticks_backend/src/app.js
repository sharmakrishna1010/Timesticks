import cookieParser from "cookie-parser";
import express from "express"
import authRoutes from "./routes/auth.routes.js"
import habitRoutes from "./routes/habit.routes.js"

const app = express()

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/habit", habitRoutes)

export default app