import api from "./api";
import { dbService, initDB } from "./db";

// Initialize DB on verify
initDB().catch(console.error);

// Helper to handle network-first with cache fallback or cache-first with network update
// For Resonance, we want "Cache First" for speed, then "Network Update"

// Create a new task
export const createTask = async (taskData) => {
    try {
        const res = await api.post("/resonance/create-task", taskData);
        // Save to 'my_tasks' store
        if (res.data.success && res.data.task) {
            await dbService.put('my_tasks', res.data.task);
        }
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to create task");
    }
};

// Get all tasks (Public Signals)
export const getTasks = async (filters = {}) => {
    // 1. Try to fetch from API
    try {
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/resonance/tasks${params ? `?${params}` : ''}`);

        // 2. Update Cache
        if (res.data.tasks) {
            if (Object.keys(filters).length === 0) {
                await dbService.clear('tasks');
            }
            await dbService.put('tasks', res.data.tasks);
        }
        return res.data;
    } catch (err) {
        console.warn("Network failed or Access Denied, falling back to cache", err);

        // 3. Fallback to Cache on Error (including 401 for guests if API is strict)
        const cachedTasks = await dbService.getAll('tasks');
        return { success: true, data: cachedTasks || [], fromCache: true, error: err.message };
    }
};

// Get user's created tasks
export const getMyTasks = async () => {
    try {
        const res = await api.get("/resonance/my-tasks");
        if (res.data.tasks) {
            await dbService.clear('my_tasks');
            await dbService.put('my_tasks', res.data.tasks);
        }
        return res.data;
    } catch (err) {
        console.warn("Network failed, falling back to cache", err);
        const cached = await dbService.getAll('my_tasks');
        return { success: true, tasks: cached, fromCache: true };
    }
};

// Delete a task
export const deleteTask = async (taskId) => {
    try {
        const res = await api.delete(`/resonance/task/${taskId}`);
        // Remove from cache
        await dbService.delete('my_tasks', taskId);
        await dbService.delete('tasks', taskId);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to delete task");
    }
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
    try {
        const res = await api.patch(`/resonance/task/${taskId}/status`, { status });
        // Update cache locally if possible, or trigger fetch
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to update task status");
    }
};

// Request connection on a task
export const requestConnection = async (taskId, message) => {
    try {
        const res = await api.post("/resonance/request-connection", { taskId, message });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to send connection request");
    }
};

// Approve connection request
export const approveConnection = async (taskId, requesterId) => {
    try {
        const res = await api.post("/resonance/approve-connection", { taskId, requesterId });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to approve connection");
    }
};

// Reject connection request
export const rejectConnection = async (taskId, requesterId) => {
    try {
        const res = await api.post("/resonance/reject-connection", { taskId, requesterId });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to reject connection");
    }
};

// Get pending requests for user's tasks
export const getMyRequests = async () => {
    try {
        const res = await api.get("/resonance/my-requests");
        if (res.data.requests) {
            await dbService.clear('requests');
            // Flatten or store as is? Store as is for now if it has ID
            // Check if requests have IDs. Usually yes.
            // If requests are nested, might need handling. Assuming flat array.
            // If structure is complex, we might skip caching for requests for now or adjust db.
        }
        return res.data;
    } catch (err) {
        // Requests are highly dynamic, maybe don't cache aggressively or return empty if offline
        throw new Error(err.response?.data?.message || "Failed to fetch requests");
    }
};

// EXPORT CACHE GETTERS for Instant Load
export const getCachedTasks = async () => {
    return await dbService.getAll('tasks');
};

export const getCachedMyTasks = async () => {
    return await dbService.getAll('my_tasks');
};
