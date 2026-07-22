<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="球场名称">
          <a-input
            v-model:value="searchForm.courtName"
            placeholder="请输入球场名称"
            allowClear
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="审核状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="全部"
            allowClear
            style="width: 150px"
          >
            <a-select-option :value="0">审核中</a-select-option>
            <a-select-option :value="1">AI审核通过</a-select-option>
            <a-select-option :value="2">AI审核未通过</a-select-option>
            <a-select-option :value="3">人工审核通过</a-select-option>
            <a-select-option :value="4">人工审核不通过</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 球场图片列表 -->
    <a-card title="球场图片管理">
      <a-spin :spinning="loading">
        <div v-if="dataList.length" class="space-y-6">
          <div
            v-for="court in dataList"
            :key="court.courtId"
            class="court-group"
          >
            <!-- 球场标题 -->
            <div class="court-group__header">
              <span class="court-group__name">
                <EnvironmentOutlined class="mr-1" />
                {{ court.courtName }}
              </span>
              <a-tag>{{ court.images?.length || 0 }} 张图片</a-tag>
            </div>

            <!-- 图片列表 -->
            <div class="court-group__images">
              <div
                v-for="img in court.images"
                :key="img.id"
                class="image-card"
              >
                <!-- 图片预览 -->
                <a-image
                  :src="img.imageUrl"
                  :width="160"
                  :height="120"
                  style="object-fit: cover; border-radius: 8px 8px 0 0;"
                  :preview="true"
                />

                <!-- 图片信息 -->
                <div class="image-card__info">
                  <!-- 封面标记 -->
                  <a-tag v-if="img.isCover === 1" color="blue" class="mb-1">
                    封面
                  </a-tag>

                  <!-- 审核状态 -->
                  <a-tag :color="auditStatusColorMap[img.status]" class="mb-1">
                    {{ auditStatusMap[img.status] }}
                  </a-tag>

                  <!-- 百度审核结果 -->
                  <div v-if="img.baiduAuditResult" class="image-card__result" :title="img.baiduAuditResult">
                    <span class="text-xs text-gray-500">AI:</span>
                    <span class="text-xs truncate">{{ img.baiduAuditResult }}</span>
                  </div>

                  <!-- 时间 -->
                  <div class="image-card__time">
                    {{ img.createTime }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a-empty v-else description="暂无数据" />
      </a-spin>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <a-pagination
          v-model:current="pagination.current"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="true"
          :show-total="(total) => `共 ${total} 条`"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import { getCourtImagePage } from '@/api/court'

// ---- 常量 ----
const auditStatusMap = {
  0: '审核中',
  1: 'AI审核通过',
  2: 'AI审核未通过',
  3: '人工审核通过',
  4: '人工审核不通过',
}
const auditStatusColorMap = {
  0: 'processing',
  1: 'success',
  2: 'error',
  3: 'green',
  4: 'volcano',
}

// ---- 搜索 ----
const searchForm = reactive({
  courtName: '',
  status: undefined,
})
const loading = ref(false)
const dataList = ref([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

// ---- 数据加载 ----
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchForm,
    }
    // 清除空值
    Object.keys(params).forEach((k) => {
      if (params[k] === undefined || params[k] === '') delete params[k]
    })
    const res = await getCourtImagePage(params)
    if (res?.data) {
      dataList.value = res.data.list || res.data.records || []
      pagination.value.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchForm, { courtName: '', status: undefined })
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.value.current = page
  fetchData()
}

const handleSizeChange = (_, size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.court-group {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.court-group:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.court-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.court-group__name {
  font-weight: 600;
  font-size: 15px;
  color: #1d2129;
  display: flex;
  align-items: center;
}

.court-group__images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-card {
  width: 160px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.image-card__info {
  padding: 8px;
}

.image-card__result {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  max-width: 140px;
}

.image-card__time {
  font-size: 11px;
  color: #86909c;
  margin-top: 4px;
}
</style>
