import Otp from "../models/Otp.js";
import User from "../models/Users.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

/**
 * Send OTP
 */
export const sendOtp = async (req, res) => {
    const { collegeId, email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Email credentials missing in .env");
        return res.status(500).json({
            success: false,
            message: "Server email configuration error"
        });
    }

    try {
        console.log("🔹 processing send-otp for:", email);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.deleteMany({ email });
        await Otp.create({
            collegeId: collegeId || null,
            email,
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });
        console.log("✅ OTP saved to DB");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
            }
        });

        res.json({
            success: true,
            message: "OTP sent (Email sending in background)",
        });

        transporter.sendMail({
            to: email,
            subject: "Your OptiCam Verification Code",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 12px; background: #f9fafb;">
              <div style="text-align:center; margin-bottom:20px;">
                <h2 style="color:#1d9bf0;">OptiCam</h2>
                <p style="color:#555;">Optimize Your Campus Time</p>
              </div>
              <div style="background:#fff; padding:20px; border-radius:10px; text-align:center;">
                <p style="font-size:16px;">Your One-Time Password (OTP):</p>
                <h1 style="letter-spacing:6px; margin:10px 0;">${otp}</h1>
                <p style="font-size:14px; color:#888;">Valid for 5 minutes</p>
              </div>
              <p style="text-align:center; font-size:12px; color:#aaa; margin-top:20px;">
                If you didn’t request this, ignore this email.
              </p>
            </div>
          `
        }).then(() => {
            console.log(`✅ [Background] OTP email sent to ${email}`);
        }).catch(emailError => {
            console.error("❌ [Background] Email sending failed:", emailError.message);
            console.log("🔑 [FALLBACK] OTP for Dev:", otp);
        });

    } catch (err) {
        console.error("❌ Send OTP CRITICAL Error:", err);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Failed to generate OTP."
            });
        }
    }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req, res) => {
    const { email, otp, userDetails } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP required"
        });
    }

    try {
        const record = await Otp.findOne({
            email,
            otp,
            expiresAt: { $gt: Date.now() }
        });

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                ...userDetails,
                isVerified: true
            });
        } else {
            user.isVerified = true;
            if (userDetails) {
                Object.assign(user, userDetails);
            }
            await user.save();
        }

        await Otp.deleteMany({ email });

        const token = jwt.sign(
            { id: user._id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Normalize user object for frontend consistency
        const userResponse = {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            collegeId: user.collegeId,
            role: user.role,
            year: user.year,
            semester: user.semester,
            branch: user.branch,
            section: user.section,
            isVerified: user.isVerified
        };

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (err) {
        console.error("❌ Verify OTP Error:", err);
        res.status(500).json({
            success: false,
            message: "OTP verification failed"
        });
    }
};

/**
 * Verify Token (Frontend Check)
 */
export const verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Normalize user object for frontend consistency
        const userResponse = {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            collegeId: user.collegeId,
            role: user.role,
            year: user.year,
            semester: user.semester,
            branch: user.branch,
            section: user.section,
            isVerified: user.isVerified,
            xp: user.xp
        };

        res.json({ success: true, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Update Profile
 */
export const updateProfile = async (req, res) => {
    const { email, updates } = req.body;

    if (!email || !updates) {
        return res.status(400).json({ success: false, message: "Missing data" });
    }

    try {
        delete updates.email;
        delete updates.collegeId;
        delete updates.role;
        delete updates._id;

        const user = await User.findOneAndUpdate(
            { email },
            { $set: updates },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (err) {
        console.error("❌ Update Profile Error:", err);
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

/**
 * Get Profile
 */
export const getProfile = async (req, res) => {
    res.json({ success: true, message: "Profile endpoint ready" });
};

/**
 * Update User Routine
 */
export const updateRoutine = async (req, res) => {
    try {
        const { userId, routine } = req.body;
        const user = await User.findByIdAndUpdate(
            userId,
            { dailyRoutine: routine },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to update routine" });
    }
};
