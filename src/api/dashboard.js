import request from './http';

// 获取仪表盘统计数据
export const getDashboardData = async (days = 7) => {
  try {
    const res = await request.get("/admin/dashboard", { params: { days } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
