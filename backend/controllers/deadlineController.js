import Deadline from '../models/Deadline.js';
import User from '../models/Users.js';

// Get Deadlines
export const getDeadlines = async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};

        if (userId) {
            query = {
                $or: [
                    { type: { $ne: 'personal' } },
                    { type: 'personal', createdBy: userId }
                ]
            };
        } else {
            query = { type: { $ne: 'personal' } };
        }

        const deadlines = await Deadline.find(query).sort({ deadline: 1 });
        res.json(deadlines);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create Deadline
export const createDeadline = async (req, res) => {
    const { title, type, deadline, description, userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isCR = user.role === 'cr';
        const finalType = isCR ? type : 'personal';

        const newDeadline = new Deadline({
            title,
            type: finalType,
            deadline,
            description,
            createdBy: userId
        });

        const savedDeadline = await newDeadline.save();
        res.json(savedDeadline);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Deadline
export const deleteDeadline = async (req, res) => {
    try {
        const { userId } = req.body;

        const deadline = await Deadline.findById(req.params.id);
        if (!deadline) {
            return res.status(404).json({ msg: 'Deadline not found' });
        }

        const user = await User.findById(userId);
        const isCR = user?.role === 'cr';
        const isOwner = deadline.createdBy.toString() === userId;

        if (isOwner || (isCR && deadline.type !== 'personal')) {
            await deadline.deleteOne();
            res.json({ msg: 'Deadline removed' });
        } else {
            res.status(403).json({ msg: 'Not authorized to delete this event.' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
