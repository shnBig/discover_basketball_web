import request from './http';

// 分页查询城市配置
export async function getCityPage(params) {
  try {
    const res = await request.get("/admin/city/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取已开放城市列表
export async function getOpenCityList() {
  try {
    const res = await request.get("/admin/city/open_cities");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 根据ID查询城市配置详情
export async function getCityDetail(id) {
  try {
    const res = await request.get(`/admin/city/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 创建城市配置
export async function addCity(data) {
  try {
    const res = await request.post("/admin/city", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 更新城市配置
export async function updateCity(data) {
  try {
    const res = await request.put("/admin/city", data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除城市配置
export async function deleteCity(id) {
  try {
    const res = await request.delete(`/admin/city/${id}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 批量删除城市配置
export async function batchDeleteCity(ids) {
  try {
    const res = await request.delete("/admin/city", { params: { ids: ids.join(",") } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取城市名称和城市编码
export async function getCityNameAndCode() {
  try {
    const res = await request.get("/admin/city/city_and_code");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}