import express from "express";
import { sendMessage, getChatHistory } from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All chat routes require authentication
router.use(auth);

router.post("/send", sendMessage);
router.get("/history/:userId", getChatHistory);

export default router;
