import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String, // daily, weekly, monthly
        enum: ["daily", "weekly", "monthly"],
        default: "daily"
    },
    priority: {
        type: String, // high, medium, low
        enum: ["high", "medium", "low"],
        default: "medium"
    },
    duration: Number, // in minutes
    note: String,
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: Date
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
