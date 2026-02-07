import mongoose from "mongoose";

const ResonanceTaskSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        required: true,
        enum: ["Study Help", "Project Collaboration", "Skill Exchange", "Other"]
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: ["open", "in_progress", "completed"],
        default: "open"
    },
    connectionRequests: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        message: {
            type: String,
            trim: true,
            maxlength: 200
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    activeConnections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    expiresAt: {
        type: Date,
        default: () => Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        index: { expires: '0s' }
    }
}, { timestamps: true });

// Indexes for efficient queries
ResonanceTaskSchema.index({ ownerId: 1, status: 1 });
ResonanceTaskSchema.index({ category: 1, status: 1 });
ResonanceTaskSchema.index({ tags: 1, status: 1 });
ResonanceTaskSchema.index({ createdAt: -1 });

export default mongoose.model("ResonanceTask", ResonanceTaskSchema);
