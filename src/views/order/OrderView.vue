<template>
  <div class="order-container">
    <a-row :gutter="16" class="statistics-row">
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">待付款</div>
              <div class="stat-value text-pending">{{ statistics.pendingPayment || 0 }}</div>
            </div>
            <div class="stat-icon pending">
              <ClockCircleOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">已发货</div>
              <div class="stat-value text-shipped">{{ statistics.shipped || 0 }}</div>
            </div>
            <div class="stat-icon shipped">
              <CarOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">已完成</div>
              <div class="stat-value text-completed">{{ statistics.completed || 0 }}</div>
            </div>
            <div class="stat-icon completed">
              <CheckCircleOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="table-card">
      <div class="table-header">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="订单号">
            <a-input v-model:value="searchForm.orderNo" placeholder="请输入订单号" style="width: 180px" allowClear />
          </a-form-item>
          <a-form-item label="订单状态">
            <a-select v-model:value="searchForm.status" placeholder="请选择状态" style="width: 140px" allowClear>
              <a-select-option :value="1">待付款</a-select-option>
              <a-select-option :value="2">已付款</a-select-option>
              <a-select-option :value="3">已发货</a-select-option>
              <a-select-option :value="4">已完成</a-select-option>
              <a-select-option :value="5">已取消</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <SearchOutlined /> 搜索
              </a-button>
              <a-button @click="handleReset">
                <ReloadOutlined /> 重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <BaseTable
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #productImage="{ record }">
          <div class="image-cell" @click="openImagePreview(record)" v-if="getImageUrls(record).length > 0">
            <img :src="getImageUrls(record)[0]" alt="商品图片" style="width: 60px; height: 60px; object-fit: cover; cursor: pointer; border-radius: 4px;" />
            <div class="image-badge" v-if="getImageUrls(record).length > 1">
              +{{ getImageUrls(record).length - 1 }}
            </div>
          </div>
          <span v-else class="no-image">暂无图片</span>
        </template>
        <template #orderNo="{ record }">
          <a @click="showDetail(record)">{{ record.orderNo }}</a>
        </template>
        <template #totalAmount="{ record }">
          <span class="amount">¥{{ record.totalAmount }}</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
        </template>
        <template #createdAt="{ text }">
          {{ formatDate(text) }}
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="showDetail(record)">详情</a-button>
            <a-button
              v-if="record.status === 2"
              type="link"
              size="small"
              @click="showShipModal(record)"
            >
              发货
            </a-button>
            <a-button
              v-if="[2, 3].includes(record.status)"
              type="link"
              size="small"
              danger
              @click="showRefundModal(record)"
            >
              退款
            </a-button>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <a-modal
      v-model:open="detailVisible"
      title="订单详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions :column="2" bordered size="small" v-if="currentOrder">
        <a-descriptions-item label="订单号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ currentOrder.productName }}</a-descriptions-item>
        <a-descriptions-item label="商品数量">{{ currentOrder.quantity }}</a-descriptions-item>
        <a-descriptions-item label="单价">¥{{ currentOrder.unitPrice }}</a-descriptions-item>
        <a-descriptions-item label="总价">¥{{ currentOrder.totalAmount }}</a-descriptions-item>
        <a-descriptions-item label="卖家ID">{{ currentOrder.sellerId }}</a-descriptions-item>
        <a-descriptions-item label="买家ID">{{ currentOrder.buyerId }}</a-descriptions-item>
        <a-descriptions-item label="收货人">{{ currentOrder.receiverName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ currentOrder.receiverPhone }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">{{ currentOrder.receiverAddress }}</a-descriptions-item>
        <a-descriptions-item label="买家留言" :span="2">{{ currentOrder.remark || '无' }}</a-descriptions-item>
        <a-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ currentOrder.paymentTime ? formatDate(currentOrder.paymentTime) : '未支付' }}</a-descriptions-item>
        <a-descriptions-item label="商品图片" :span="2">
          <div class="detail-image-list" v-if="getImageUrls(currentOrder).length > 0">
            <img
              v-for="(url, index) in getImageUrls(currentOrder)"
              :key="index"
              :src="url"
              alt="商品图片"
              style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 8px;"
            />
          </div>
          <span v-else>暂无图片</span>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal
      v-model:open="imagePreviewVisible"
      title="商品图片"
      :footer="null"
      width="800px"
    >
      <div class="image-preview-container">
        <img
          v-for="(url, index) in previewImages"
          :key="index"
          :src="url"
          :alt="'商品图片' + (index + 1)"
          class="preview-image"
        />
      </div>
    </a-modal>

    <a-modal
      v-model:open="shipVisible"
      title="订单发货"
      @ok="handleShip"
      :confirmLoading="shipLoading"
    >
      <a-form :model="shipForm" layout="vertical" ref="shipFormRef">
        <a-form-item label="物流公司" name="logisticsCompany" :rules="[{ required: true, message: '请输入物流公司' }]">
          <a-input v-model:value="shipForm.logisticsCompany" placeholder="请输入物流公司" />
        </a-form-item>
        <a-form-item label="物流单号" name="trackingNumber" :rules="[{ required: true, message: '请输入物流单号' }]">
          <a-input v-model:value="shipForm.trackingNumber" placeholder="请输入物流单号" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="refundVisible"
      title="订单退款"
      @ok="handleRefund"
      :confirmLoading="refundLoading"
    >
      <a-form :model="refundForm" layout="vertical" ref="refundFormRef">
        <a-form-item label="退款原因" name="refundReason" :rules="[{ required: true, message: '请输入退款原因' }]">
          <a-textarea v-model:value="refundForm.refundReason" placeholder="请输入退款原因" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import BaseTable from '@/components/BaseTable.vue';
