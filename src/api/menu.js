import request from './http';

// 分页查询菜单
export async function getMenuPage(params) {
  try {
    const res = await request.get("/menu/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 根据ID查询菜单
export async function getMenuDetail(id) {
  try {
    const res = await request.get(`/menu/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取所有菜单列表
export async function getAllMenu() {
  try {
    const res = await request.get("/menu/list");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取菜单树形结构
export async function getMenuTree() {
  try {
    const res = await request.get("/menu/tree");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 创建菜单
export async function addMenu(data) {
  try {
    const res = await request.post("/menu", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 更新菜单
export async function updateMenu(data) {
  try {
    const res = await request.put("/menu", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除菜单
export async function deleteMenu(id) {
  try {
    const res = await request.delete(`/menu/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 批量删除菜单
export async function batchDeleteMenu(ids) {
  try {
    const res = await request.delete("/menu", { params: { ids: ids.join(",") } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
