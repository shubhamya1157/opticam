import express from "express";
import {
    createTask,
    getTasks,
    getMyTasks,
    deleteTask,
    updateTaskStatus,
    requestConnection,
    approveConnection,
    rejectConnection,
    getMyRequests
} from "../controllers/resonanceController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Task CRUD
router.post("/create-task", auth, createTask);
router.get("/tasks", getTasks); // Public access to view tasks
router.get("/my-tasks", auth, getMyTasks);
router.delete("/task/:id", auth, deleteTask);
router.patch("/task/:id/status", auth, updateTaskStatus);

// Connection Management
router.post("/request-connection", auth, requestConnection);
router.post("/approve-connection", auth, approveConnection);
router.post("/reject-connection", auth, rejectConnection);
router.get("/my-requests", auth, getMyRequests);

export default router;
