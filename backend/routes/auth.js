import express from "express";
import {
  sendOtp,
  verifyOtp,
  verifyToken,
  updateProfile,
  getProfile,
  updateRoutine
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
console.log("🔥 Loaded auth.js routes");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/verify-token", auth, verifyToken); // New route to check session validity
router.put("/update-profile", updateProfile);
router.get("/profile", getProfile);
router.put("/update-routine", updateRoutine);

export default router;
