import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
