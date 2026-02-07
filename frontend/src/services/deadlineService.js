import axios from "axios";

const API_URL = "http://localhost:5000/api/deadlines";

// Get all deadlines
export const fetchDeadlines = async () => {
    return await axios.get(API_URL);
};

// Create a new deadline (CR Only)
export const addDeadline = async (deadlineData) => {
    return await axios.post(API_URL, deadlineData);
};

// Delete a deadline (CR Only)
export const deleteDeadline = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};
