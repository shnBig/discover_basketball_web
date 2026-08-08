import request from './http';

// 分页查询意见反馈
export async function getFeedbackPage(params) {
  try {
    const res = await request.get('/app-feedback/admin/page', { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取意见反馈详情
export async function getFeedbackDetail(id) {
  try {
    const res = await request.get(`/app-feedback/admin/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 处理意见反馈
export async function handleFeedback(id, data) {
  try {
    const res = await request.put(`/app-feedback/admin/handle/${id}`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 标记小程序意见反馈为已读
export async function markFeedbackRead(id) {
  try {
    const res = await request.put(`/app-feedback/admin/${id}/read`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除意见反馈
export async function deleteFeedback(id) {
  try {
    const res = await request.delete(`/app-feedback/admin/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
