import Notification from "../models/Notification.js";

// GET Notifications for a User
export const getNotifications = async (req, res) => {
    const { userId } = req.query;
    try {
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT Mark as Read
export const markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT Mark All as Read
export const markAllAsRead = async (req, res) => {
    const { userId } = req.body;
    try {
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({ message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
