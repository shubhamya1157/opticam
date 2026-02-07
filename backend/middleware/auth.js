import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        console.log(`🔒 Auth Check: ${req.method} ${req.originalUrl}`);

        if (!token) {
            console.warn("⚠️ Auth: No token provided");
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("❌ CRITICAL: JWT_SECRET is missing in env");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("✅ Auth: Token verified for ID:", decoded.id);

        const user = await User.findById(decoded.id);

        if (!user) {
            console.error("❌ Auth: User not found in DB for ID:", decoded.id);
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();
    } catch (err) {
        console.error("❌ Auth Failed:", err.message);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default auth;
