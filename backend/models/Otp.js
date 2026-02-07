import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: false, // 🟢 Changed to false to allow email-only OTPs if needed
      index: true
    },
    email: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Otp", otpSchema);

