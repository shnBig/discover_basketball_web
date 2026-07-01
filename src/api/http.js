import axios from 'axios';
import { message, notification } from 'ant-design-vue';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
// import { useUserStore } from '@/stores/user'; // 假设你用 Pinia 管理用户信息
import router from '@/router';

// 1. 创建实例
const service = axios.create({
  baseURL: '/api', // 基础路径
  timeout: 100000, // 超时时间
});

// NProgress 配置（关闭右上角螺旋加载图）
nprogress.configure({ showSpinner: false });

// 2. 请求拦截器
service.interceptors.request.use(
  (config) => {
    nprogress.start(); // 开启进度条
    // 添加请求头
    config.headers['X-Client-Type'] = 'admin-system';
    // 从 localStorage 或 Pinia 获取 token
    const token = localStorage.getItem('token'); 
    if (token) {
      // 这里的 Authorization 格式根据后端要求调整（如 'Bearer ' + token）
      config.headers['Authorization'] ="Bearer " + token;
    }
    return config;
  },
  (error) => {
    nprogress.done();
    return Promise.reject(error);
  }
);

// 3. 响应拦截器
service.interceptors.response.use(
  (response) => {
    nprogress.done();
    const res = response.data;
    // 适配你的后端：code 不等于 200 视为失败
    if (res.code !== 200) {
      message.error(res.msg || '执行失败');
      if (res.code === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return response;
  },
  (error) => {
    nprogress.done();

    // 处理 HTTP 状态码错误 (404, 500, 403 等)
    let errMsg = '网络请求失败';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errMsg = '身份验证过期，请重新登录';
          localStorage.removeItem('token');
          router.push('/login');
          break;
        case 403:
          errMsg = '拒绝访问，您没有权限';
          break;
        case 404:
          errMsg = '请求地址不存在';
          break;
        case 500:
          errMsg = '服务器内部错误';
          break;
        default:
          errMsg = error.response.data?.message || errMsg;
      }
    } else if (error.message.includes('timeout')) {
      errMsg = '网络请求超时';
    }

    notification.error({
      message: '请求错误',
      description: errMsg,
    });

    return Promise.reject(error);
  }
);

export default service;