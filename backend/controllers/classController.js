import Class from "../models/Class.js";
import User from "../models/Users.js";
import Notification from "../models/Notification.js";

// GET Classes for User's Branch/Section
export const getClasses = async (req, res) => {
    const { branch, section } = req.query;

    if (!branch || !section) {
        return res.status(400).json({ message: "Branch and Section required" });
    }

    try {
        const classes = await Class.find({ branch, section }).sort({ startTime: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST Add Class (CR Only)
export const addClass = async (req, res) => {
    const { subject, startTime, endTime, room, branch, section, userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'cr') {
            return res.status(403).json({ message: "Only CRs can add classes" });
        }

        const newClass = await Class.create({
            subject,
            startTime,
            endTime,
            room,
            branch,
            section,
            addedBy: userId
        });

        res.status(201).json(newClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT Update Status (CR Only)
export const updateClassStatus = async (req, res) => {
    const { status, userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'cr') {
            return res.status(403).json({ message: "Only CRs can update class status" });
        }

        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (status === 'canceled') {
            const students = await User.find({
                branch: updatedClass.branch,
                section: updatedClass.section
            });

            const notifications = students.map(student => ({
                userId: student._id,
                message: `📢 Class Canceled: ${updatedClass.subject} (${updatedClass.startTime}) has been canceled by CR.`,
                type: 'cancellation'
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
                console.log(`✅ Sent ${notifications.length} cancellation notifications.`);
            }
        }

        res.json(updatedClass);
    } catch (err) {
        console.error("Update Status Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// DELETE Class (CR Only)
export const deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.json({ message: "Class deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
