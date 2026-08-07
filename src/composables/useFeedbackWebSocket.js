import { ref, onUnmounted } from 'vue';
import { useUserStore } from '@/store/user';
import { useNotificationStore } from '@/store/notification';

let wsInstance = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

export function useFeedbackWebSocket() {
  const connected = ref(false);

  const userStore = useUserStore();
  const notificationStore = useNotificationStore();

  // 检查当前用户是否有某个路由的访问权限
  function hasRouteAccess(targetPath) {
    const menus = userStore.menus || [];
    const menuPaths = [];
    for (const menu of menus) {
      if (menu.menuPath) menuPaths.push(menu.menuPath);
      if (menu.children && menu.children.length > 0) {
        const parentPath = menu.menuPath || '';
        for (const child of menu.children) {
          if (child.menuPath) menuPaths.push(parentPath + child.menuPath);
        }
      }
    }
    const hasAccess = menuPaths.includes(targetPath);
    // 只在拒绝时打日志，方便排查
    if (!hasAccess) {
      console.log('[WS] 当前用户菜单路径:', menuPaths);
      console.log('[WS] 需要但未找到的路径:', targetPath);
    }
    return hasAccess;
  }

  // 消息类型 → 所需路由映射
  const typeRouteMap = {
    'COURT_REPORT': '/court/court_report',
    'APP_FEEDBACK': '/user_feedback',
  };

  function getWsUrl() {
    let wsBase = import.meta.env.VITE_WS_URL;
    if (!wsBase) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      wsBase = apiBase.replace(/^http(s)?:/, (match, s) => s ? 'wss:' : 'ws:');
    }
    const adminId = userStore.userInfo?.id;
    if (!adminId) {
      console.warn('[WS] 未获取到 adminId，无法建立 WebSocket 连接');
      return null;
    }
    return `${wsBase}/ws/feedback/${adminId}`;
  }

  function connect() {
    if (wsInstance?.readyState === WebSocket.OPEN || wsInstance?.readyState === WebSocket.CONNECTING) return;

    const url = getWsUrl();
    if (!url) return;

    console.log('[WS] 正在连接:', url);
    wsInstance = new WebSocket(url);

    wsInstance.onopen = () => {
      console.log('[WS] 连接成功');
      connected.value = true;
      reconnectAttempts = 0;
    };

    wsInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] 收到消息:', data);
        const requiredRoute = typeRouteMap[data.type];
        if (requiredRoute && !hasRouteAccess(requiredRoute)) {
          console.log('[WS] 忽略消息 ' + data.type + '：用户无 ' + requiredRoute + ' 路由权限');
          return;
        }
        notificationStore.addNotification(data);
      } catch (e) {
        console.error('[WS] 消息解析失败:', e);
      }
    };

    wsInstance.onclose = (event) => {
      console.log('[WS] 连接关闭:', event.code, event.reason);
      connected.value = false;
      wsInstance = null;
      scheduleReconnect();
    };

    wsInstance.onerror = (error) => {
      console.error('[WS] 连接错误:', error);
    };
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('[WS] 已达最大重连次数');
      return;
    }
    if (reconnectTimer) clearTimeout(reconnectTimer);

    const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), 60000);
    console.log('[WS] ' + (delay / 1000) + 's 后尝试重连 (第' + (reconnectAttempts + 1) + '次)');

    reconnectTimer = setTimeout(() => {
      reconnectAttempts++;
      connect();
    }, delay);
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (wsInstance) {
      wsInstance.close();
      wsInstance = null;
    }
    connected.value = false;
    reconnectAttempts = 0;
  }

  let heartbeatTimer = null;
  function startHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send('ping');
      }
    }, 30000);
  }

  onUnmounted(() => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  });

  return { connected, connect, disconnect };
}

export function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
  }
  reconnectAttempts = 0;
}
