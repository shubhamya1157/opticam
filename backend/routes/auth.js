import express from "express";
import {
  sendOtp,
  verifyOtp,
  updateProfile,
  getProfile,
  updateRoutine
} from "../controllers/authController.js";

const router = express.Router();
console.log("🔥 Loaded auth.js routes");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.put("/update-profile", updateProfile);
router.get("/profile", getProfile);
router.put("/update-routine", updateRoutine);

export default router;
