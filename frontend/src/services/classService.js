import api from "./api";

// Fetch classes for a user's branch/section
export const fetchClasses = async (branch, section) => {
    return await api.get(`/classes?branch=${branch}&section=${section}`);
};

// Add a new class (CR Only)
export const addClass = async (classData) => {
    return await api.post("/classes", classData);
};

// Update class status (CR Only)
export const updateClassStatus = async (id, status, userId) => {
    return await api.put(`/classes/${id}/status`, { status, userId });
};

// Delete a class (CR Only)
export const deleteClass = async (id) => {
    return await api.delete(`/classes/${id}`);
};
