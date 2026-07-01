import request from '@/api/http';

// 上传文件到 COS
export async function uploadFileImage(data) {
  try {
    const res = await request.post('/cos/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}