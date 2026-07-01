import request from './http';

// 获取仪表盘统计数据
export const getDashboardData = async () => {
  try {
    const res = await request.get("/admin/dashboard/statistics");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取用户注册趋势数据
export const getUserTrend = async (days = 7) => {
  try {
    const res = await request.get("/admin/dashboard/user-trend", { params: { days } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取订单交易趋势数据
export const getOrderTrend = async (days = 7) => {
  try {
    const res = await request.get("/admin/dashboard/order-trend", { params: { days } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}