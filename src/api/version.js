import request from './http';

export async function getAppVersion() {
  try {
    const res = await request.get('/admin/app/version');
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateAppVersion(data) {
  try {
    const res = await request.put('/admin/app/version', data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}