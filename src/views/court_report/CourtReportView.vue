<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="处理状态">
          <a-select v-model:value="searchForm.status" placeholder="全部" allowClear style="width: 120px">
            <a-select-option :value="0">待处理</a-select-option>
            <a-select-option :value="1">已处理</a-select-option>
            <a-select-option :value="2">已忽略</a-select-option>
            <a-select-option :value="3">已关闭</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="反馈类型">
          <a-select v-model:value="searchForm.reportType" placeholder="全部" allowClear style="width: 120px">
            <a-select-option :value="1">场地破损</a-select-option>
            <a-select-option :value="2">设施问题</a-select-option>
            <a-select-option :value="3">环境问题</a-select-option>
            <a-select-option :value="4">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关键字">
          <a-input v-model:value="searchForm.keyword" placeholder="搜索反馈内容或球场名称" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格 -->
    <a-card title="球场问题反馈列表">
      <BaseTable
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        :scroll-x="1200"
        @change="handleTableChange"
      >
        <template #reportTypeDesc="{ record }">
          <a-tag :color="reportTypeColor(record.reportType)">
            {{ record.reportTypeDesc }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">
            {{ record.statusDesc }}
          </a-tag>
        </template>
        <template #images="{ record }">
          <template v-if="parseImages(record.images).length > 0">
            <a-image-preview-group>
              <a-space>
                <a-image
                  v-for="(img, idx) in parseImages(record.images).slice(0, 2)"
                  :key="idx"
                  :src="img"
                  :width="40"
                  :height="40"
                  style="object-fit: cover; border-radius: 4px;"
                />
              </a-space>
              <span v-if="parseImages(record.images).length > 2" class="text-xs text-gray-400 ml-1">
                +{{ parseImages(record.images).length - 2 }}
              </span>
            </a-image-preview-group>
          </template>
          <span v-else>-</span>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleViewDetail(record)">详情</a-button>
            <a-button
              v-if="record.status !== 1 && record.status !== 3"
              type="link"
              size="small"
              @click="handleHandle(record)"
            >处理</a-button>
            <a-popconfirm :title="`确认删除该反馈？`" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="球场反馈详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions :column="2" bordered size="small" v-if="currentDetail">
        <a-descriptions-item label="反馈ID">{{ currentDetail.id }}</a-descriptions-item>
        <a-descriptions-item label="反馈用户">{{ currentDetail.nickname }}</a-descriptions-item>
        <a-descriptions-item label="球场名称">{{ currentDetail.courtName }}</a-descriptions-item>
        <a-descriptions-item label="反馈类型">
          <a-tag :color="reportTypeColor(currentDetail.reportType)">
            {{ currentDetail.reportTypeDesc }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="处理状态">
          <a-tag :color="statusColor(currentDetail.status)">
            {{ currentDetail.statusDesc }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="反馈内容" :span="2">{{ currentDetail.content }}</a-descriptions-item>
        <a-descriptions-item label="反馈图片" :span="2" v-if="parseImages(currentDetail.images).length > 0">
          <a-image-preview-group>
            <a-space wrap>
              <a-image
                v-for="(img, idx) in parseImages(currentDetail.images)"
                :key="idx"
                :src="img"
                :width="80"
                :height="80"
                style="object-fit: cover; border-radius: 4px;"
              />
            </a-space>
          </a-image-preview-group>
        </a-descriptions-item>
        <a-descriptions-item label="管理员回复" :span="2" v-if="currentDetail.adminRemark">
          {{ currentDetail.adminRemark }}
        </a-descriptions-item>
        <a-descriptions-item label="提交时间">{{ currentDetail.createTime }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ currentDetail.updateTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 处理弹窗 -->
    <a-modal
      v-model:open="handleVisible"
      title="处理反馈"
      :confirm-loading="handleLoading"
      @ok="handleSubmitHandle"
      @cancel="handleVisible = false"
    >
      <a-form ref="handleFormRef" :model="handleForm" :rules="handleRules" layout="vertical" class="mt-4">
        <a-form-item label="目标状态" name="status">
          <a-radio-group v-model:value="handleForm.status">
            <a-radio :value="1">已处理</a-radio>
            <a-radio :value="2">已忽略</a-radio>
            <a-radio :value="3">已关闭</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="处理备注" name="adminRemark">
          <a-textarea
            v-model:value="handleForm.adminRemark"
            placeholder="请输入处理备注/回复内容"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { getCourtReportPage, getCourtReportDetail, handleCourtReport, deleteCourtReport } from '@/api/courtReport'

const route = useRoute()

// ---- 搜索 ----
const searchForm = reactive({ status: undefined, reportType: undefined, keyword: '' })
const loading = ref(false)
const dataList = ref([])
const pagination = ref({
  current: 1, pageSize: 10, total: 0,
  showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '反馈用户', dataIndex: 'nickname', key: 'nickname', width: 120 },
  { title: '球场名称', dataIndex: 'courtName', key: 'courtName', width: 140, ellipsis: true },
  { title: '反馈类型', dataIndex: 'reportTypeDesc', key: 'reportTypeDesc', width: 100, align: 'center', slots: { customRender: 'reportTypeDesc' } },
  { title: '反馈内容', dataIndex: 'content', key: 'content', width: 250, ellipsis: true },
  { title: '图片', dataIndex: 'images', key: 'images', width: 120, align: 'center', slots: { customRender: 'images' } },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90, align: 'center', slots: { customRender: 'status' } },
  { title: '提交时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 160, fixed: 'right', slots: { customRender: 'action' } },
]

const reportTypeColor = (type) => {
  const colors = { 1: 'red', 2: 'orange', 3: 'purple', 4: 'default' }
  return colors[type] || 'default'
}

const statusColor = (status) => {
  const colors = { 0: 'default', 1: 'success', 2: 'warning', 3: 'error' }
  return colors[status] || 'default'
}

const parseImages = (imagesStr) => {
  if (!imagesStr) return []
  try {
    const arr = JSON.parse(imagesStr)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

const buildParams = () => {
  const params = { pageNum: pagination.value.current, pageSize: pagination.value.pageSize }
  if (searchForm.status !== undefined) params.status = searchForm.status
  if (searchForm.reportType !== undefined) params.reportType = searchForm.reportType
  if (searchForm.keyword) params.keyword = searchForm.keyword
  return params
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCourtReportPage(buildParams())
    if (res?.data) {
      dataList.value = res.data.records || res.data.list || []
      pagination.value.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.value.current = 1; fetchData() }
const handleReset = () => {
  Object.assign(searchForm, { status: undefined, reportType: undefined, keyword: '' })
  handleSearch()
}
const handleTableChange = (p) => {
  pagination.value.current = p.current
  pagination.value.pageSize = p.pageSize
  fetchData()
}

// ---- 详情 ----
const detailVisible = ref(false)
const currentDetail = ref(null)

const handleViewDetail = async (record) => {
  try {
    const res = await getCourtReportDetail(record.id)
    if (res?.data) {
      currentDetail.value = res.data
      detailVisible.value = true
    }
  } catch (e) {
    message.error('获取详情失败')
  }
}

// ---- 处理 ----
const handleVisible = ref(false)
const handleLoading = ref(false)
const handleFormRef = ref(null)
const currentHandleId = ref(null)
const handleForm = reactive({ status: undefined, adminRemark: '' })

const handleRules = {
  status: [{ required: true, message: '请选择目标状态' }],
}

const handleHandle = (record) => {
  currentHandleId.value = record.id
  Object.assign(handleForm, { status: undefined, adminRemark: '' })
  handleVisible.value = true
}

const handleSubmitHandle = async () => {
  try {
    await handleFormRef.value?.validate()
    handleLoading.value = true
    await handleCourtReport(currentHandleId.value, handleForm)
    message.success('处理成功')
    handleVisible.value = false
    fetchData()
  } catch (e) {
    if (e.errorFields) return
    message.error('处理失败')
  } finally {
    handleLoading.value = false
  }
}

// ---- 删除 ----
const handleDelete = async (id) => {
  try {
    await deleteCourtReport(id)
    message.success('删除成功')
    fetchData()
  } catch (e) {
    message.error('删除失败')
  }
}

// ---- 从通知跳转过来时，自动打开详情 ----
watch(() => route.query.id, (newId) => {
  if (newId && route.path === '/court/court_report') {
    handleViewDetail({ id: Number(newId) })
  }
}, { immediate: true })

onMounted(() => {
  fetchData()
})
</script>
