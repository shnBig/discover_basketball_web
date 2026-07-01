<template>
  <div class="product-container">
    <a-row :gutter="16" class="statistics-row">
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">待审核商品</div>
              <div class="stat-value">{{ statistics.pendingAuditCount || 0 }}</div>
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
              <div class="stat-label">上架商品</div>
              <div class="stat-value">{{ statistics.onSaleCount || 0 }}</div>
            </div>
            <div class="stat-icon on-sale">
              <CheckCircleOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">商品总数</div>
              <div class="stat-value">{{ statistics.totalCount || 0 }}</div>
            </div>
            <div class="stat-icon total">
              <ShoppingOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card :title="'商品列表'" class="mt-[16px]">
      <div class="flex justify-end">
        <a-form layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="商品名称">
            <a-input
              v-model:value="searchForm.name"
              placeholder="请输入商品名称"
              @keyup.enter="handleSearch"
              allowClear
            />
          </a-form-item>
          <a-form-item label="商品分类">
            <a-select
              v-model:value="searchForm.categoryId"
              placeholder="请选择商品分类"
              style="width: 150px"
              allowClear
            >
              <a-select-option :value="0">全部分类</a-select-option>
              <a-select-option v-for="item in categoryList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width: 120px"
            >
              <a-select-option :value="0">全部</a-select-option>
              <a-select-option :value="1">待审核</a-select-option>
              <a-select-option :value="2">已上架</a-select-option>
              <a-select-option :value="3">已下架</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
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
        <template #createdAt="{ text }">
          {{ formatDate(text) }}
        </template>
        <template #imageUrls="{ record }">
          <div class="image-cell" @click="openImagePreview(record.imageUrls)" v-if="record.imageUrls && record.imageUrls.length > 0">
            <img :src="record.imageUrls[0]" :alt="'商品图片'" style="width: 60px; height: 60px; object-fit: cover; cursor: pointer; border-radius: 4px;" />
            <div class="image-badge" v-if="record.imageUrls.length > 1">
              +{{ record.imageUrls.length - 1 }}
            </div>
          </div>
          <span v-else class="no-image">暂无图片</span>
        </template>
        <template #status="{ record }">
          <a-tag class="bg-[#faad14] text-white" v-if="record.status === 1">待审核</a-tag>
          <a-tag class="bg-[#52c41a] text-white" v-else-if="record.status === 2">已上架</a-tag>
          <a-tag class="bg-[#ff4d4f] text-white" v-else>已下架</a-tag>
        </template>
        <template #auditResult="{ record }">
          <a-tag color="blue" v-if="record.auditResult === 'pending'">待审核</a-tag>
          <a-tag color="cyan" v-else-if="record.auditResult === 'ai_pass'">AI审核通过</a-tag>
          <a-tag color="red" v-else-if="record.auditResult === 'ai_fail'">AI审核驳回</a-tag>
          <a-tag color="green" v-else-if="record.auditResult === 'manual_pass'">人工审核通过</a-tag>
          <a-tag color="orange" v-else-if="record.auditResult === 'manual_fail'">人工审核驳回</a-tag>
          <a-tag v-else>-</a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleEditClick(record)">
              编辑
            </a-button>
            <a-button type="link" size="small"
              @click="openStatusModal(record.id, 2)"
              v-if="record.status === 1 || record.status === 3"
            >
              上架
            </a-button>
            <a-button type="link" size="small" danger
              @click="openStatusModal(record.id, 3)"
              v-else-if="record.status === 2"
            >
              下架
            </a-button>
            <a-button type="link" size="small" danger
              @click="openAuditModal(record)"
            >
              审核
            </a-button>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <a-modal
      v-model:open="showEditModal"
      title="编辑商品"
      :confirm-loading="editLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleEdit"
      @cancel="handleEditCancel"
    >
      <a-form :model="editForm" layout="vertical" class="add-form">
        <a-form-item
          label="商品名称"
          :rules="[{ required: true, message: '请输入商品名称' }]"
        >
          <a-input v-model:value="editForm.name" placeholder="请输入商品名称" />
        </a-form-item>
        <a-form-item label="商品描述">
          <a-textarea v-model:value="editForm.description" placeholder="请输入商品描述" :rows="3" />
        </a-form-item>
        <a-form-item label="商品图片">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            @preview="handlePreview"
            :customRequest="uploadEditFile"
            :remove="handleRemoveEdit"
          >
            <div v-if="fileList.length < 5">
              <plus-outlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </a-upload>
          <a-modal
            :open="previewVisible"
            :title="previewTitle"
            :footer="null"
            @cancel="handleCancel2"
          >
            <img alt="example" style="width: 100%" :src="previewImage" />
          </a-modal>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="imagePreviewVisible"
      title="商品图片"
      :footer="null"
      width="800px"
      @cancel="closeImagePreview"
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
      v-model:open="showStatusModal"
      :title="statusModalTitle"
      :confirm-loading="statusLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleStatusConfirm"
      @cancel="closeStatusModal"
    >
      <a-form layout="vertical">
        <a-form-item label="操作备注">
          <a-textarea
            v-model:value="statusForm.auditRemark"
            placeholder="请输入操作备注（可选）"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="showAuditModal"
      title="人工审核"
      :confirm-loading="auditLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleAuditConfirm"
      @cancel="closeAuditModal"
    >
      <a-form layout="vertical">
        <a-form-item label="审核结果">
          <a-radio-group v-model:value="auditForm.auditResult">
            <a-radio value="manual_pass">通过</a-radio>
            <a-radio value="manual_fail">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核备注">
          <a-textarea
            v-model:value="auditForm.auditRemark"
            :placeholder="auditForm.auditResult === 'manual_fail' ? '请输入驳回原因（必填）' : '请输入审核备注（可选）'"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="自动上架" v-if="auditForm.auditResult === 'manual_pass'">
          <a-switch v-model:checked="auditForm.autoOnShelf" />
          <span style="margin-left: 8px; color: #999;">开启后审核通过将自动上架商品</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, ShoppingOutlined } from "@ant-design/icons-vue";
