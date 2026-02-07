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
