import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";




import authRoutes from "./routes/auth.js";
import classRoutes from "./routes/classes.js";
import taskRoutes from "./routes/tasks.js";
import noteRoutes from "./routes/notes.js";
import notificationRoutes from "./routes/notifications.js";
import communityRoutes from "./routes/community.js";
import deadlineRoutes from "./routes/deadlines.js";
import resonanceRoutes from "./routes/resonance.js";
import chatRoutes from "./routes/chat.js";



import { createServer } from "http";
import { initSocket } from "./socket.js";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// 1. Logger first to see everything
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);

  // Capture response finish to log status
  res.on('finish', () => {
    console.log(`xB4 ${req.method} ${req.url} -> ${res.statusCode}`);
  });

  next();
});

// 2. Allow ALL CORS (Fixes 403 issues with Proxy)
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/resonance", resonanceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/deadlines", deadlineRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("OptiCam Backend Running");
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


