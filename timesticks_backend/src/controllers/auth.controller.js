import { json } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateAndSendOTP from "../utils/generateAndSendOTP.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,20}$/;
    return regex.test(password);
}

export const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.isExist(email);
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        return res.status(200).json({ message: "Logged in successfully" });

    } catch (error) {
        console.log("ERROR IN LOGIN: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const signup = (req, res) => {
    try {
        const { email, fullName, password } = req.body;

        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = User.isExist(email);
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (!isPasswordStrong(password)) {
            return res.status(400).json({ message: "Password must be strong" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, fullName, hashedPassword });
        await newUser.save();

        const otpResult = await generateAndSendOTP({ userId: user._id, email });
        if (!otpResult.success) {
            return res.status(500).json({ error: otpResult.error });
        }

        await generateTokenAndSetCookie(newUser._id, res);
        return res.status(201).json({ message: `Please verify your email\nUserId: ${newUser._id}` });

    } catch (error) {
        console.log("ERROR IN SIGNUP: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const resendOTP = async (req, res) => {
    try {
        const { userId, email } = req.body;
        if (!userId || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const otpResult = await generateAndSendOTP({ userId, email });
        if (!otpResult.success) {
            return res.status(500).json({ error: otpResult.error });
        }

        res.status(200).json({ message: otpResult.message });
    } catch (error) {
        console.log("ERROR IN RESEND OTP: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otpEntry = await otpModel.findOne({ userId });
        if (!otpEntry) {
            return res.status(400).json({ message: "OTP not found" });
        }

        const isValid = await bcrypt.compare(otp, otpEntry.otp);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.isEmailVerified = true;
        await user.save();
        await OTP.deleteMany({ userId });
        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.log("ERROR IN VERIFY OTP: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("ERROR IN LOGOUT CONTROLLER", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};