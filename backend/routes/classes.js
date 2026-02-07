import express from "express";
import {
    getClasses,
    addClass,
    updateClassStatus,
    deleteClass
} from "../controllers/classController.js";

const router = express.Router();

router.get("/", getClasses);
router.post("/", addClass);
router.put("/:id/status", updateClassStatus);
router.delete("/:id", deleteClass);

export default router;
