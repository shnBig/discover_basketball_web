import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: JSON.parse(localStorage.getItem('notifications') || '[]'),
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    unreadList: (state) => state.notifications.filter(n => !n.read),
  },
  actions: {
    _persist() {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    },
    addNotification(data) {
      this.notifications.unshift({
        type: data.type,
        id: data.id,
        courtId: data.courtId,
        courtName: data.courtName,
        reportType: data.reportType,
        reportTypeDesc: data.reportTypeDesc,
        feedbackType: data.feedbackType,
        feedbackTypeDesc: data.feedbackTypeDesc,
        content: data.content,
        message: data.message,
        read: false,
        timestamp: Date.now(),
      });
      this._persist();
    },
    markAsRead(index) {
      if (this.notifications[index]) {
        this.notifications[index].read = true;
        this._persist();
      }
    },
    markAllAsRead() {
      this.notifications.forEach(n => { n.read = true; });
      this._persist();
    },
    clearAll() {
      this.notifications = [];
      this._persist();
    },
  },
});
