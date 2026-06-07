import sendMail from "./sendMail.js";
import otpModel from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const generateAndSendOTP = async ({ userId, email }) => {
  try {
    const otp = generateOTP();
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; font-size: 24px; margin-bottom: 8px; font-weight: 600; margin-top: 0;">Timesticks</h2>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 32px; line-height: 1.5;">
            Here is your secure verification code. Please use it to complete your request.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
            <span style="font-size: 36px; font-weight: 700; color: #3b82f6; letter-spacing: 6px;">${otp}</span>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
            This code will expire in <span style="font-weight: 600; color: #111827;">5 minutes</span>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);

    const user = await User.findById(userId);
    if (user.email !== email) {
      return { success: false, error: "Wrong email" };
    }

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
