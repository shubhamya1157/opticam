import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  collegeId: String,
  role: String,
  year: String,
  semester: String,
  branch: String,
  section: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  stats: {
    tasksCompleted: { type: Number, default: 0 },
    focusMinutes: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastTaskDate: { type: Date, default: null }
  },
  dailyRoutine: [{
    activity: { type: String, required: true },
    startTime: { type: String, required: true }, // Format "HH:mm"
    endTime: { type: String, required: true },   // Format "HH:mm"
    color: { type: String, default: "#3b82f6" },
    category: { type: String, enum: ['fixed', 'productive', 'rest', 'leisure'], default: 'fixed' }
  }],
  pendingConnectionRequests: [{
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);

