import { json } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import generateAndSendOTP from "../utils/generateAndSendOTP.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { createDefaultList } from "./list.controller.js";
import { createDefaultTask } from "./task.controller.js";

const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,20}$/;
    return regex.test(password);
}

const validateMail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

const validateFullName = (fullName) => {
    const regex = /^[a-zA-Z ]{5,20}$/;
    return regex.test(fullName);
}

export const login = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }
        await generateTokenAndSetCookie(user._id, res);
        return res.status(200).json({ 
            message: "Logged in successfully",
            user: { _id: user._id, email: user.email, fullName: user.fullName }
        });

    } catch (error) {
        console.error("ERROR IN LOGIN: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const signup = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {

        const { email, fullName, password } = req.body;

        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!validateMail(email)) {
            return res.status(400).json({ message: "Please enter a valid email" });
        }

        if (!validateFullName(fullName)) {
            return res.status(400).json({ message: "Please enter a valid full name" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (!isPasswordStrong(password)) {
            return res.status(400).json({ message: "Password must be strong" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, fullName, password: hashedPassword });
        await newUser.save();

        const otpResult = await generateAndSendOTP({ userId: newUser._id, email });
        if (!otpResult.success) {
            return res.status(500).json({ error: otpResult.error });
        }

        await generateTokenAndSetCookie(newUser._id, res);
        const defaultList = await createDefaultList(newUser._id);
        const defaultTask = await createDefaultTask(newUser._id, defaultList._id);

        return res.status(201).json({ message: `OTP sent to ${email}`, userId: newUser._id });

    } catch (error) {
        console.error("ERROR IN SIGNUP: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const resendOTP = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const { userId, email } = req.body;
        if (!userId || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        const otpResult = await generateAndSendOTP({ userId, email });
        if (!otpResult.success) {
            return res.status(500).json({ error: otpResult.error });
        }

        res.status(200).json({ message: otpResult.message });
    } catch (error) {
        console.error("ERROR IN RESEND OTP: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyOTP = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        const otpEntry = await OTP.findOne({ userId });
        if (!otpEntry) {
            return res.status(400).json({ message: "OTP not found" });
        }

        const isValid = await bcrypt.compare(String(otp), otpEntry.otp);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (otpEntry.expiresAt < new Date()) {
            await OTP.deleteMany({ userId });
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        user.isEmailVerified = true;
        await user.save();
        await OTP.deleteMany({ userId });
        return res.status(200).json({ 
            message: "Email verified successfully",
            user: { _id: user._id, email: user.email, fullName: user.fullName }
        });
    } catch (error) {
        console.error("ERROR IN VERIFY OTP: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("ERROR IN LOGOUT CONTROLLER", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};