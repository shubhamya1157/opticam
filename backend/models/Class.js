import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    startTime: {
        type: String, // Format: "09:00"
        required: true
    },
    endTime: {
        type: String, // Format: "10:30"
        required: true
    },
    room: String,
    branch: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["scheduled", "conducted", "canceled"],
        default: "scheduled"
    },
    date: {
        type: Date,
        default: Date.now // For simplicity, assumes daily schedule resets or filter by date
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export default mongoose.model("Class", classSchema);
