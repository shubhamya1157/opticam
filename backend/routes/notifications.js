import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.put("/mark-all-read", markAllAsRead);

export default router;
