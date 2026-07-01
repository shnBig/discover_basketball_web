import request from './http';

export async function getRolePage(params) {
  try {
    const res = await request.get("/admin/role/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
export async function getAllRole(){
  try {
    const res = await request.get("/admin/role/list");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addRole(data) {
  try {
    const res = await request.post("/admin/role/add", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除角色             
export async function deleteRole(id) {
    try {
    const res = await request.delete(`/admin/role/delete/${id}`); 
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
// 更新角色
export async function updateRole(data) {
  try {
    const res = await request.put("/admin/role/update", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取角色详情
export async function getRoleDetail(id) {
  try {
    const res = await request.get(`/admin/role/get/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 未角色分配权限
export async function assignRolePermission(data) {
  try {
    const res = await request.post("/admin/role/assignPermissions", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
