import request from './http';

export async function getOrderPage(params) {
  try {
    const res = await request.get("/order/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getOrderDetail(id) {
  try {
    const res = await request.get(`/order/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function shipOrder(id, data) {
  try {
    const res = await request.post(`/order/${id}/ship`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function refundOrder(id, data) {
  try {
    const res = await request.post(`/order/${id}/refund`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getOrderStatistics() {
  try {
    const res = await request.get("/order/statistics/dashboard");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getOrderTrend(days = 7) {
  try {
    const res = await request.get("/order/statistics/trend", { params: { days } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}