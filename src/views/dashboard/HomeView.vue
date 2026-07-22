<template>
  <div class="space-y-6">
    <!-- 核心指标卡片 -->
    <a-row :gutter="16">
      <a-col :xs="12" :sm="8" :md="4" v-for="card in overviewCards" :key="card.key">
        <a-card class="stat-card" :loading="loading">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">{{ formatNumber(card.value) }}</div>
              <div class="stat-sub" v-if="card.sub">{{ card.sub }}</div>
            </div>
            <div class="stat-icon" :class="card.iconClass">
              <component :is="card.icon" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 状态分布 + 来源分布 -->
    <a-row :gutter="16">
      <a-col :xs="24" :md="12">
        <a-card title="球场状态分布" :loading="loading" class="chart-card">
          <v-chart class="chart" :option="statusPieOption" autoresize />
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-card title="来源分布" :loading="loading" class="chart-card">
          <v-chart class="chart" :option="sourcePieOption" autoresize />
        </a-card>
      </a-col>
    </a-row>

    <!-- 近N日趋势 -->
    <a-row :gutter="16">
      <a-col :span="24">
        <a-card :loading="loading">
          <template #title>
            <div class="flex items-center justify-between">
              <span>新增球场趋势</span>
              <a-segmented v-model:value="trendDays" :options="trendOptions" @change="fetchData" />
            </div>
          </template>
          <v-chart class="chart" :option="trendLineOption" autoresize />
        </a-card>
      </a-col>
    </a-row>

    <!-- 城市排行 + 材质分布 -->
    <a-row :gutter="16">
      <a-col :xs="24" :md="14">
        <a-card title="城市球场排行 Top10" :loading="loading" class="chart-card">
          <v-chart class="chart" :option="cityBarOption" autoresize />
        </a-card>
      </a-col>
      <a-col :xs="24" :md="10">
        <a-card title="场地材质分布" :loading="loading" class="chart-card">
          <v-chart class="chart" :option="materialBarOption" autoresize />
        </a-card>
      </a-col>
    </a-row>

    <!-- 待审核 + 热门球场 -->
    <a-row :gutter="16">
      <a-col :xs="24" :md="12">
        <a-card :loading="loading">
          <template #title>
            <div class="flex items-center justify-between">
              <span>最新待审核</span>
              <a-button type="link" size="small" @click="goToAuditList">全部待审核</a-button>
            </div>
          </template>
          <a-table
            :columns="pendingColumns"
            :data-source="data.pendingReviews"
            :pagination="false"
            size="small"
            :scroll="{ x: 400 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="goToAudit(record)">去审核</a-button>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-card title="热门球场 Top10" :loading="loading">
          <a-table
            :columns="hotColumns"
            :data-source="data.hotCourts"
            :pagination="false"
            size="small"
            :scroll="{ x: 400 }"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 近期动态 + 活跃用户 -->
    <a-row :gutter="16">
      <a-col :xs="24" :md="14">
        <a-card title="近期动态" :loading="loading">
          <a-table
            :columns="logColumns"
            :data-source="data.recentLogs"
            :pagination="false"
            size="small"
            :scroll="{ x: 500 }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :md="10">
        <a-card title="活跃用户 Top5" :loading="loading">
          <a-table
            :columns="userColumns"
            :data-source="data.activeUsers"
            :pagination="false"
            size="small"
            :scroll="{ x: 360 }"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons-vue';
import { getDashboardData } from '@/api/dashboard';
import { useRouter } from 'vue-router';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components';

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

const router = useRouter();
const loading = ref(false);
const trendDays = ref(7);
const trendOptions = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
];

const data = ref({
  overview: {},
  statusDistribution: [],
  sourceDistribution: [],
  materialDistribution: [],
  cityTop10: [],
  dailyTrend: [],
  pendingReviews: [],
  hotCourts: [],
  recentLogs: [],
  activeUsers: [],
});

