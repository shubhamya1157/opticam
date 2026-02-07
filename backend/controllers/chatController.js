import PrivateMessage from "../models/PrivateMessage.js";
import { getIO } from "../socket.js";

// Send a private message
export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user.id;

        const newMessage = new PrivateMessage({
            sender: senderId,
            recipient: recipientId,
            content
        });

        await newMessage.save();

        // Real-time delivery via Socket.io
        const io = getIO();

        // Emit to recipient's room (they join room 'user_USERID')
        io.to(`user_${recipientId}`).emit("receive_private_message", {
            _id: newMessage._id,
            sender: senderId,
            recipient: recipientId,
            content,
            createdAt: newMessage.createdAt,
            senderName: req.user.name // meaningful for UI
        });

        // Emit to sender for confirmation (if needed, though optimistic UI is better)
        io.to(`user_${senderId}`).emit("message_sent_confirmation", newMessage);

        res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
        console.error("❌ Send Message Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get chat history with a specific user
export const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params; // The other user
        const myId = req.user.id;

        const messages = await PrivateMessage.find({
            $or: [
                { sender: myId, recipient: userId },
                { sender: userId, recipient: myId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first

        res.json({ success: true, data: messages });
    } catch (err) {
        console.error("❌ Get History Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
// End Chat & Delete History (Private & Ephemeral)
export const deleteConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const myId = req.user.id;

        await PrivateMessage.deleteMany({
            $or: [
                { sender: myId, recipient: targetUserId },
                { sender: targetUserId, recipient: myId }
            ]
        });

        console.log(`🗑️ Chat deleted between ${myId} and ${targetUserId}`);
        res.json({ success: true, message: "Chat history wiped" });
    } catch (err) {
        console.error("❌ Delete Chat Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 🟢 Connection Request Logic
import User from "../models/Users.js";
import Notification from "../models/Notification.js";

export const sendConnectionRequest = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const requesterId = req.user.id;
        const requesterName = req.user.name;

        // Add to target's pending list
        await User.findByIdAndUpdate(targetUserId, {
            $push: {
                pendingConnectionRequests: {
                    requesterId,
                    username: requesterName,
                    timestamp: new Date()
                }
            }
        });

        // 🔔 Create Global Notification
        await Notification.create({
            userId: targetUserId,
            title: "New Connection Request",
            message: `${requesterName} wants to connect on Resonance.`,
            type: "info",
            link: "/resonance" // Clicking it goes to Resonance
        });

        // Real-time notification via Socket
        const io = getIO();
        io.to(`user_${targetUserId}`).emit("incoming_request", {
            _id: requesterId,
            username: requesterName,
            persistent: true
        });

        // Also emit a general "notification" event to update the bell icon
        io.to(`user_${targetUserId}`).emit("new_notification");

        res.json({ success: true, message: "Request sent" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('pendingConnectionRequests.requesterId', 'name email');
        res.json({ success: true, data: user.pendingConnectionRequests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { requesterId } = req.body;
        const userId = req.user.id;

        // Remove from pending
        await User.findByIdAndUpdate(userId, {
            $pull: { pendingConnectionRequests: { requesterId: requesterId } }
        });

        const io = getIO();
        io.to(`user_${requesterId}`).emit("request_accepted", {
            _id: userId,
            username: req.user.name
        });

        res.json({ success: true, message: "Connected" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const rejectConnectionRequest = async (req, res) => {
    try {
        const { requesterId } = req.body;
        const userId = req.user.id;

        await User.findByIdAndUpdate(userId, {
            $pull: { pendingConnectionRequests: { requesterId: requesterId } }
        });

        res.json({ success: true, message: "Request rejected" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
