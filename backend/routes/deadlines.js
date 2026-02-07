import express from 'express';
import {
    getDeadlines,
    createDeadline,
    deleteDeadline
} from '../controllers/deadlineController.js';

const router = express.Router();

// Middleware to check if user is CR can be kept here or moved to utils if reused often
// For now, the controller handles logic, so we can keep routes simple.
// The original file had a partial middleware definition but didn't seem to use it in all routes fully.
// The controller logic incorporates the necessary checks found in the original routes.

router.get('/', getDeadlines);
router.post('/', createDeadline);
router.delete('/:id', deleteDeadline);

export default router;