import { getOrderPage, getOrderDetail, shipOrder, refundOrder, getOrderStatistics } from '@/api/order';
import { message } from 'ant-design-vue';

const loading = ref(false);
const detailVisible = ref(false);
const shipVisible = ref(false);
const refundVisible = ref(false);
const shipLoading = ref(false);
const refundLoading = ref(false);
const imagePreviewVisible = ref(false);
const currentOrder = ref(null);
const previewImages = ref([]);
const dataList = ref([]);

const searchForm = reactive({
  orderNo: '',
  status: undefined
});

const shipForm = reactive({
  logisticsCompany: '',
  trackingNumber: ''
});

const refundForm = reactive({
  refundReason: ''
});

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const statistics = ref({
  pendingPayment: 0,
  shipped: 0,
  completed: 0
});

const columns = [
  {
    title: '商品图片',
    key: 'productImage',
    slots: { customRender: 'productImage' },
    width: 100
  },
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    slots: { customRender: 'orderNo' },
    width: 180
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    key: 'productName',
    width: 200
  },
  {
    title: '单价',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    width: 100
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 80
  },
  {
    title: '总价',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    slots: { customRender: 'totalAmount' },
    width: 120
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    width: 100
  },
  {
    title: '下单时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    slots: { customRender: 'createdAt' },
    width: 170
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
    width: 180
  }
];

const getImageUrls = (record) => {
  if (!record) return [];
  if (record.imageUrls && Array.isArray(record.imageUrls)) {
    return record.imageUrls;
  }
  if (record.productImage) {
    try {
      return JSON.parse(record.productImage);
    } catch {
      return [];
    }
  }
  return [];
};

const openImagePreview = (record) => {
  previewImages.value = getImageUrls(record);
  imagePreviewVisible.value = true;
};

const getStatusColor = (status) => {
  const colors = {
    1: 'orange',
    2: 'blue',
    3: 'cyan',
    4: 'green',
    5: 'default'
  };
  return colors[status] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    1: '待付款',
    2: '已付款',
    3: '已发货',
    4: '已完成',
    5: '已取消'
  };
  return texts[status] || '未知';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const fetchStatistics = async () => {
  try {
    const res = await getOrderStatistics();
    if (res && res.code === 200 && res.data) {
      statistics.value = res.data;
    }
  } catch (error) {
    console.error('获取订单统计失败:', error);
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      orderNo: searchForm.orderNo || undefined,
      status: searchForm.status || undefined
    };
    const res = await getOrderPage(params);
    if (res && res.data) {
      dataList.value = res.data.list || [];
      pagination.value.total = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.orderNo = '';
  searchForm.status = undefined;
  pagination.value.current = 1;
  fetchData();
};

const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  fetchData();
};

const showDetail = async (record) => {
  try {
    const res = await getOrderDetail(record.id);
    if (res && res.code === 200 && res.data) {
      currentOrder.value = res.data;
      detailVisible.value = true;
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
  }
};

const showShipModal = (record) => {
  currentOrder.value = record;
  shipForm.logisticsCompany = '';
  shipForm.trackingNumber = '';
  shipVisible.value = true;
};

const showRefundModal = (record) => {
  currentOrder.value = record;
  refundForm.refundReason = '';
  refundVisible.value = true;
};

const handleShip = async () => {
  if (!shipForm.logisticsCompany || !shipForm.trackingNumber) {
    message.error('请填写完整的物流信息');
    return;
  }
  shipLoading.value = true;
  try {
    const res = await shipOrder(currentOrder.value.id, {
      logisticsCompany: shipForm.logisticsCompany,
      trackingNumber: shipForm.trackingNumber
    });
    if (res && res.code === 200) {
      message.success('发货成功');
      shipVisible.value = false;
      fetchData();
      fetchStatistics();
    }
  } catch (error) {
    console.error('发货失败:', error);
  } finally {
    shipLoading.value = false;
  }
};

const handleRefund = async () => {
  if (!refundForm.refundReason) {
    message.error('请填写退款原因');
    return;
  }
  refundLoading.value = true;
  try {
    const res = await refundOrder(currentOrder.value.id, {
      refundReason: refundForm.refundReason
    });
    if (res && res.code === 200) {
      message.success('退款处理成功');
      refundVisible.value = false;
      fetchData();
      fetchStatistics();
    }
  } catch (error) {
    console.error('退款处理失败:', error);
  } finally {
    refundLoading.value = false;
  }
};

onMounted(() => {
  fetchStatistics();
  fetchData();
});
</script>

<style scoped>
.order-container {
  padding: 20px;
}

.statistics-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
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
  line-height: 1.2;
}

.text-pending {
  color: #fa8c16;
}

.text-shipped {
  color: #1890ff;
}

.text-completed {
  color: #52c41a;
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

.stat-icon.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.shipped {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-icon.completed {
  background: #f6ffed;
  color: #52c41a;
}

.table-card {
  border-radius: 8px;
}

.table-header {
  margin-bottom: 16px;
}

.amount {
  color: #ff4d4f;
  font-weight: 600;
}

.image-cell {
  position: relative;
  display: inline-block;
}

.image-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
}

.no-image {
  color: #999;
  font-size: 12px;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.detail-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>