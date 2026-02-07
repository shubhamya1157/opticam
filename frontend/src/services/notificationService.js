import api from "./api";

// Get user notifications
export const fetchNotifications = async (userId) => {
    return await api.get(`/notifications?userId=${userId}`);
};

// Mark as read
export const markNotificationRead = async (id) => {
    return await api.put(`/notifications/${id}/read`);
};

// Mark all as read
export const markAllNotificationsRead = async (userId) => {
    return await api.put(`/notifications/mark-all-read`, { userId });
};