const formatNumber = (num) => {
  if (num == null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// ---- 核心指标卡片 ----
const overviewCards = computed(() => {
  const o = data.value.overview || {};
  return [
    { key: 'total', label: '球场总数', value: o.totalCourts, icon: EnvironmentOutlined, iconClass: 'total' },
    { key: 'pending', label: '待审核', value: o.pendingCourts, icon: ClockCircleOutlined, iconClass: 'pending' },
    { key: 'published', label: '已上架', value: o.publishedCourts, icon: CheckCircleOutlined, iconClass: 'published' },
    { key: 'users', label: '小程序用户', value: o.totalUsers, icon: UserOutlined, iconClass: 'users' },
    { key: 'today', label: '今日新增', value: o.todayNewCourts, sub: '球场', icon: PlusCircleOutlined, iconClass: 'today' },
  ];
});

// ---- 图表配置 ----
const statusPieOption = computed(() => buildPie(data.value.statusDistribution, ['#faad14', '#52c41a', '#1890ff', '#ff4d4f']));
const sourcePieOption = computed(() => buildPie(data.value.sourceDistribution, ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1']));

const trendLineOption = computed(() => {
  const trend = data.value.dailyTrend || [];
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: trend.map(i => i.date) },
    yAxis: { type: 'value', name: '新增数', minInterval: 1 },
    series: [{
      type: 'line',
      smooth: true,
      data: trend.map(i => i.count),
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
          ],
        },
      },
      lineStyle: { color: '#1890ff', width: 2 },
      itemStyle: { color: '#1890ff' },
    }],
  };
});

const cityBarOption = computed(() => {
  const list = data.value.cityTop10 || [];
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', name: '球场数', minInterval: 1 },
    yAxis: { type: 'category', data: list.map(i => i.name).reverse() },
    series: [{
      type: 'bar',
      data: list.map(i => i.value).reverse(),
      barWidth: '60%',
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#69c0ff' },
          ],
        },
        borderRadius: [0, 4, 4, 0],
      },
      label: { show: true, position: 'right', fontSize: 12 },
    }],
  };
});

const materialBarOption = computed(() => {
  const list = data.value.materialDistribution || [];
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: list.map(i => i.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '球场数', minInterval: 1 },
    series: [{
      type: 'bar',
      data: list.map(i => i.value),
      barWidth: '50%',
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#52c41a' },
            { offset: 1, color: '#b7eb8f' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
    }],
  };
});

function buildPie(list, colors) {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    color: colors,
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: list,
    }],
  };
}

// ---- 操作类型映射 ----
const actionMap = { 1: '新增', 2: '编辑', 3: '删除', 4: '审核' };

// ---- 表格列定义 ----
const pendingColumns = [
  { title: '球场名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
  { title: '提交时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 80, align: 'center' },
];

const hotColumns = [
  { title: '排名', key: 'rank', width: 60, customRender: ({ index }) => index + 1 },
  { title: '球场名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '浏览', dataIndex: 'viewCount', key: 'viewCount', width: 70 },
  { title: '收藏', dataIndex: 'favoriteCount', key: 'favoriteCount', width: 70 },
  { title: '打卡', dataIndex: 'checkinCount', key: 'checkinCount', width: 70 },
];

const logColumns = [
  { title: '球场', dataIndex: 'courtName', key: 'courtName', ellipsis: true },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, customRender: ({ text }) => actionMap[text] || text },
  { title: '操作人', dataIndex: 'adminName', key: 'adminName', width: 80 },
  { title: '时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
];

const userColumns = [
  { title: '排名', key: 'rank', width: 60, customRender: ({ index }) => index + 1 },
  { title: '用户', dataIndex: 'nickname', key: 'nickname', ellipsis: true },
  { title: '提交数', dataIndex: 'totalSubmit', key: 'totalSubmit', width: 80 },
  { title: '通过数', dataIndex: 'passCount', key: 'passCount', width: 80 },
];

// ---- 跳转审核 ----
const goToAuditList = () => {
  router.push({ path: '/court/court_map', query: { status: 0 } });
};

const goToAudit = (record) => {
  router.push({ path: '/court/court_map', query: { name: record.name } });
};

// ---- 数据获取 ----
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getDashboardData(trendDays.value);
    if (res?.code === 200 && res.data) {
      data.value = res.data;
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
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
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 24px;
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
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.total {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-icon.pending {
  background: #fff7e6;
  color: #faad14;
}

.stat-icon.published {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon.users {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-icon.today {
  background: #fff1f0;
  color: #ff4d4f;
}

.chart {
  width: 100%;
  height: 300px;
}

.chart-card :deep(.ant-card-body) {
  padding: 12px;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 20px;
  }
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  .chart {
    height: 250px;
  }
}
</style>
