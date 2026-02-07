import express from "express";
import { broadcastSignal, tuneSignals } from "../controllers/resonanceController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/broadcast", auth, broadcastSignal);
router.get("/tune", auth, tuneSignals);

export default router;
