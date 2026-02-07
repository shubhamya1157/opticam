import express from "express";
import upload from "../middleware/upload.js";
import {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getMessages,
    sendMessage,
    uploadFile,
    deleteMessage,
    clearChat
} from "../controllers/communityController.js";

const router = express.Router();

router.get("/groups/:userId", getGroups);
router.post("/groups", createGroup);
router.put("/groups/:id", updateGroup);
router.delete("/groups/:id", deleteGroup);

router.get("/groups/:groupId/messages", getMessages);
router.post("/groups/:groupId/messages", sendMessage);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/groups/:groupId/messages/:messageId", deleteMessage);
router.delete("/groups/:groupId/messages", clearChat);

export default router;
