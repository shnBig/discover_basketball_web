// src/store/modules/user.js
import { defineStore } from 'pinia';
import { loginApi } from '@/api/manager';
import { getUserInfoApi, getMenuListApi } from '@/api/user';
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    roles: [],
    menus: [],
  }),
  actions: {
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm);
        // data 结构：{ id, username, nickname, token, roles, permissions ... }
        // if(data != 0){
        //   //登录失败
        //   message.error('登录失败');
        //   return 0;
        // }
        this.token = res.data.token;
        this.roles = res.data.roles;
        this.userInfo = res.data;
        // 持久化存储 token
        localStorage.setItem('token', res.data.token);
        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async getUserInfo() {
      try {
        const res = await getUserInfoApi();
        this.userInfo = res.data;
        this.roles = res.data.roles;
        this.permissions = res.data.permissions;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async getMenuList() {
      try {
        const res = await getMenuListApi();
        this.menus = res.data;
        return res.data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    setMenus(menus) {
      this.menus = menus;
    },
    // 退出登录
    logout() {
      this.token = '';
      this.userInfo = null;
      this.roles = [];
      this.permissions = [];
      this.menus = [];
      localStorage.removeItem('token');
    }
  }
});