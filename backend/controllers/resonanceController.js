import Signal from "../models/Signal.js";

// Broadcast a new signal
export const broadcastSignal = async (req, res) => {
    try {
        console.log("📡 Broadcasting Signal for:", req.user.email);
        const { content, tags, contact } = req.body;

        const newSignal = new Signal({
            userId: req.user.id,
            username: req.user.name || "Anonymous User", // Fallback for missing names
            content,
            tags,
            contact
        });

        await newSignal.save();
        console.log("✅ Signal Broadcasted:", newSignal._id);
        res.status(201).json({ success: true, data: newSignal });
    } catch (err) {
        console.error("❌ Broadcast Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tune into signals (Fetch all active)
// Client-side will handle the "Search/Filter" to preserve privacy
export const tuneSignals = async (req, res) => {
    try {
        const signals = await Signal.find().sort({ createdAt: -1 }).limit(100); // Limit to recent 100 for performance
        res.json({ success: true, data: signals });
    } catch (err) {
        console.error("❌ Tune Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
