<template>
  <div
    class="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 flex flex-col"
  >
    <div class="layout-container flex h-full grow flex-col">
      <header
        class="flex flex-wrap items-center justify-between border-b border-solid border-slate-200 dark:border-slate-800 px-4 md:px-10 py-2 md:py-3 bg-white/30 backdrop-blur-md dark:bg-slate-900 sticky top-0 z-50"
      >
        <div class="flex items-center gap-3 md:gap-4 h-12 order-1">
          <img
            src="https://backend-admin.tos-cn-beijing.volces.com/logo/logo.png"
            alt="logo"
            class="size-8 md:size-10 rounded-full"
          />
          <h2
            class="text-slate-900 dark:text-slate-100 text-base md:text-lg font-bold leading-tight whitespace-nowrap -translate-y-[-4px]"
          >
            福尔摩篮后台管理系统
          </h2>
        </div>

        <nav
          class="nav-scroll order-3 md:order-2 w-full md:w-auto md:flex-1 md:min-w-0 mt-2 md:mt-0 border-t md:border-none border-slate-100 dark:border-slate-800"
        >
          <a-menu
            v-model:selectedKeys="current"
            mode="horizontal"
            :ellipsis="false"
            class="bg-transparent border-none flex justify-center md:justify-start"
          >
            <a-menu-item key="home">
              <router-link to="/home">仪表盘</router-link>
            </a-menu-item>
            <template v-for="menu in userStore.menus" :key="menu.menuPath || menu.id">
              <!-- 有子菜单的父级：用 dropdown 保证手机端可点击 -->
              <a-dropdown v-if="menu.children && menu.children.length > 0" :trigger="['click']" overlayClassName="menu-dropdown-overlay">
                <a-menu-item :key="menu.id">
                  {{ menu.menuName }} <DownOutlined style="font-size: 10px; margin-left: 2px;" />
                </a-menu-item>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-for="child in menu.children" :key="menu.menuPath + child.menuPath">
                      <router-link :to="menu.menuPath + child.menuPath">{{ child.menuName }}</router-link>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <!-- 无子菜单的叶子节点 -->
              <a-menu-item v-else-if="menu.menuPath" :key="menu.menuPath">
                <router-link :to="menu.menuPath">{{ menu.menuName }}</router-link>
              </a-menu-item>
            </template>
          </a-menu>
        </nav>

        <!-- 3. 右侧用户信息 (桌面端 Order 3, 手机端 Order 2) -->
        <div class="flex items-center gap-2 md:gap-4 order-2 md:order-3">
          <!-- 通知与设置 -->
          <div class="flex gap-1">
            <a-button type="text" class="flex items-center justify-center">
              <template #icon
                ><div><BellOutlined class="text-lg md:text-xl" /></div
              ></template>
            </a-button>
            <a-button type="text" class="flex items-center justify-center">
              <template #icon
                ><div><SettingOutlined class="text-lg md:text-xl" /></div
              ></template>
            </a-button>
          </div>

          <!-- 用户头像 -->
          <a-dropdown placement="bottomRight">
            <a-avatar
              :size="32"
              :src="avatarUrl"
              class="cursor-pointer border-2 border-primary/20"
            />
            <template #overlay>
              <a-menu>
                <!-- <a-menu-item>个人中心</a-menu-item> -->
                <a-menu-item danger @click="handleQuit">退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </header>

      <!-- 主要内容 -->
      <main
        class="flex-1 flex items-start justify-center p-4 pb-0 md:p-6 md:pb-0 overflow-y-auto overflow-x-hidden w-full"
      >
        <router-view v-slot="{ Component }" class="w-full">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>

      <!-- 页脚：保持原样，微调间距 -->
      <footer
        class="py-4 md:py-6 px-10 text-center text-slate-400 dark:text-slate-600 text-xs flex flex-col sm:flex-row justify-center items-center gap-2"
      >
        <span>© 2026 福尔摩斯蓝团队. 版权所有.</span>
        <span class="hidden sm:inline text-slate-200 dark:text-slate-800"
          >|</span
        >
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          class="hover:text-primary transition-colors"
        >
          京ICP备2026003110号-1
        </a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { BellOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons-vue";
import { useUserStore } from "@/store/user";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 路由名称 → 菜单 key 映射（从路由 meta 中读取原始 menuPath）
const getRouteKey = (routeName) => {
  const route = router.getRoutes().find(r => r.name === routeName);
  return route?.path || routeName;
};

const current = ref([getRouteKey(route.name) || "home"]);
const avatarUrl = computed(() => userStore.userInfo?.avatarUrl|| JSON.parse(localStorage.getItem('userInfo') || '{}').avatarUrl);

// 需要缓存的视图组件名称列表（根据路由 meta.keepAlive 判断）
const cachedViews = computed(() => {
  return router.getRoutes()
    .filter(r => r.meta?.keepAlive)
    .map(r => r.name)
    .filter(Boolean);
});
// 当用户点击浏览器前进/后退，或者通过其他方式跳转路由时，同步更新菜单选中状态
watch(
  () => route.name,
  (newName) => {
    current.value = [getRouteKey(newName)];
  },
);
const handleQuit = () => {
  //路由跳转
  router.replace("/login");
  //退出登录
  userStore.logout();
};
</script>

<style lang="postcss" scoped>
/* 保持你原来的样式逻辑... */

/* 针对 Ant Design Menu 在手机端的微调 */
:deep(.ant-menu-horizontal) {
  line-height: 40px; /* 手机端高度稍微矮一点 */
}

@screen md {
  :deep(.ant-menu-horizontal) {
    line-height: 46px;
  }
}

/* 手机端路由栏左右滑动 */
@media (max-width: 768px) {
  .nav-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }
  .nav-scroll::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  :deep(.ant-menu-horizontal) {
    flex-wrap: nowrap !important;
    white-space: nowrap;
    min-width: max-content !important;
  }
  :deep(.ant-menu-overflow) {
    min-width: max-content !important;
  }
  /* 隐藏 Ant Design 溢出省略号按钮 */
  :deep(.ant-menu-overflow-item-rest),
  :deep(.ant-menu-ellipsis) {
    display: none !important;
  }
}

/* 移除 AntD 默认的底部边框，我们已经在 header 处理了 */
:deep(.ant-menu) {
  border-bottom: none !important;
}

/* 子菜单下拉样式 */
:global(.menu-dropdown-overlay) {
  min-width: 120px;
}

/* 优化手机端菜单项的间距，防止太挤 */
@media (max-width: 768px) {
  :deep(.ant-menu-item) {
    padding-inline: 12px !important;
    font-size: 13px;
  }
}

/* 动画进入前和离开后的状态 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px); /* 从左边进来 */
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px); /* 向右边消失 */
}
</style>