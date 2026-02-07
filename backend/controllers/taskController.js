import Task from "../models/Task.js";
import User from "../models/Users.js";

// GET all tasks for a specific user
export const getTasks = async (req, res) => {
    const { userId } = req.query;
    try {
        const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ADD Task
export const addTask = async (req, res) => {
    const { userId, title, type, duration, priority, note } = req.body;

    if (!userId || !title) {
        return res.status(400).json({ message: "UserId and Title required" });
    }

    try {
        const newTask = await Task.create({
            userId,
            title,
            type,
            priority: priority || 'medium',
            duration: duration || 0,
            note
        });
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

// COMPLETE Task & Award XP
export const completeTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: "Task not found" });

        if (task.completed) {
            return res.status(400).json({ msg: "Task already completed" });
        }

        task.completed = true;
        task.completedAt = new Date();
        await task.save();

        const user = await User.findById(task.userId);
        if (user) {
            const xpGained = 50 + (task.duration || 0);
            user.xp += xpGained;

            const today = new Date();
            const lastDate = user.stats.lastTaskDate ? new Date(user.stats.lastTaskDate) : null;

            user.stats.tasksCompleted += 1;
            user.stats.focusMinutes += (task.duration || 0);

            if (lastDate) {
                const isToday = today.toDateString() === lastDate.toDateString();
                const isYesterday = new Date(new Date(today).setDate(today.getDate() - 1)).toDateString() === lastDate.toDateString();

                const now = new Date();

                if (!isToday) {
                    if (isYesterday) {
                        user.stats.currentStreak += 1;
                    } else {
                        user.stats.currentStreak = 1;
                    }
                    user.stats.lastTaskDate = now;
                }
            } else {
                user.stats.currentStreak = 1;
                user.stats.lastTaskDate = new Date();
            }

            const newLevel = 1 + Math.floor(user.xp / 1000);
            if (newLevel > user.level) {
                user.level = newLevel;
            }
            await user.save();

            return res.json({ task, user, xpGained });
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// DELETE Task
export const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: "Task deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
