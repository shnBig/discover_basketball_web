import { ref, onUnmounted } from 'vue';
import { useUserStore } from '@/store/user';
import { useNotificationStore } from '@/store/notification';

let wsInstance = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
let connectedRef = null;

export function useFeedbackWebSocket() {
  const connected = ref(false);
  connectedRef = connected;

  const userStore = useUserStore();
  const notificationStore = useNotificationStore();

  function getWsUrl() {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const wsBase = apiBase.replace(/^http/, 'ws');
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
    console.log(`[WS] ${delay / 1000}s 后尝试重连 (第${reconnectAttempts + 1}次)`);

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

  // 心跳：每30秒发送ping
  let heartbeatTimer = null;
  function startHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send('ping');
      }
    }, 30000);
  }

  // 在 open 后启动心跳，在 close 时清除
  // 由于 connect 是外部管理，心跳在这里通过包装处理
  // 简化处理：监听 connected 变化来管理心跳

  onUnmounted(() => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  });

  return { connected, connect, disconnect };
}

// 供外部直接调用的断开方法（例如退出登录时）
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
