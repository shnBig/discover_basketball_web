import request from './http';

export async function getChatSessions(params) {
  try {
    const res = await request.get("/message/chat/admin/chat/sessions", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getChatHistory(params) {
  try {
    const res = await request.get("/message/chat/admin/chat/history", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getUserChatSessions(userId) {
  try {
    const res = await request.get(`/message/chat/admin/chat/sessions/user/${userId}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}