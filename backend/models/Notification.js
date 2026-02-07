import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        default: "Notification"
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["info", "alert", "cancellation", "success", "assignment", "exam", "system"],
        default: "info"
    },
    link: {
        type: String, // e.g., "/tasks" or "/community"
        default: ""
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
