import mongoose from 'mongoose';

const PrivateMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for quick retrieval of chat history between two users
PrivateMessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
PrivateMessageSchema.index({ recipient: 1, sender: 1, createdAt: 1 });

const PrivateMessage = mongoose.model('PrivateMessage', PrivateMessageSchema);
export default PrivateMessage;
