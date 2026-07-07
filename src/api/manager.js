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
    const res = await request.post('/user/refresh_token', data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 注册管理员
export async function addManager(data) {
  try {
    const res = await request.post("/admin", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 更新管理员
export async function updateManager(data) {
  try {
    const res = await request.put("/admin", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 分页查询管理员
export async function getManagerPage(params) {
  try {
    const res = await request.get("/admin/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 根据ID查询管理员
export async function getManagerDetailApi(id) {
  try {
    const res = await request.get(`/admin/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取当前管理员信息
export async function getManagerInfo() {
  try {
    const res = await request.get("/admin/info");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除管理员
export async function deleteManager(id) {
  try {
    const res = await request.delete(`/admin/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 批量删除管理员
export async function batchDeleteAdmin(ids) {
  try {
    const res = await request.delete("/admin", { params: { ids: ids.join(",") } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 修改密码
export async function updateManagerPassword(data) {
  try {
    const res = await request.put("/admin/password", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 给管理员分配角色
export async function assignRoles(data) {
  try {
    const res = await request.post("/admin/assignRoles", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
