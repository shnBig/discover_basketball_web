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
  '/menu': () => import('@/views/menu/MenuView.vue'),
  '/order': () => import('@/views/order/OrderView.vue'),
  '/product': () => import('@/views/product/ProductView.vue'),
  '/message': () => import('@/views/message/MessageView.vue'),
  '/court/court_map': () => import('@/views/court/CourtMap.vue'),
  '/court/court_list': () => import('@/views/court/CourtList.vue'),
  '/city_config': () => import('@/views/city_config/CityConfigView.vue'),
  '/test': () => import('@/views/test/test2.vue'),
};

/**
 * 从组件路径提取组件名称（用于 keep-alive 匹配）
 * 例如 '@/views/court/CourtView.vue' → 'CourtView'
 * 如果 componentMap 中没有对应组件，则从 menuPath 生成名称（如 /role → role）
 */
function getComponentName(menuPath) {
  const importPath = componentMap[menuPath]?.toString() || '';
  const match = importPath.match(/\/([^/]+)\.vue/);
  // 有组件名用组件名，没有则用路径生成（去掉前导斜杠）
  return match ? match[1] : menuPath.replace(/^\//, '');
}

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
    // 有子菜单：注册子路由，路径 = 父级menuPath + 子级menuPath
    if (menu.children && menu.children.length > 0) {
      const parentPath = menu.menuPath || '';
      menu.children.forEach(child => {
        if (!child.menuPath) return;
        // 拼接完整路径，如 /court + /court_map = /court/court_map
        const fullPath = parentPath + child.menuPath;
        const existing = router.getRoutes().find(r => r.path === fullPath);
        if (existing) return;

        router.addRoute('layout', {
          path: fullPath,
          name: getComponentName(fullPath), // 用完整路径查找组件
          component: getComponent(fullPath),
          meta: {
            requiresAuth: true,
            title: child.menuName,
            keepAlive: true,
          }
        });
      });
      return;
    }

    // 无子菜单：直接注册
    const menuPath = menu.menuPath;
    if (!menuPath) return;

    const existing = router.getRoutes().find(r => r.path === menuPath);
    if (existing) return;

    router.addRoute('layout', {
      path: menuPath,
      name: getComponentName(menuPath),
      component: getComponent(menuPath),
      meta: {
        requiresAuth: true,
        title: menu.menuName,
        keepAlive: true,
        icon: menu.icon,
      }
    });
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

  if (token) {
    // 没有 userInfo 时从 API 获取（localStorage 也没有的情况）
    if (!userStore.userInfo) {
      try {
        await userStore.getUserInfo();
      } catch (error) {
        userStore.logout();
        NProgress.done();
        return { path: '/login' };
      }
    }
    // 没有菜单/路由时获取并注册动态路由
    if (!userStore.menus || userStore.menus.length === 0) {
      try {
        const menus = await userStore.getMenuList();
        loadDynamicRoutes(menus);
        return { path: to.path, query: to.query, hash: to.hash, replace: true };
      } catch (error) {
        userStore.logout();
        NProgress.done();
        return { path: '/login' };
      }
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