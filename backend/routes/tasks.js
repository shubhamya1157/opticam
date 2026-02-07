import express from "express";
import {
    getTasks,
    addTask,
    completeTask,
    deleteTask
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getTasks);
router.post("/", addTask);
router.put("/:id/complete", completeTask);
router.delete("/:id", deleteTask);

export default router;
