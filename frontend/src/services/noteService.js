import api from "./api";

// Get all notes for a user
export const fetchNotes = async (userId) => {
    return await api.get(`/notes?userId=${userId}`);
};

// Add a new note
export const addNote = async (noteData) => {
    return await api.post("/notes", noteData);
};

// Update a note
export const updateNote = async (id, noteData) => {
    return await api.put(`/notes/${id}`, noteData);
};

// Delete a note
export const deleteNote = async (id) => {
    return await api.delete(`/notes/${id}`);
};
