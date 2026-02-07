import Note from "../models/Note.js";

// GET all notes for a user
export const getNotes = async (req, res) => {
    const { userId } = req.query;
    try {
        const notes = await Note.find({ userId }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ADD Note
export const addNote = async (req, res) => {
    const { userId, title, content, category, color, isPinned } = req.body;
    try {
        const newNote = await Note.create({
            userId,
            title,
            // title was repeated in original code, fixed here
            content,
            category,
            color,
            isPinned
        });
        res.status(201).json(newNote);
    } catch (err) {
        console.error("Error adding note:", err.message, req.body);
        res.status(400).json({ msg: err.message });
    }
};

// UPDATE Note
export const updateNote = async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// DELETE Note
export const deleteNote = async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ msg: "Note deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
