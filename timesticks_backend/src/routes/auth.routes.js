import express from "express";
import { login, logout, signup, verifyOTP, resendOTP, resetPassword, resetPasswordVerification, verifyMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/me", requireAuth, verifyMe);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verifyOTP", verifyOTP);

router.post("/resendOTP", resendOTP);

router.post("/resetPassword", resetPassword)

router.post("/resetPasswordVerification", resetPasswordVerification)

export default router;