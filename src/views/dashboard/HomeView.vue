<template>
  <div class="space-y-6">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card" :loading="loading">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">总用户数</div>
              <div class="stat-value">{{ formatNumber(statistics.userStatistics?.totalUsers || 0) }}</div>
              <div class="stat-sub">今日新增 {{ statistics.userStatistics?.todayNewUsers || 0 }}</div>
            </div>
            <div class="stat-icon users">
              <UsergroupAddOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" :loading="loading">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">商品总数</div>
              <div class="stat-value">{{ formatNumber(statistics.productStatistics?.totalProducts || 0) }}</div>
              <div class="stat-sub">待审核 {{ statistics.productStatistics?.pendingAuditCount || 0 }}</div>
            </div>
            <div class="stat-icon products">
              <ShoppingOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" :loading="loading">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日订单</div>
              <div class="stat-value">{{ statistics.orderStatistics?.todayOrders || 0 }}</div>
              <div class="stat-sub">总订单 {{ formatNumber(statistics.orderStatistics?.totalOrders || 0) }}</div>
            </div>
            <div class="stat-icon orders">
              <ShoppingCartOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" :loading="loading">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">今日交易额</div>
              <div class="stat-value">¥{{ formatNumber(statistics.orderStatistics?.todayGmv || 0) }}</div>
              <div class="stat-sub">总GMV ¥{{ formatNumber(statistics.orderStatistics?.totalGmv || 0) }}</div>
            </div>
            <div class="stat-icon gmv">
              <AccountBookOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="用户统计" :loading="loading">
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="总用户数">{{ formatNumber(statistics.userStatistics?.totalUsers || 0) }}</a-descriptions-item>
            <a-descriptions-item label="商家数量">{{ statistics.userStatistics?.sellerCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="今日新增">{{ statistics.userStatistics?.todayNewUsers || 0 }}</a-descriptions-item>
            <a-descriptions-item label="7日活跃">{{ statistics.userStatistics?.activeUsers7d || 0 }}</a-descriptions-item>
            <a-descriptions-item label="30日活跃">{{ statistics.userStatistics?.activeUsers30d || 0 }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="商品统计" :loading="loading">
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="商品总数">{{ formatNumber(statistics.productStatistics?.totalProducts || 0) }}</a-descriptions-item>
            <a-descriptions-item label="已上架">{{ statistics.productStatistics?.onSaleCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="待审核">{{ statistics.productStatistics?.pendingAuditCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="今日新增">{{ statistics.productStatistics?.todayNewProducts || 0 }}</a-descriptions-item>
            <a-descriptions-item label="缺货商品">{{ statistics.productStatistics?.outOfStockCount || 0 }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="订单统计" :loading="loading">
          <a-descriptions :column="3" bordered size="small">
            <a-descriptions-item label="待支付">{{ statistics.orderStatistics?.pendingPaymentCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="待发货">{{ statistics.orderStatistics?.pendingDeliveryCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="已完成">{{ statistics.orderStatistics?.completedOrders || 0 }}</a-descriptions-item>
            <a-descriptions-item label="今日交易额">¥{{ formatNumber(statistics.orderStatistics?.todayGmv || 0) }}</a-descriptions-item>
            <a-descriptions-item label="本月交易额">¥{{ formatNumber(statistics.orderStatistics?.monthGmv || 0) }}</a-descriptions-item>
            <a-descriptions-item label="总交易额">¥{{ formatNumber(statistics.orderStatistics?.totalGmv || 0) }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="内容审核统计" :loading="loading">
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="待审核">{{ statistics.auditStatistics?.pendingAuditCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="今日通过">{{ statistics.auditStatistics?.todayApprovedCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="今日驳回">{{ statistics.auditStatistics?.todayRejectedCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="AI通过率">{{ statistics.auditStatistics?.aiPassRate || 0 }}%</a-descriptions-item>
            <a-descriptions-item label="人工通过率">{{ statistics.auditStatistics?.manualPassRate || 0 }}%</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="24">
        <a-card title="系统监控" :loading="loading">
          <a-descriptions :column="4" bordered size="small">
            <a-descriptions-item label="在线用户">
              <a-badge status="success" :text="statistics.systemStatistics?.onlineUsers || 0 + ' 人'" />
            </a-descriptions-item>
            <a-descriptions-item label="今日API请求">{{ formatNumber(statistics.systemStatistics?.todayApiRequests || 0) }}</a-descriptions-item>
            <a-descriptions-item label="Redis命中率">{{ statistics.systemStatistics?.redisHitRate || 0 }}%</a-descriptions-item>
            <a-descriptions-item label="平均响应时间">{{ statistics.systemStatistics?.avgResponseTime || 0 }} ms</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card :loading="trendLoading">
          <template #title>
            <div class="flex items-center justify-between">
              <span>用户注册趋势</span>
              <a-segmented v-model:value="userTrendDays" :options="trendOptions" @change="fetchUserTrend" />
            </div>
          </template>
          <v-chart class="chart" :option="userTrendOption" autoresize />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :loading="trendLoading">
          <template #title>
            <div class="flex items-center justify-between">
              <span>订单交易趋势</span>
              <a-segmented v-model:value="orderTrendDays" :options="trendOptions" @change="fetchOrderTrend" />
            </div>
          </template>
          <v-chart class="chart" :option="orderTrendOption" autoresize />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { UsergroupAddOutlined, ShoppingOutlined, ShoppingCartOutlined, AccountBookOutlined } from '@ant-design/icons-vue';
import { getDashboardData, getUserTrend, getOrderTrend } from '@/api/dashboard';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent]);

const loading = ref(false);
const trendLoading = ref(false);
const statistics = ref({
  userStatistics: {},
  productStatistics: {},
  orderStatistics: {},
  auditStatistics: {},
  systemStatistics: {}
});

const trendOptions = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 }
];

const userTrendDays = ref(7);
const orderTrendDays = ref(7);

const userTrendData = ref([]);
const orderTrendData = ref([]);

const userTrendOption = ref({});
const orderTrendOption = ref({});

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const buildUserTrendOption = (data) => {
  const dates = data.map(item => item.date);
  const counts = data.map(item => item.count);
  return {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>注册用户: {c} 人'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '用户数'
    },
    series: [
      {
        name: '注册用户',
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#1890ff', width: 2 },
        itemStyle: { color: '#1890ff' }
      }
    ]
  };
};

const buildOrderTrendOption = (data) => {
  const dates = data.map(item => item.date);
  const counts = data.map(item => item.count);
  return {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>订单数量: {c} 单'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '订单数'
    },
    series: [
      {
        name: '订单数量',
        type: 'bar',
        data: counts,
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#52c41a' },
              { offset: 1, color: '#b7eb8f' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };
};

const fetchStatistics = async () => {
  loading.value = true;
  try {
    const res = await getDashboardData();
    if (res && res.code === 200 && res.data) {
      statistics.value = res.data;
    }
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchUserTrend = async () => {
  trendLoading.value = true;
  try {
    const res = await getUserTrend(userTrendDays.value);
    if (res && res.code === 200 && res.data) {
      userTrendData.value = res.data;
      userTrendOption.value = buildUserTrendOption(res.data);
    }
  } catch (error) {
    console.error('获取用户趋势数据失败:', error);
  } finally {
    trendLoading.value = false;
  }
};

const fetchOrderTrend = async () => {
  trendLoading.value = true;
  try {
    const res = await getOrderTrend(orderTrendDays.value);
    if (res && res.code === 200 && res.data) {
      orderTrendData.value = res.data;
      orderTrendOption.value = buildOrderTrendOption(res.data);
    }
  } catch (error) {
    console.error('获取订单趋势数据失败:', error);
  } finally {
    trendLoading.value = false;
  }
};

onMounted(() => {
  fetchStatistics();
  fetchUserTrend();
  fetchOrderTrend();
});
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.ant-card-body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  line-height: 1.2;
}

.stat-sub {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.users {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-icon.products {
  background: #fff1f0;
  color: #ff4d4f;
}

.stat-icon.orders {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.gmv {
  background: #f6ffed;
  color: #52c41a;
}

.chart {
  width: 100%;
  height: 300px;
}
</style>