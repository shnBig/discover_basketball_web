import request from './http';

// 分页查询角色
export async function getRolePage(params) {
  try {
    const res = await request.get("/role/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 根据ID查询角色
export async function getRoleDetail(id) {
  try {
    const res = await request.get(`/role/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取所有角色列表
export async function getAllRole() {
  try {
    const res = await request.get("/role/list");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 创建角色
export async function addRole(data) {
  try {
    const res = await request.post("/role", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 更新角色
export async function updateRole(data) {
  try {
    const res = await request.put("/role", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除角色
export async function deleteRole(id) {
  try {
    const res = await request.delete(`/role/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 批量删除角色
export async function batchDeleteRole(ids) {
  try {
    const res = await request.delete("/role", { params: { ids: ids.join(",") } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 给角色分配菜单
export async function assignMenus(data) {
  try {
    const res = await request.post("/role/assignMenus", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
