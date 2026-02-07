import axios from "axios";

const API_URL = "/api/deadlines";

// Get all deadlines
export const fetchDeadlines = async (userId) => {
    return await axios.get(API_URL, { params: { userId } });
};

// Create a new deadline (CR Only)
export const addDeadline = async (deadlineData) => {
    return await axios.post(API_URL, deadlineData);
};

// Delete a deadline (CR Only)
export const deleteDeadline = async (id, userId) => {
    return await axios.delete(`${API_URL}/${id}`, { data: { userId } });
};
