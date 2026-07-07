// src/api/user.js
import request from '@/api/http';

// 菜单路由（导航用）
export const getMenuListApi = async () => {
  try {
    const res = await request.get("/menu/routes");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 分页查询小程序用户列表
export async function getUserPage(params) {
  try {
    const res = await request.get("/admin/user/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 查询小程序用户详情
export async function getUserDetail(id) {
  try {
    const res = await request.get(`/admin/user/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 修改小程序用户状态（封禁/解封）
export async function updateUserStatus(data) {
  try {
    const res = await request.put("/admin/user/status", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除小程序用户
export async function deleteUser(id) {
  try {
    const res = await request.delete(`/admin/user/${id}`);  
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 批量删除小程序用户
export async function batchDeleteUser(ids) {
  try {
    const res = await request.delete("/admin/user", { params: { ids: ids.join(",") } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