import { uploadFileImage } from "@/api/upload";
import { getProductPage, getProductStatistics, getProductCategory, updateProductStatus, updateProductAudit } from "@/api/product";
import { message } from "ant-design-vue";

const loading = ref(false);
const editLoading = ref(false);
const showEditModal = ref(false);
const showStatusModal = ref(false);
const showAuditModal = ref(false);
const statusLoading = ref(false);
const auditLoading = ref(false);
const dataList = ref([]);
const editRecord = ref(null);
const categoryList = ref([]);

const statistics = reactive({
  pendingAuditCount: 0,
  onSaleCount: 0,
  totalCount: 0,
});

const statusForm = reactive({
  id: null,
  status: null,
  auditRemark: "",
});

const auditForm = reactive({
  id: null,
  auditResult: "manual_pass",
  auditRemark: "",
  autoOnShelf: true,
});

const statusModalTitle = computed(() => {
  return statusForm.status === 2 ? "上架商品" : "下架商品";
});

const searchForm = reactive({
  name: "",
  categoryId: 0,
  status: 0,
});

const editForm = reactive({
  id: null,
  name: "",
  description: "",
  imageUrls: [],
});

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`,
  pageSizeOptions: ["10", "20", "50", "100"],
});

const columns = [
  {
    title: "商品图片",
    dataIndex: "imageUrls",
    key: "imageUrls",
    width: 100,
    slots: { customRender: "imageUrls" },
  },
  {
    title: "商品名称",
    dataIndex: "name",
    key: "name",
    width: 200,
  },
  {
    title: "商品分类",
    dataIndex: "categoryName",
    key: "categoryName",
    width: 120,
  },
  {
    title: "商品价格",
    dataIndex: "price",
    key: "price",
    width: 120,
  },
  {
    title: "库存",
    dataIndex: "stock",
    key: "stock",
    width: 100,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 80,
    slots: { customRender: "status" },
  },
  {
    title: "审核状态",
    dataIndex: "auditResult",
    key: "auditResult",
    width: 120,
    slots: { customRender: "auditResult" },
  },
  {
    title: "审核结果描述",
    dataIndex: "auditRemark",
    key: "auditRemark",
    width: 200,
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 180,
    slots: { customRender: "createdAt" },
  },
  {
    title: "操作",
    key: "action",
    width: 180,
    slots: { customRender: "action" },
    fixed: "right",
  },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const fetchStatistics = async () => {
  try {
    const res = await getProductStatistics();
    if (res && res.code === 200 && res.data) {
      statistics.pendingAuditCount = res.data.pendingAuditCount || 0;
      statistics.onSaleCount = res.data.onSaleCount || 0;
      statistics.totalCount = res.data.totalCount || 0;
    }
  } catch (error) {
    console.error("获取商品统计信息失败:", error);
  }
};

const fetchCategoryList = async () => {
  try {
    const res = await getProductCategory();
    if (res && res.code === 200 && res.data) {
      categoryList.value = res.data || [];
    }
  } catch (error) {
    console.error("获取商品分类列表失败:", error);
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  fetchData();
};

const handleTableChange = (paginationInfo) => {
  pagination.value.current = paginationInfo.current;
  pagination.value.pageSize = paginationInfo.pageSize;
  fetchData();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      name: searchForm.name || "",
    };
    if (searchForm.categoryId !== 0) {
      params.categoryId = searchForm.categoryId;
    }
    if (searchForm.status !== 0) {
      params.status = searchForm.status;
    }
    const res = await getProductPage(params);
    if (res && res.code === 200 && res.data) {
      dataList.value = res.data.list || [];
      pagination.value.total = res.data.total || 0;
    }
  } catch (error) {
    console.error("获取商品列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleEditClick = async (record) => {
  editRecord.value = record;
  editForm.id = record.id;
  editForm.name = record.name;
  editForm.description = record.description || "";
  editForm.imageUrls = record.imageUrls || [];
  if (record.imageUrls && record.imageUrls.length > 0) {
    fileList.value = record.imageUrls.map((url, index) => ({
      uid: String(-1 - index),
      name: 'product.png',
      status: 'done',
      url: url,
    }));
  } else {
    fileList.value = [];
  }
  showEditModal.value = true;
};

const handleEdit = async () => {
  if (!editForm.name) {
    message.error("请填写商品名称");
    return;
  }

  editLoading.value = true;
  try {
    const data = {
      ...editForm,
    };
    console.log("更新商品:", data);
    message.success("更新成功");
    showEditModal.value = false;
    resetEditForm();
    fetchData();
    fetchStatistics();
  } catch (error) {
    console.error("更新商品失败:", error);
    message.error("更新失败");
  } finally {
    editLoading.value = false;
  }
};

const handleEditCancel = () => {
  showEditModal.value = false;
  resetEditForm();
};

const resetEditForm = () => {
  editForm.id = null;
  editForm.name = "";
  editForm.description = "";
  editForm.imageUrls = [];
  fileList.value = [];
};

const openStatusModal = (id, status) => {
  statusForm.id = id;
  statusForm.status = status;
  statusForm.auditRemark = "";
  showStatusModal.value = true;
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  statusForm.id = null;
  statusForm.status = null;
  statusForm.auditRemark = "";
};

const handleStatusConfirm = async () => {
  if (!statusForm.id || !statusForm.status) {
    message.error("参数错误");
    return;
  }
  statusLoading.value = true;
  try {
    const res = await updateProductStatus({
      id: statusForm.id,
      status: statusForm.status,
      auditRemark: statusForm.auditRemark,
    });
    if (res && res.code === 200) {
      message.success(statusForm.status === 2 ? "上架成功" : "下架成功");
      closeStatusModal();
      fetchData();
      fetchStatistics();
    } else {
      message.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("状态更新失败:", error);
    message.error("状态更新失败");
  } finally {
    statusLoading.value = false;
  }
};

const openAuditModal = (record) => {
  auditForm.id = record.id;
  auditForm.auditResult = "manual_pass";
  auditForm.auditRemark = "";
  auditForm.autoOnShelf = true;
  showAuditModal.value = true;
};

const closeAuditModal = () => {
  showAuditModal.value = false;
  auditForm.id = null;
  auditForm.auditResult = "manual_pass";
  auditForm.auditRemark = "";
  auditForm.autoOnShelf = true;
};

const handleAuditConfirm = async () => {
  if (!auditForm.id) {
    message.error("参数错误");
    return;
  }
  if (auditForm.auditResult === "manual_fail" && !auditForm.auditRemark.trim()) {
    message.error("驳回原因不能为空");
    return;
  }
  auditLoading.value = true;
  try {
    const res = await updateProductAudit({
      id: auditForm.id,
      auditResult: auditForm.auditResult,
      auditRemark: auditForm.auditRemark,
      autoOnShelf: auditForm.autoOnShelf,
    });
    if (res && res.code === 200) {
      message.success(auditForm.auditResult === "manual_pass" ? "审核通过" : "已驳回");
      closeAuditModal();
      fetchData();
      fetchStatistics();
    } else {
      message.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("审核操作失败:", error);
    message.error("审核操作失败");
  } finally {
    auditLoading.value = false;
  }
};

const uploadEditFile = async ({ file, onSuccess, onError }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dir", "product");
  try {
    const res = await uploadFileImage(formData);
    if (res.code === 200 && res.data) {
      editForm.imageUrls.push(res.data.url);
      message.success("上传成功");
      onSuccess(res.data);
    } else {
      message.error(res.msg || res.message || "上传失败");
      onError(new Error(res.msg || res.message || "上传失败"));
    }
  } catch (error) {
    console.error("上传图片失败:", error);
    message.error("上传失败");
    onError(error);
  }
};

const handleRemoveEdit = (file) => {
  const index = editForm.imageUrls.indexOf(file.url);
  if (index > -1) {
    editForm.imageUrls.splice(index, 1);
  }
  fileList.value = fileList.value.filter(item => item.url !== file.url);
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

const fileList = ref([]);

const imagePreviewVisible = ref(false);
const previewImages = ref([]);

const handleCancel2 = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};

const openImagePreview = (images) => {
  if (images && images.length > 0) {
    previewImages.value = images;
    imagePreviewVisible.value = true;
  }
};

const closeImagePreview = () => {
  imagePreviewVisible.value = false;
  previewImages.value = [];
};

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj));
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

onMounted(() => {
  fetchData();
  fetchStatistics();
  fetchCategoryList();
});
</script>

<style scoped>
.product-container {
  padding: 20px;
  padding-top: 0;
  padding-bottom: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.statistics-row {
  margin-bottom: 16px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.stat-icon.pending {
  background: rgba(255, 193, 7, 0.3);
}

.stat-icon.on-sale {
  background: rgba(82, 196, 26, 0.3);
}

.stat-icon.total {
  background: rgba(24, 144, 255, 0.3);
}

.add-form {
  max-height: 400px;
  overflow-y: auto;
}

.mt-\[16px\] {
  margin-top: 16px;
}

.mb-\[20px\] {
  margin-bottom: 20px;
}

.image-cell {
  position: relative;
  display: inline-block;
}

.image-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
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
  max-height: 500px;
  object-fit: contain;
  border-radius: 4px;
}
</style>