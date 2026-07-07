import request from './http';

// 查询球场列表
export async function getCourtList(params) {
  try {
    const res = await request.get("/court/query", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}


// 获取球场详情
export async function getCourtDetail(id) {
  try {
    const res = await request.get(`/admin/courts/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 添加球场
export async function addCourt(data) {
  try {
    const res = await request.post("/court", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 编辑球场
export async function updateCourt(id, data) {
  try {
    const res = await request.put(`/admin/courts/${id}`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 修改球场状态
export async function updateCourtStatus(id, status) {
  try {
    const res = await request.put(`/admin/courts/${id}/status`, { status });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除球场
export async function deleteCourt(id) {
  try {
    const res = await request.delete(`/admin/courts/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 按经纬度范围获取球场（地图用）
export async function getCourtsNearby(params) {
  try {
    const res = await request.get("/admin/courts/nearby", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
