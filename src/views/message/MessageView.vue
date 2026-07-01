<template>
  <div class="message-container">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="session-card" :loading="sessionLoading">
          <template #title>
            <div class="card-title">
              <span>用户会话列表</span>
              <a-input
                v-model:value="searchKeyword"
                placeholder="搜索用户"
                style="width: 140px"
                size="small"
                allowClear
                @search="onSearchSession"
              >
                <template #prefix>
                  <SearchOutlined />
                </template>
              </a-input>
            </div>
          </template>
          <div class="session-list">
            <div
              v-for="session in filteredSessions"
              :key="session.user1Id + '-' + session.user2Id"
              class="session-item"
              :class="{ active: selectedSession && selectedSession.user1Id === session.user1Id && selectedSession.user2Id === session.user2Id }"
              @click="selectSession(session)"
            >
              <div class="session-avatars">
                <a-avatar :src="session.user1Avatar" :size="40">
                  {{ session.user1NickName?.charAt(0) || '?' }}
                </a-avatar>
                <span class="avatar-arrow">↔</span>
                <a-avatar :src="session.user2Avatar" :size="40">
                  {{ session.user2NickName?.charAt(0) || '?' }}
                </a-avatar>
              </div>
              <div class="session-info">
                <div class="session-top">
                  <span class="session-name">
                    {{ session.user1NickName }} ↔ {{ session.user2NickName }}
                  </span>
                  <span class="session-time">{{ formatTime(session.lastMessageTime) }}</span>
                </div>
                <div class="session-preview">{{ session.lastMessage || '暂无消息' }}</div>
                <div class="session-unread" v-if="session.user1UnreadCount > 0 || session.user2UnreadCount > 0">
                  <span v-if="session.user1UnreadCount > 0">{{ session.user1NickName }} 未读: {{ session.user1UnreadCount }}</span>
                  <span v-if="session.user2UnreadCount > 0">{{ session.user2NickName }} 未读: {{ session.user2UnreadCount }}</span>
                </div>
              </div>
            </div>
            <a-empty v-if="filteredSessions.length === 0 && !sessionLoading" description="暂无会话记录" />
          </div>
          <div class="pagination-wrapper" v-if="sessionTotal > pageSize">
            <a-pagination
              v-model:current="sessionPage"
              :total="sessionTotal"
              :page-size="pageSize"
              size="small"
              show-quick-jumper
              @change="fetchSessions"
            />
          </div>
        </a-card>
      </a-col>

      <a-col :span="16">
        <a-card class="chat-card" :loading="chatLoading">
          <template #title>
            <div class="card-title" v-if="selectedSession">
              <a-avatar :src="selectedSession.user1Avatar" :size="24" class="mini-avatar">
                {{ selectedSession.user1NickName?.charAt(0) || '?' }}
              </a-avatar>
              <span>{{ selectedSession.user1NickName }} ↔ {{ selectedSession.user2NickName }}</span>
              <a-avatar :src="selectedSession.user2Avatar" :size="24" class="mini-avatar">
                {{ selectedSession.user2NickName?.charAt(0) || '?' }}
              </a-avatar>
              <a-input
                v-model:value="chatSearchKeyword"
                placeholder="搜索消息内容"
                style="width: 200px"
                size="small"
                allowClear
                @search="onChatSearch"
              >
                <template #prefix>
                  <SearchOutlined />
                </template>
              </a-input>
            </div>
            <div class="card-title" v-else>
              <span>请选择一个会话</span>
            </div>
          </template>

          <div v-if="selectedSession" class="chat-content">
            <div class="message-list" ref="messageListRef">
              <div
                v-for="msg in filteredMessages"
                :key="msg.id"
                class="message-item"
                :class="{ 'message-self': msg.senderId === selectedSession.user1Id, 'message-other': msg.senderId !== selectedSession.user1Id }"
              >
                <a-avatar
                  :src="msg.senderId === selectedSession.user1Id ? selectedSession.user1Avatar : selectedSession.user2Avatar"
                  :size="36"
                  class="message-avatar"
                >
                  {{ (msg.senderId === selectedSession.user1Id ? selectedSession.user1NickName : selectedSession.user2NickName)?.charAt(0) || '?' }}
                </a-avatar>
                <div class="message-body">
                  <div class="message-sender">{{ msg.senderId === selectedSession.user1Id ? selectedSession.user1NickName : selectedSession.user2NickName }}</div>
                  <div class="message-bubble">
                    <div class="message-text" v-html="highlightKeyword(msg.content)"></div>
                    <div class="message-time">{{ formatTime(msg.sendTime) }}</div>
                  </div>
                </div>
              </div>
              <a-empty v-if="filteredMessages.length === 0 && !chatLoading" description="未找到匹配的消息" />
            </div>

            <div class="chat-footer">
              <div class="pagination-info">
                <span>共 {{ chatTotal }} 条记录</span>
                <a-pagination
                  v-model:current="chatPage"
                  :total="chatTotal"
                  :page-size="chatPageSize"
                  size="small"
                  :show-total="() => ''"
                  @change="fetchChatHistory"
                />
              </div>
            </div>
          </div>

          <div v-else class="chat-placeholder">
            <a-empty description="请从左侧选择一个会话查看聊天记录" />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { getChatSessions, getChatHistory } from '@/api/message';

