import { json } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import generateAndSendOTP from "../utils/generateAndSendOTP.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { createDefaultList } from "./list.controller.js";
import { createDefaultTask } from "./task.controller.js";
import sendMail from "../utils/sendMail.js"; // Make sure to import this!

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

export const verifyMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            userId: user._id,
            email: user.email,
            fullName: user.fullName
        });
    } catch (error) {
        console.error("Error in verifyMe:", error);
        res.status(500).json({ message: "Internal server error" });
    }
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

        const salt = await bcrypt.genSalt(10);
        // FIX: Changed newPassword to password
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, fullName, password: hashedPassword });
        await newUser.save();

        const otpResult = await generateAndSendOTP({ userId: newUser._id, email });
        if (!otpResult.success) {
            return res.status(500).json({ error: otpResult.error });
        }

        await generateTokenAndSetCookie(newUser._id, res);
        const defaultList = await createDefaultList(newUser._id);
        const userTimezone = req.headers['x-timezone'];
        const defaultTask = await createDefaultTask(newUser._id, defaultList._id, userTimezone);

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

export const resetPassword = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const otpResult = await generateAndSendOTP({ userId: user._id, email });
        if (!otpResult.success) {
            return res.status(500).json({ error: otpResult.error });
        }

        res.status(200).json({ message: otpResult.message, userId: user._id });
    } catch (error) {
        console.log("ERROR IN RESET PASSWORD\n", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resetPasswordVerification = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const { userId, otp, newPassword } = req.body;

        if (!userId || !otp || !newPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
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

        if (!isPasswordStrong(newPassword)) {
            return res.status(400).json({
                error:
                    "Password must be between 6 and 20 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.updateOne({ _id: userId }, { password: hashedPassword });
        await OTP.deleteMany({ userId });

        const successHtmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
                <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center; border: 1px solid #e5e7eb;">
                    <h2 style="color: #111827; font-size: 24px; margin-bottom: 16px; font-weight: 600; margin-top: 0;">Password Successfully Changed</h2>
                    <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px; line-height: 1.5;">
                        Your password for Timesticks has been updated successfully.
                    </p>
                    
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 32px; display: inline-block;">
                        <span style="color: #166534; font-weight: 500;">✓ Your account is secure</span>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                    
                    <p style="color: #ef4444; font-size: 14px; margin-bottom: 0; font-weight: 500;">
                        If you did not make this change, please contact support immediately.
                    </p>
                </div>
            </div>
        `;

        await sendMail(
            "Password Changed Successfully",
            successHtmlContent,
            user.email
        );

        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.log("ERROR IN FORGET PASSWORD VERIFICATION : ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};