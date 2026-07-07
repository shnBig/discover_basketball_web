// src/store/modules/user.js
import { defineStore } from 'pinia';
import { loginApi, getManagerInfo } from '@/api/manager';
import { getMenuListApi } from '@/api/user';
import { getOpenCityList } from '@/api/city';
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    roles: JSON.parse(localStorage.getItem('roles') || '[]'),
    menus: [],
    openCourts: [],
  }),
  actions: {
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm);
        this.token = res.data.token;
        this.roles = res.data.roles || [];
        this.userInfo = res.data;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        localStorage.setItem('roles', JSON.stringify(res.data.roles || []));
        
        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async getUserInfo() {
      try {
        const res = await getManagerInfo();
        this.userInfo = res.data;
        this.roles = res.data.roleDetails || [];
        this.permissions = res.data.menuDetails || [];
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        localStorage.setItem('roles', JSON.stringify(this.roles));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async getMenuList() {
      try {
        const res = await getMenuListApi();
        this.menus = res.data;
        // 设置菜单的时候，判断有没有球场管理菜单，如果有的话就请求获取开放的城市
        if(this.menus.some(menu => menu.menuPath === '/court')){
          // 不用await 防止阻塞菜单加载
          getOpenCityList().then(res => {
            this.openCourts = res.data || [];
          });
        }
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
      localStorage.removeItem('userInfo');
      localStorage.removeItem('roles');
    }
  }
});