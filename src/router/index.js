import {
  createRouter,
  createWebHistory,
} from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/store/user';

/**
 * 菜单路径 → 本地组件映射
 * 后端返回 menuPath，通过此映射找到对应的 Vue 组件
 */
const componentMap = {
  '/admin': () => import('@/views/manager/ManagerView.vue'),
  '/role': () => import('@/views/role/RoleView.vue'),
  '/user': () => import('@/views/user/UserView.vue'),
  '/permission': () => import('@/views/Permission/PermissionView.vue'),
  '/order': () => import('@/views/order/OrderView.vue'),
  '/product': () => import('@/views/product/ProductView.vue'),
  '/message': () => import('@/views/message/MessageView.vue'),
  '/menu': () => import('@/views/menu/MenuView.vue'),
  '/court': () => import('@/views/court/CourtView.vue'),
};

/**
 * 获取组件，映射中找不到时返回占位组件
 */
function getComponent(menuPath) {
  return componentMap[menuPath] || (() => import('@/views/Error403.vue'));
}

const routes = [{
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: {
      guestOnly: true,
      title: '登录',
      keepAlive: false,
    }
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/home',
    children: [{
        path: '/home',
        name: 'home',
        component: () => import('@/views/dashboard/HomeView.vue'),
        meta: {
          requiresAuth: true,
          title: '仪表盘',
          keepAlive: false,
        }
      },
      {
        path: '/403',
        component: () => import('@/views/Error403.vue'),
        meta: {
          title: '无权限访问',
          keepAlive: false,
        }
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * 根据后端菜单数据动态注册路由
 * @param {Array} menus - 后端 /api/menu/routes 返回的菜单数组
 */
export function loadDynamicRoutes(menus) {
  menus.forEach(menu => {
    const menuPath = menu.menuPath;
    if (!menuPath) return; // 无路径的菜单（如"系统管理"父级）跳过

    const existingRoute = router.getRoutes().find(r => r.path === menuPath);
    if (existingRoute) return;

    // 构建子路由
    const children = [];
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(child => {
        if (!child.menuPath) return;
        const childExisting = router.getRoutes().find(r => r.path === child.menuPath);
        if (!childExisting) {
          children.push({
            path: child.menuPath,
            name: child.menuPath,
            component: getComponent(child.menuPath),
            meta: {
              requiresAuth: true,
              title: child.menuName,
              keepAlive: false,
            }
          });
        }
      });
    }

    const newRoute = {
      path: menuPath,
      name: menuPath,
      component: getComponent(menuPath),
      meta: {
        requiresAuth: true,
        title: menu.menuName,
        keepAlive: false,
        icon: menu.icon,
      },
      children: children.length > 0 ? children : undefined,
    };

    router.addRoute('layout', newRoute);

    // 如果有子路由，还需要单独注册每个子路由（确保直接访问子路径也能匹配）
    if (children.length > 0) {
      children.forEach(child => {
        if (!router.getRoutes().find(r => r.path === child.path)) {
          router.addRoute('layout', child);
        }
      });
    }
  });
}

/**
 * 权限检查辅助函数
 */
export function hasPermission(userRoles, routeRoles) {
  if (!routeRoles) return true;
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.some(role => routeRoles.includes(role));
}

router.beforeEach(async (to, from) => {
  NProgress.start();
  const userStore = useUserStore();
  const token = localStorage.getItem('token');

  if (to.meta.guestOnly) {
    if (token) {
      NProgress.done();
      return { path: '/' };
    }
    return true;
  }

  if (token && !userStore.userInfo) {
    try {
      await userStore.getUserInfo();
      const menus = await userStore.getMenuList();
      loadDynamicRoutes(menus);
      // 动态路由已添加，重新导航到当前目标（replace 避免重复历史记录）
      return { path: to.path, query: to.query, hash: to.hash, replace: true };
    } catch (error) {
      userStore.logout();
      NProgress.done();
      return { path: '/login' };
    }
  }

  if (to.meta.requiresAuth) {
    if (!token) {
      NProgress.done();
      return { path: `/login?redirect=${to.fullPath}` };
    }

    const userRoles = userStore.roles;
    if (to.meta.roles && !hasPermission(userRoles, to.meta.roles)) {
      NProgress.done();
      return { path: '/403' };
    }
  }

  return true;
});

// 3. 后置钩子
router.afterEach(() => {
  NProgress.done(); // 结束进度条
});

export default router;