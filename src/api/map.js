import request from './http';

export async function getMapIconApi(params) {
  try {
    const res = await request.get("/map/icon", { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}