import sendMail from "./sendMail.js";
import otpModel from "../models/otp.model.js";
import bcrypt from "bcryptjs";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const generateAndSendOTP = async ({ userId, email }) => {
  try {
    const otp = generateOTP();
    const htmlContent = `<p>Your OTP is <b>${otp}</b><br>Valid for 5 minutes</p>`;

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);

    // clear old OTPs
    await otpModel.deleteMany({ userId });

    // send mail
    const result = await sendMail("OTP Verification", htmlContent, email);
    if (!result) {
      return { success: false, error: "Failed to send OTP" };
    }

    // save otp entry
    await new otpModel({
      userId,
      otp: hashedOtp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    }).save();

    return { success: true, message: "OTP sent successfully"};
  } catch (error) {
    console.error("Error in generateAndSendOTP:", error);
    return { success: false, error: "Internal server error" };
  }
};

export default generateAndSendOTP;
