import { Server } from "socket.io";

let io;
const onlineUsers = new Map(); // userId -> socketId mapping

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all for now, revert to specific in prod if needed
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);

        // User joins their own private room for 1-on-1 chats
        socket.on("join_user_room", (userId) => {
            socket.join(`user_${userId}`);
            socket.userId = userId; // Store userId on socket for tracking

            // Mark user as online
            onlineUsers.set(userId, socket.id);
            io.emit("user_online", { userId, socketId: socket.id });

            console.log(`👤 User ${userId} joined (Online users: ${onlineUsers.size})`);
        });

        // 🟢 Typing Indicators
        socket.on("typing_start", ({ targetUserId, typerName }) => {
            io.to(`user_${targetUserId}`).emit("user_typing", { typerName, isTyping: true });
        });

        socket.on("typing_stop", ({ targetUserId }) => {
            io.to(`user_${targetUserId}`).emit("user_typing", { isTyping: false });
        });

        // 🟢 Live Connect: Request
        socket.on("request_connection", (data) => {
            const { targetUserId, requester } = data;
            console.log(`✨ Connection Request: ${requester.username} -> ${targetUserId}`);
            io.to(`user_${targetUserId}`).emit("incoming_request", requester);
        });

        // 🟢 Live Connect: Accept
        socket.on("accept_connection", (data) => {
            const { targetUserId, accepter } = data;
            console.log(`✅ Connection Accepted: ${accepter.username} -> ${targetUserId}`);
            io.to(`user_${targetUserId}`).emit("request_accepted", accepter);
        });

        // 🔴 Live Connect: End Chat (Ephemeral Wipe)
        socket.on("end_chat", async (data) => {
            const { targetUserId, endedBy } = data;
            console.log(`🛑 Chat Ended by ${endedBy}`);

            // Notify both parties to close UI
            io.to(`user_${targetUserId}`).emit("chat_ended", { endedBy });
            io.to(`user_${endedBy}`).emit("chat_ended", { endedBy });
        });

        socket.on("join_group", (groupId) => {
            socket.join(groupId);
            console.log(`👤 User ${socket.id} joined group: ${groupId}`);
        });

        socket.on("leave_group", (groupId) => {
            socket.leave(groupId);
            console.log(`👋 User ${socket.id} left group: ${groupId}`);
        });

        socket.on("disconnect", () => {
            // Mark user as offline
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit("user_offline", { userId: socket.userId });
                console.log(`❌ User ${socket.userId} disconnected (Online: ${onlineUsers.size})`);
            } else {
                console.log("❌ Client disconnected:", socket.id);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};
