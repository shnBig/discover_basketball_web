import request from './http';

// 登录
export const loginApi = async (data) => {
  try {
    const res = await request.post("/admin/login", data);
    return res.data;
  } catch (err) {
    return Promise.reject(`登录失败${err}`)
  }
}

// 刷新 Token
export const refreshTokenApi = async (data) => {
  try {
    const res = await request.post('/admin/refresh_token', data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 注册补全
export const registerUser = async (data) => {
  try {
    const res = await request.post('/admin/register', data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getManagerPage(params) {
  try {
    const res = await request.get("/admin/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addManager(data) {
  try {
    const res = await request.post("/admin/add", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除管理员
export async function deleteManager(id) {
    try {
    const res = await request.delete(`/admin/delete/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
// 更新管理员
export async function updateManager(data) {
  try {
    const res = await request.put("/admin/update", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
//修改状态
export async function updateManagerStatus(data) {
  try {
    const res = await request.put("/admin/status", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
//修改密码
export async function updateManagerPassword(data){
  try {
    const res = await request.put("/admin/password", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取管理员详情
export async function getManagerDetail(id) {    
  try {
    const res = await request.get(`/admin/get/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取所有的权限
export async function getAllManager() {
  try {
    const res = await request.get("/admin/list");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
} 

