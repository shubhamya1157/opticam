import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String, // Emoji or URL
        default: '📢'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    branch: {
        type: String,
        default: 'CSE' // Default or required, depends. Let's make it optional but often present.
    },
    section: {
        type: String,
        default: 'A'
    },
    year: {
        type: String,
        default: '3rd Year'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Group = mongoose.model('Group', GroupSchema);
export default Group;
