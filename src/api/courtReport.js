import request from './http';

// 分页查询球场反馈
export async function getCourtReportPage(params) {
  try {
    const res = await request.get('/court-report/admin/page', { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取球场反馈详情
export async function getCourtReportDetail(id) {
  try {
    const res = await request.get(`/court-report/admin/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 处理球场反馈
export async function handleCourtReport(id, data) {
  try {
    const res = await request.put(`/court-report/admin/handle/${id}`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除球场反馈
export async function deleteCourtReport(id) {
  try {
    const res = await request.delete(`/court-report/admin/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
