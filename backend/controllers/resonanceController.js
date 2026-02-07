import ResonanceTask from "../models/ResonanceTask.js";
import { getIO } from "../socket.js";

// Create a new task
export const createTask = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: "Title, description, and category are required"
            });
        }

        const newTask = new ResonanceTask({
            ownerId: req.user.id,
            ownerName: req.user.name,
            title,
            description,
            category,
            tags: tags || []
        });

        await newTask.save();

        // Broadcast new task to all users (optional)
        const io = getIO();
        io.emit("new_task_created", newTask);

        res.status(201).json({ success: true, data: newTask });
    } catch (err) {
        console.error("❌ Create Task Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all open tasks (with optional filters)
export const getTasks = async (req, res) => {
    try {
        const { category, tag, search } = req.query;

        let query = { status: { $in: ["open", "in_progress"] } };

        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tasks = await ResonanceTask.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: tasks });
    } catch (err) {
        console.error("❌ Get Tasks Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get user's created tasks
export const getMyTasks = async (req, res) => {
    try {
        const tasks = await ResonanceTask.find({ ownerId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: tasks });
    } catch (err) {
        console.error("❌ Get My Tasks Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete own task
export const deleteTask = async (req, res) => {
    try {
        const task = await ResonanceTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (task.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await task.deleteOne();

        // Notify connected users
        const io = getIO();
        task.activeConnections.forEach(userId => {
            io.to(`user_${userId}`).emit("task_deleted", { taskId: task._id });
        });

        res.json({ success: true, message: "Task deleted" });
    } catch (err) {
        console.error("❌ Delete Task Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await ResonanceTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (task.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        task.status = status;
        await task.save();

        res.json({ success: true, data: task });
    } catch (err) {
        console.error("❌ Update Task Status Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Request to connect on a task
export const requestConnection = async (req, res) => {
    try {
        const { taskId, message } = req.body;
        const task = await ResonanceTask.findById(taskId);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Check if already requested
        const existingRequest = task.connectionRequests.find(
            r => r.userId.toString() === req.user.id && r.status === "pending"
        );

        if (existingRequest) {
            return res.status(400).json({ success: false, message: "Request already sent" });
        }

        // Add connection request
        task.connectionRequests.push({
            userId: req.user.id,
            userName: req.user.name,
            message: message || "",
            status: "pending"
        });

        await task.save();

        // Notify task owner
        const io = getIO();
        io.to(`user_${task.ownerId}`).emit("connection_request", {
            taskId: task._id,
            taskTitle: task.title,
            requester: {
                id: req.user.id,
                name: req.user.name
            },
            message
        });

        res.json({ success: true, message: "Connection request sent" });
    } catch (err) {
        console.error("❌ Request Connection Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Approve connection request
export const approveConnection = async (req, res) => {
    try {
        const { taskId, requesterId } = req.body;
        const task = await ResonanceTask.findById(taskId);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (task.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Find and update request
        const request = task.connectionRequests.find(
            r => r.userId.toString() === requesterId && r.status === "pending"
        );

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        request.status = "approved";

        // Add to active connections
        if (!task.activeConnections.includes(requesterId)) {
            task.activeConnections.push(requesterId);
        }

        await task.save();

        // Notify requester
        const io = getIO();
        io.to(`user_${requesterId}`).emit("connection_approved", {
            taskId: task._id,
            taskTitle: task.title,
            ownerId: task.ownerId,
            ownerName: task.ownerName
        });

        res.json({ success: true, data: task });
    } catch (err) {
        console.error("❌ Approve Connection Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Reject connection request
export const rejectConnection = async (req, res) => {
    try {
        const { taskId, requesterId } = req.body;
        const task = await ResonanceTask.findById(taskId);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (task.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Find and update request
        const request = task.connectionRequests.find(
            r => r.userId.toString() === requesterId && r.status === "pending"
        );

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        request.status = "rejected";
        await task.save();

        // Notify requester
        const io = getIO();
        io.to(`user_${requesterId}`).emit("connection_rejected", {
            taskId: task._id,
            taskTitle: task.title
        });

        res.json({ success: true, data: task });
    } catch (err) {
        console.error("❌ Reject Connection Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get pending requests for user's tasks
export const getMyRequests = async (req, res) => {
    try {
        const tasks = await ResonanceTask.find({
            ownerId: req.user.id,
            "connectionRequests.status": "pending"
        });

        // Extract pending requests
        const requests = tasks.flatMap(task =>
            task.connectionRequests
                .filter(r => r.status === "pending")
                .map(r => ({
                    taskId: task._id,
                    taskTitle: task.title,
                    requester: {
                        id: r.userId,
                        name: r.userName
                    },
                    message: r.message,
                    timestamp: r.timestamp
                }))
        );

        res.json({ success: true, data: requests });
    } catch (err) {
        console.error("❌ Get My Requests Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