const sessionLoading = ref(false);
const chatLoading = ref(false);
const searchKeyword = ref('');
const sessionPage = ref(1);
const pageSize = ref(20);
const sessionTotal = ref(0);
const chatPage = ref(1);
const chatPageSize = ref(50);
const chatTotal = ref(0);

const sessions = ref([]);
const messages = ref([]);
const selectedSession = ref(null);
const messageListRef = ref(null);

const currentUserId = ref(null);
const currentUserNickName = ref('');
const currentUserAvatar = ref('');
const chatSearchKeyword = ref('');

const filteredSessions = computed(() => {
  if (!searchKeyword.value) return sessions.value;
  const keyword = searchKeyword.value.toLowerCase();
  return sessions.value.filter(s =>
    (s.user1NickName && s.user1NickName.toLowerCase().includes(keyword)) ||
    (s.user2NickName && s.user2NickName.toLowerCase().includes(keyword)) ||
    (s.lastMessage && s.lastMessage.toLowerCase().includes(keyword))
  );
});

const filteredMessages = computed(() => {
  if (!chatSearchKeyword.value) return messages.value;
  const keyword = chatSearchKeyword.value.toLowerCase();
  return messages.value.filter(msg =>
    msg.content && msg.content.toLowerCase().includes(keyword)
  );
});

const highlightKeyword = (content) => {
  if (!content || !chatSearchKeyword.value) {
    return escapeHtml(content);
  }
  const keyword = chatSearchKeyword.value;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return escapeHtml(content).replace(regex, '<span class="highlight">$1</span>');
};

const escapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const getOtherUser = (session) => {
  if (!session) return {};
  const isUser1Current = session.user1Id === currentUserId.value;
  if (isUser1Current) {
    return {
      id: session.user2Id,
      nickName: session.user2NickName,
      avatar: session.user2Avatar,
      unreadCount: session.user1UnreadCount
    };
  } else {
    return {
      id: session.user1Id,
      nickName: session.user1NickName,
      avatar: session.user1Avatar,
      unreadCount: session.user2UnreadCount
    };
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' ' +
         date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const fetchSessions = async () => {
  sessionLoading.value = true;
  try {
    const res = await getChatSessions({
      pageNum: sessionPage.value,
      pageSize: pageSize.value
    });
    if (res && res.data) {
      sessions.value = res.data.list || [];
      sessionTotal.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
  } finally {
    sessionLoading.value = false;
  }
};

const fetchChatHistory = async () => {
  if (!selectedSession.value) return;

  chatLoading.value = true;
  try {
    const res = await getChatHistory({
      user1Id: selectedSession.value.user1Id,
      user2Id: selectedSession.value.user2Id,
      pageNum: chatPage.value,
      pageSize: chatPageSize.value
    });
    if (res && res.data) {
      messages.value = res.data.list || [];
      chatTotal.value = res.data.total || 0;
      nextTick(() => {
        if (messageListRef.value) {
          messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
        }
      });
    }
  } catch (error) {
    console.error('获取聊天记录失败:', error);
  } finally {
    chatLoading.value = false;
  }
};

const selectSession = (session) => {
  selectedSession.value = session;
  chatPage.value = 1;
  chatSearchKeyword.value = '';
  messages.value = [];
  fetchChatHistory();
};

const onSearchSession = () => {
  sessionPage.value = 1;
};

const onChatSearch = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = 0;
    }
  });
};

const initUserInfo = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  currentUserId.value = userInfo.id || null;
  currentUserNickName.value = userInfo.nickName || userInfo.username || '管理员';
  currentUserAvatar.value = userInfo.avatar || '';
};

watch(searchKeyword, () => {
  sessionPage.value = 1;
});

onMounted(() => {
  initUserInfo();
  fetchSessions();
});
</script>

<style scoped>
.message-container {
  padding: 20px;
  height: calc(100vh - 140px);
}

.session-card,
.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.session-card :deep(.ant-card-body),
.chat-card :deep(.ant-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  margin: 0 -24px;
  padding: 0 16px;
}

.session-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #f5f5f5;
}

.session-item.active {
  background-color: #e6f7ff;
}

.session-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.avatar-arrow {
  font-size: 14px;
  color: #999;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
}

.mini-avatar {
  margin: 0 4px;
}

.session-unread {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
  display: flex;
  gap: 8px;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.session-name {
  font-weight: 600;
  color: #1f1f1f;
  font-size: 14px;
}

.session-time {
  font-size: 12px;
  color: #999;
}

.session-preview {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-wrapper {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 16px;
}

.message-self {
  flex-direction: row-reverse;
}

.message-self .message-body {
  align-items: flex-end;
}

.message-self .message-bubble {
  background-color: #1890ff;
  color: white;
}

.message-self .message-time {
  text-align: right;
}

.message-other .message-bubble {
  background-color: #f5f5f5;
  color: #1f1f1f;
}

.message-avatar {
  flex-shrink: 0;
}

.message-body {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-sender {
  font-size: 12px;
  color: #999;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 8px;
  word-break: break-word;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
}

.message-text .highlight {
  background-color: #ffd666;
  color: #1f1f1f;
  padding: 0 2px;
  border-radius: 2px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.chat-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>