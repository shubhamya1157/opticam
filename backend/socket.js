import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all for now, revert to specific in prod if needed
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);

        socket.on("join_group", (groupId) => {
            socket.join(groupId);
            console.log(`👤 User ${socket.id} joined group: ${groupId}`);
        });

        socket.on("leave_group", (groupId) => {
            socket.leave(groupId);
            console.log(`👋 User ${socket.id} left group: ${groupId}`);
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
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
