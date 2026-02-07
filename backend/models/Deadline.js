import mongoose from 'mongoose';

const DeadlineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['assignment', 'quiz', 'exam', 'project', 'lab', 'presentation', 'personal'],
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Deadline = mongoose.model('Deadline', DeadlineSchema);
export default Deadline;
