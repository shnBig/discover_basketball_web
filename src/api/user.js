// src/api/user.js
import request from '@/api/http';

export const getUserInfoApi = async () => {
    try {
        const res = await request.get("/admin/list");
        return res.data;
    } catch (error) {
        return Promise.reject(error);
    }
}
export const getMenuListApi = async () => {
    try {
        const res = await request.get("/menu/routes");
        return res.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

// 获取用户列表
export async function getUserPage(params) {
  try {
    const res = await request.post("/admin/page",  params );
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addUser(data) {
  try {
    const res = await request.post("/admin/add", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除用户
export async function deleteUser(id) {
    try {
    const res = await request.delete(`/admin/delete/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
// 更新用户
export async function updateUser(data) {
  try {
    const res = await request.put("/admin/update", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
//修改状态
export async function updateUserStatus(data) {
  try {
    const res = await request.put("/admin/status", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
//修改密码
export async function updateUserPassword(data){
  try {
    const res = await request.put("/admin/password", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取用户详情
export async function getUserDetail(id) {    
  try {
    const res = await request.get(`/admin/info/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
