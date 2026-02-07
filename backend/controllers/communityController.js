import Group from "../models/Group.js";
import Message from "../models/Message.js";
import User from "../models/Users.js";
import { getIO } from "../socket.js";

// Get Groups for a User
export const getGroups = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const groups = await Group.find({
            branch: user.branch,
            section: user.section,
            year: user.year
        }).sort({ createdAt: -1 }).populate('members', 'name email role');

        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create Group (CR Only)
export const createGroup = async (req, res) => {
    try {
        const { name, description, createdBy, branch, section, year } = req.body;

        const newGroup = new Group({
            name,
            description,
            branch,
            section,
            year,
            createdBy,
            members: [createdBy]
        });

        await newGroup.save();
        res.json({ success: true, data: newGroup });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update Group (CR Only)
export const updateGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const group = await Group.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        res.json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Group (CR Only)
export const deleteGroup = async (req, res) => {
    try {
        await Group.findByIdAndDelete(req.params.id);
        await Message.deleteMany({ groupId: req.params.id });
        res.json({ success: true, message: "Group deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Messages for a Group
export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ groupId: req.params.groupId })
            .sort({ createdAt: 1 });
        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Send Message
export const sendMessage = async (req, res) => {
    try {
        const { senderId, senderName, content, type, fileUrl } = req.body;

        const newMessage = new Message({
            groupId: req.params.groupId,
            senderId,
            senderName,
            content,
            type: type || 'text',
            fileUrl
        });

        await newMessage.save();

        try {
            const io = getIO();
            io.to(req.params.groupId).emit("receive_message", newMessage);
        } catch (socketErr) {
            console.error("Socket emit failed:", socketErr);
        }

        res.json({ success: true, data: newMessage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Upload File
export const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const fileUrl = req.file.path;
        const type = req.file.mimetype.startsWith('image/') ? 'image'
            : req.file.mimetype.startsWith('audio/') ? 'audio'
                : req.file.mimetype.startsWith('video/') ? 'video'
                    : 'file';
        res.json({ success: true, data: { fileUrl, type } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Message
export const deleteMessage = async (req, res) => {
    try {
        const { groupId, messageId } = req.params;
        const { userId } = req.body;

        // Additional auth checks can be added here

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ success: false, message: "Message not found" });

        await Message.findByIdAndDelete(messageId);

        try {
            const io = getIO();
            io.to(groupId).emit("message_deleted", messageId);
        } catch (socketErr) {
            console.error("Socket emit failed:", socketErr);
        }

        res.json({ success: true, message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Clear Chat
export const clearChat = async (req, res) => {
    try {
        const { groupId } = req.params;
        await Message.deleteMany({ groupId });

        try {
            const io = getIO();
            io.to(groupId).emit("chat_cleared");
        } catch (socketErr) {
            console.error("Socket emit failed:", socketErr);
        }

        res.json({ success: true, message: "Chat cleared" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
