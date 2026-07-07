import axios from 'axios';

const amapHttp = axios.create({
  baseURL: 'https://restapi.amap.com',
  timeout: 10000,
});

// 请求拦截器：自动带上 key 参数
amapHttp.interceptors.request.use((config) => {
  config.params = {
    key: import.meta.env.VITE_AMAP_KEY,
    ...config.params,
  };
  return config;
});

// 响应拦截器
amapHttp.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.status === '1') {
      return data;
    }
    return Promise.reject(new Error(data.info || '请求失败'));
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default amapHttp;
