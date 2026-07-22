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

//分页查询球场
export async function getCourtPage(params) {
  try {
    const res = await request.get("/court/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}


// 获取球场详情
export async function getCourtDetail(id) {
  try {
    const res = await request.get(`/court/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 添加球场
export async function addCourt(data) {
  try {
    const res = await request.post("/court/admin", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 编辑球场
export async function updateCourt(id, data) {
  try {
    const res = await request.put(`/court/admin/${id}`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 修改球场状态
export async function updateCourtStatus(id, status) {
  try {
    const res = await request.put(`/admin/court/${id}/status`, { status });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除球场
export async function deleteCourt(id) {
  try {
    const res = await request.delete(`/court/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 按经纬度范围获取球场（地图用）
export async function getCourtsNearby(params) {
  try {
    const res = await request.get("/admin/court/nearby", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}


// 审核球场接口
export async function auditCourt(params) {
  
  try {
    const res = await request.put(`/court/audit/${params.id}`, params);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 球场图片分页查询
export async function getCourtImagePage(params) {
  try {
    const res = await request.get("/court/image/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}