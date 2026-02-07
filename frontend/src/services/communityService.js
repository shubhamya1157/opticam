import api from "./api";

// Get Groups (User specific)
export const fetchGroups = (userId) => api.get(`/community/groups/${userId}`);

// Create Group
export const createGroup = (groupData) => api.post("/community/groups", groupData);

// Update Group
export const updateGroup = (groupId, data) => api.put(`/community/groups/${groupId}`, data);

// Delete Group
export const deleteGroup = (groupId) => api.delete(`/community/groups/${groupId}`);

// Get Messages
export const fetchMessages = (groupId) => api.get(`/community/groups/${groupId}/messages`);

// Send Message
// Send Message
export const sendMessage = (groupId, msgData) => api.post(`/community/groups/${groupId}/messages`, msgData);

// Upload File
export const uploadFile = (formData) => api.post("/community/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

// Delete Message
export const deleteMessage = (groupId, messageId, userId) => api.delete(`/community/groups/${groupId}/messages/${messageId}`, { data: { userId } });

// Clear Chat
export const clearChat = (groupId) => api.delete(`/community/groups/${groupId}/messages`);
