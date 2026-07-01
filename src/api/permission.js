import request from './http';

export async function getPermissionPage(params) {
  try {
    const res = await request.get("/admin/permission/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addPermission(data) {
  try {
    const res = await request.post("/admin/permission/add", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除权限
export async function deletePermission(id) {
    try {
    const res = await request.delete(`/admin/permission/delete/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
// 更新权限
export async function updatePermission(data) {
  try {
    const res = await request.put("/admin/permission/update", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取权限详情
export async function getPermissionDetail(id) {
  try {
    const res = await request.get(`/admin/permission/get/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取所有的权限
export async function getAllPermission() {
  try {
    const res = await request.get("/admin/permission/list");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
} 