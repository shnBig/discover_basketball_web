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
            耶球场地图管理系统
          </h2>
        </div>

        <nav
          class="nav-scroll order-3 md:order-2 w-full md:w-auto md:flex-1 md:min-w-0 mt-2 md:mt-0 border-t md:border-none border-slate-100 dark:border-slate-800"
        >
          <a-menu
            v-model:selectedKeys="current"
            mode="horizontal"
            :trigger-sub-menu-action="'click'"
            :ellipsis="false"
            class="bg-transparent border-none flex justify-center md:justify-start"
          >
            <a-menu-item key="home">
              <router-link to="/home">仪表盘</router-link>
            </a-menu-item>
            <template v-for="menu in userStore.menus" :key="menu.menuPath || menu.id">
              <!-- 有子菜单的父级 -->
              <a-sub-menu v-if="menu.children && menu.children.length > 0" :key="menu.menuPath || menu.id">
                <template #title>
                  {{ menu.menuName }} <DownOutlined style="font-size: 10px; margin-left: 2px;" />
                </template>
                <a-menu-item v-for="child in menu.children" :key="child.menuPath">
                  <router-link :to="menu.menuPath + child.menuPath">{{ child.menuName }}</router-link>
                </a-menu-item>
              </a-sub-menu>
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
            <a-dropdown placement="bottomRight" :trigger="['click']" overlay-class-name="notification-dropdown-overlay">
              <a-badge :count="notificationStore.unreadCount" :overflow-count="99" :offset="[-2, 2]">
                <a-button type="text" class="flex items-center justify-center">
                  <template #icon
                    ><div><BellOutlined class="text-lg md:text-xl" /></div
                  ></template>
                </a-button>
              </a-badge>
              <template #overlay>
                <div class="w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                  <div class="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <span class="font-semibold text-sm">消息通知</span>
                    <a-button type="link" size="small" @click="handleMarkAllRead" v-if="notificationStore.unreadCount > 0">全部已读</a-button>
                  </div>
                  <div class="max-h-96 overflow-y-auto">
                    <div v-if="notificationStore.notifications.length === 0" class="px-4 py-10 text-center text-gray-400 text-sm">
                      <BellOutlined class="text-3xl mb-2" />
                      <div>暂无消息</div>
                    </div>
                    <div
                      v-for="(item, index) in notificationStore.notifications"
                      :key="index"
                      class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-b-0 transition-colors"
                      :class="{ 'bg-blue-50/50 dark:bg-blue-900/20': !item.read }"
                      @click="handleNotificationClick(item, index)"
                    >
                      <div class="flex items-start gap-2">
                        <span v-if="!item.read" class="w-2 h-2 mt-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                        <span v-else class="w-2 h-2 mt-1.5 flex-shrink-0"></span>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium truncate" :class="{ 'text-blue-600 dark:text-blue-400': !item.read, 'text-slate-700 dark:text-slate-300': item.read }">
                            {{ item.type === 'COURT_REPORT' ? '球场问题反馈' : '小程序意见反馈' }}
                          </div>
                          <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ item.message }}</div>
                          <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ formatNotifyTime(item.timestamp) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-center" v-if="notificationStore.notifications.length > 0">
                    <a-button type="link" size="small" @click="handleViewAllNotifications">查看全部通知</a-button>
                  </div>
                </div>
              </template>
            </a-dropdown>
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
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { BellOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons-vue";
import { useUserStore } from "@/store/user";
import { useNotificationStore } from "@/store/notification";
import { useFeedbackWebSocket, disconnectWebSocket } from "@/composables/useFeedbackWebSocket";
import { markCourtReportRead } from "@/api/courtReport";
import { markFeedbackRead } from "@/api/feedback";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

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
  // 断开 WebSocket
  disconnectWebSocket();
  //路由跳转
  router.replace("/login");
  //退出登录
  userStore.logout();
};

// ---- 消息通知 ----
const { connect, disconnect } = useFeedbackWebSocket();

function formatNotifyTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

function handleNotificationClick(item, index) {
  notificationStore.markAsRead(index);
  // 调用后端接口标记为已读
  if (item.type === 'COURT_REPORT') {
    markCourtReportRead(item.id).catch(e => console.error('标记球场反馈已读失败:', e));
    router.push({ path: '/court/court_report', query: { id: item.id, courtId: item.courtId } });
  } else if (item.type === 'APP_FEEDBACK') {
    markFeedbackRead(item.id).catch(e => console.error('标记意见反馈已读失败:', e));
    router.push({ path: '/user_feedback', query: { id: item.id } });
  }
}

function handleMarkAllRead() {
  notificationStore.markAllAsRead();
  message.success('已全部标为已读');
}

function handleViewAllNotifications() {
  notificationStore.markAllAsRead();
  router.push('/user_feedback');
}

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token && userStore.userInfo?.id) {
    connect();
  }
});

onUnmounted(() => {
  disconnect();
});
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

/* 消息通知下拉样式 */
:global(.notification-dropdown-overlay) {
  min-width: 320px;
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