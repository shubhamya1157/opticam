import api from "./api";

// Get all tasks for a user
export const fetchTasks = async (userId) => {
    return await api.get(`/tasks?userId=${userId}`);
};

// Add a new task
export const addTask = async (taskData) => {
    return await api.post("/tasks", taskData);
};

// Mark task as complete
export const completeTask = async (id) => {
    return await api.put(`/tasks/${id}/complete`);
};

// Delete a task
export const deleteTask = async (id) => {
    return await api.delete(`/tasks/${id}`);
};

// Fetch achievements (Mock for now as backend logic isn't fully defined for this yet)
export const fetchAchievements = async () => {
    // You might want to create a backend route for this later
    return { data: [] };
};
