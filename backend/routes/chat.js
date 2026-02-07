import express from "express";
import { sendMessage, getChatHistory, deleteConversation, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, getPendingRequests } from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All chat routes require authentication
router.use(auth);

router.post("/send", sendMessage);
router.post("/delete", deleteConversation); // New route for ephemeral chat
router.post("/request", sendConnectionRequest);
router.post("/accept", acceptConnectionRequest);
router.post("/reject", rejectConnectionRequest);
router.get("/requests", getPendingRequests);

export default router;
