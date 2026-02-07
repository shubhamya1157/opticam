import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: "General"
    },
    color: {
        type: String,
        default: "#1e1e1e" // Default dark card color
    },
    isPinned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Note", noteSchema);
