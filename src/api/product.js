import request from './http';

// 分页查询
export async function getProductPage(params) {
  try {
    const res = await request.get("/product/page", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取商品统计信息
export async function getProductStatistics() {
  try {
    const res = await request.get("/product/statistics");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取商品分类
export async function getProductCategory() {
  try {
    const res = await request.get("/product/category/list");
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 修改商品状态
export async function updateProductStatus(params) {
  try {
    const res = await request.post("/product/status", params);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 修改商品审核
export async function updateProductAudit(params) {
  try {
    const res = await request.post("/product/manual-audit", params);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}