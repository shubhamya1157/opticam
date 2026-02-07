import mongoose from "mongoose";

const SignalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 280 // Tweet-like length for quick scanning
    },
    tags: [{
        type: String,
        trim: true
    }],
    contact: { // Optional contact info (link or handle)
        type: String,
        trim: true
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 24 * 60 * 60 * 1000, // Auto-expire in 24h
        index: { expires: '0s' } // MongoDB TTL index
    }
}, { timestamps: true });

export default mongoose.model("Signal", SignalSchema);
