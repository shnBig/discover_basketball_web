import request from '@/api/http';
import { compressImage } from '@/utils/compressImage';

// 上传文件到 COS（自动压缩图片）
export async function uploadFileImage(data) {
  try {
    // 如果 data 是 FormData，自动压缩其中的图片文件
    if (data instanceof FormData) {
      const file = data.get('file');
      if (file instanceof File) {
        const compressed = await compressImage(file);
        data.set('file', compressed);
      }
    }
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