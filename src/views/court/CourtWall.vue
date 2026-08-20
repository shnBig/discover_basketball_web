<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="球场名称">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="请输入球场名称"
            allowClear
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="城市编码">
          <a-input
            v-model:value="searchForm.cityCode"
            placeholder="请输入城市编码"
            allowClear
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="全部"
            allowClear
            style="width: 120px"
          >
            <a-select-option :value="1">展示中</a-select-option>
            <a-select-option :value="0">已下架</a-select-option>
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

    <!-- 表格 -->
    <a-card title="球场墙列表">
      <BaseTable
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        :scroll-x="1100"
        @change="handleTableChange"
      >
        <template #coverImage="{ record }">
          <a-image
            v-if="record.coverImage"
            :src="record.coverImage"
            :width="60"
            :height="45"
            style="object-fit: cover; border-radius: 4px;"
          />
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'default'">
            {{ record.status === 1 ? '展示中' : '已下架' }}
          </a-tag>
        </template>
        <template #pendingContributionCount="{ record }">
          <a-badge
            v-if="record.pendingContributionCount > 0"
            :count="record.pendingContributionCount"
            :overflow-count="99"
          />
          <span v-else class="text-gray-400">0</span>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="openContribution(record)">球场贡献</a-button>
            <a-popconfirm
              v-if="record.status === 1"
              :title="`确认将球场「${record.name}」从球场墙移除？`"
              @confirm="handleRemove(record)"
            >
              <a-button type="link" danger size="small" :loading="removeLoadingId === record.courtId">移除</a-button>
            </a-popconfirm>
            <a-popconfirm
              v-else
              :title="`确认重新上架球场「${record.name}」？`"
              @confirm="handleRelist(record)"
            >
              <a-button type="link" size="small" :loading="relistLoadingId === record.courtId">上架</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <!-- 球场贡献弹窗 -->
    <a-modal
      v-model:open="contributionVisible"
      :title="`球场贡献 - ${contributionCourtName}`"
      :footer="null"
      width="1100px"
      @cancel="handleContributionCancel"
    >
      <!-- 状态筛选按钮 -->
      <div class="flex gap-2 mb-4">
        <a-button
          v-for="item in contributionStatusOptions"
          :key="item.value"
          :type="contributionStatus === item.value ? 'primary' : 'default'"
          @click="handleContributionStatusChange(item.value)"
        >
          {{ item.label }}
        </a-button>
      </div>

      <!-- 暂存区 -->
      <a-card v-if="fieldAdoptions.length > 0" size="small" class="mb-4" :body-style="{ padding: '12px' }">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">已选字段（暂存）</span>
          <a-button type="primary" size="small" :loading="submitLoading" @click="handleSubmitAdoptions">
            提交处理
          </a-button>
        </div>
        <div class="flex flex-wrap gap-2">
          <a-tag
            v-for="(item, index) in fieldAdoptions"
            :key="getAdoptionKey(item)"
            closable
            color="blue"
            @close="removeAdoption(index)"
          >
            {{ item.label }}: {{ item.field === 'imageUrls' ? '' : (fieldValueMap[item.field] ? fieldValueMap[item.field](item.value) : item.value) }}
            <span class="text-xs text-gray-400">(#{{ item.contributionId }})</span>
          </a-tag>
        </div>
      </a-card>

      <!-- 提交按钮（暂存区为空时也显示） -->
      <div v-else class="flex justify-end mb-4">
        <a-button type="primary" :loading="submitLoading" :disabled="fieldAdoptions.length === 0" @click="handleSubmitAdoptions">
          提交处理
        </a-button>
      </div>

      <!-- 贡献列表 -->
      <a-table
        :columns="contributionColumns"
        :data-source="contributionList"
        :pagination="contributionPagination"
        :loading="contributionLoading"
        row-key="id"
        :scroll="{ x: 1300 }"
        size="small"
        @change="handleContributionTableChange"
      >
        <template #status="{ record }">
          <a-tag :color="contributionStatusColor(record.status)">
            {{ record.statusDesc }}
          </a-tag>
        </template>
        <template #imageUrls="{ record }">
          <template v-if="record.imageUrls && record.imageUrls.length > 0">
            <div class="flex flex-wrap gap-1">
              <div
                v-for="(img, idx) in record.imageUrls"
                :key="idx"
                class="relative cursor-pointer"
                :class="{ 'opacity-30': record.status !== 0 }"
                @click="record.status === 0 && toggleImage(record.id, idx, img)"
              >
                <a-image
                  :src="img"
                  :width="36"
                  :height="36"
                  :preview="false"
                  style="object-fit: cover; border-radius: 4px;"
                  :class="{ 'ring-2 ring-blue-500': isImageSelected(record.id, idx) }"
                />
                <span
                  v-if="isImageSelected(record.id, idx)"
                  class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs"
                  style="font-size: 10px;"
                >✓</span>
              </div>
            </div>
          </template>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #material="{ record }">
          <span
            :class="fieldCellClass('material', record)"
            @click="record.status === 0 && toggleField('material', record.id, record)"
          >{{ materialLabelMap[record.material] || '-' }}</span>
        </template>
        <template #hasLight="{ record }">
          <span
            :class="fieldCellClass('hasLight', record)"
            @click="record.status === 0 && toggleField('hasLight', record.id, record)"
          >{{ record.hasLight === 1 ? '有' : record.hasLight === 0 ? '无' : '-' }}</span>
        </template>
        <template #isFree="{ record }">
          <span
            :class="fieldCellClass('isFree', record)"
            @click="record.status === 0 && toggleField('isFree', record.id, record)"
          >{{ record.isFree === 1 ? '免费' : record.isFree === 0 ? '收费' : '-' }}</span>
        </template>
        <template #feeDesc="{ record }">
          <span
            :class="fieldCellClass('feeDesc', record)"
            @click="record.status === 0 && toggleField('feeDesc', record.id, record)"
          >{{ record.feeDesc || '-' }}</span>
        </template>
        <template #fullCourtQty="{ record }">
          <span
            :class="fieldCellClass('fullCourtQty', record)"
            @click="record.status === 0 && toggleField('fullCourtQty', record.id, record)"
          >{{ record.fullCourtQty !== null && record.fullCourtQty !== undefined ? record.fullCourtQty : '-' }}</span>
        </template>
        <template #halfCourtQty="{ record }">
          <span
            :class="fieldCellClass('halfCourtQty', record)"
            @click="record.status === 0 && toggleField('halfCourtQty', record.id, record)"
          >{{ record.halfCourtQty !== null && record.halfCourtQty !== undefined ? record.halfCourtQty : '-' }}</span>
        </template>
        <template #indoorOutdoor="{ record }">
          <span
            :class="fieldCellClass('indoorOutdoor', record)"
            @click="record.status === 0 && toggleField('indoorOutdoor', record.id, record)"
          >{{ indoorOutdoorLabelMap[record.indoorOutdoor] || '-' }}</span>
        </template>
        <template #openTime="{ record }">
          <span
            :class="fieldCellClass('openTime', record)"
            @click="record.status === 0 && toggleField('openTime', record.id, record)"
          >{{ record.openTime || '-' }}</span>
        </template>
        <template #adminRemark="{ record }">
          <span v-if="record.adminRemark">{{ record.adminRemark }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #contributionAction="{ record }">
          <a-button
            v-if="record.status === 0"
            type="link"
            danger
            size="small"
            @click="openReject(record)"
          >驳回</a-button>
        </template>
      </a-table>
    </a-modal>

    <!-- 驳回贡献弹窗 -->
    <a-modal
      v-model:open="rejectVisible"
      title="驳回贡献"
      :confirm-loading="rejectLoading"
      @ok="handleRejectConfirm"
    >
      <a-form layout="vertical">
        <a-form-item label="驳回原因" required>
          <a-textarea
            v-model:value="rejectRemark"
            placeholder="请输入驳回原因，将展示给小程序用户"
            :rows="4"
            :maxlength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useIsMobile } from '@/composables/useIsMobile'
import { getCourtWallPage, removeCourtFromWall, addCourtToWall, getContributionPage, handleCourtContributions, rejectContribution } from '@/api/courtWall'

const statusLabelMap = { 0: '已下架', 1: '展示中' }
const statusColorMap = { 0: 'default', 1: 'green' }

const materialLabelMap = { 0:'未知' ,1: '水泥', 2: '沥青', 3: '硅PU', 4: '木地板', 5: '悬浮底板' }
const indoorOutdoorLabelMap = { 1: '室内', 2: '室外' }

const fieldLabelMap = {
  material: '材质',
  hasLight: '灯光',
  isFree: '收费',
  feeDesc: '收费描述',
  fullCourtQty: '全场数量',
  halfCourtQty: '半场数量',
  indoorOutdoor: '室内外',
  openTime: '开放时间',
  imageUrls: '图片',
}

const fieldValueMap = {
  material: (v) => materialLabelMap[v] || '-',
  hasLight: (v) => v === 1 ? '有' : v === 0 ? '无' : '-',
  isFree: (v) => v === 1 ? '免费' : v === 0 ? '收费' : '-',
  indoorOutdoor: (v) => indoorOutdoorLabelMap[v] || '-',
}

const fieldCellClass = (field, record) => {
  const base = 'cursor-pointer px-1 py-0.5 rounded transition-colors'
  if (record.status !== 0) return base + ' text-gray-400'
  if (isFieldSelected(field, record.id)) return base + ' bg-blue-100 text-blue-700 font-medium'
  return base + ' hover:bg-blue-50 hover:text-blue-600'
}

// ---- 球场贡献 ----
const contributionVisible = ref(false)
const contributionCourtId = ref(null)
const contributionCourtName = ref('')
const contributionStatus = ref(undefined)
const contributionLoading = ref(false)
const contributionList = ref([])
const contributionPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (t) => `共 ${t} 条`,
})

const contributionStatusOptions = [
  { value: undefined, label: '全部' },
  { value: 0, label: '待审核' },
  { value: 1, label: '已通过' },
  { value: 2, label: '已驳回' },
  { value: 3, label: '未被选中' },
]

const contributionStatusColor = (status) => {
  const colors = { 0: 'orange', 1: 'green', 2: 'red', 3: 'default' }
  return colors[status] || 'default'
}

// 暂存区：已选中的字段采纳列表
const fieldAdoptions = reactive([])

const getAdoptionKey = (item) => {
  if (item.field === 'imageUrls') {
    return `${item.field}_${item.contributionId}_${item.imageIndex}`
  }
  return `${item.field}_${item.contributionId}`
}

const isFieldSelected = (field, contributionId) => {
  return fieldAdoptions.some(a => a.field === field && a.contributionId === contributionId)
}

const isImageSelected = (contributionId, imageIndex) => {
  return fieldAdoptions.some(a => a.field === 'imageUrls' && a.contributionId === contributionId && a.imageIndex === imageIndex)
}

const toggleField = (field, contributionId, record) => {
  if (field === 'imageUrls') return
  const idx = fieldAdoptions.findIndex(a => a.field === field && a.contributionId === contributionId)
  if (idx !== -1) {
    fieldAdoptions.splice(idx, 1)
    return
  }
  // 同一字段只能从一条贡献中选取，先移除同字段的已有选择
  const existIdx = fieldAdoptions.findIndex(a => a.field === field)
  if (existIdx !== -1) {
    fieldAdoptions.splice(existIdx, 1)
  }
  const value = record[field]
  if (value !== null && value !== undefined && value !== '') {
    fieldAdoptions.push({ field, contributionId, label: fieldLabelMap[field], value })
  }
}

const toggleImage = (contributionId, imageIndex, imageUrl) => {
  const idx = fieldAdoptions.findIndex(a => a.field === 'imageUrls' && a.contributionId === contributionId && a.imageIndex === imageIndex)
  if (idx !== -1) {
    fieldAdoptions.splice(idx, 1)
    return
  }
  fieldAdoptions.push({ field: 'imageUrls', contributionId, imageIndex, label: `图片[${imageIndex}]`, value: imageUrl })
}

const removeAdoption = (index) => {
  fieldAdoptions.splice(index, 1)
}

const submitLoading = ref(false)

// ---- 驳回 ----
const rejectVisible = ref(false)
const rejectLoading = ref(false)
const rejectRemark = ref('')
const rejectContributionId = ref(null)

const openReject = (record) => {
  rejectContributionId.value = record.id
  rejectRemark.value = ''
  rejectVisible.value = true
}

const handleRejectConfirm = async () => {
  if (!rejectRemark.value.trim()) {
    message.warning('驳回原因不能为空')
    return
  }
  rejectLoading.value = true
  try {
    await rejectContribution({
      contributionId: rejectContributionId.value,
      adminRemark: rejectRemark.value.trim(),
    })
    message.success('驳回成功')
    rejectVisible.value = false
    fetchContributionList()
    fetchData()
  } catch (e) {
    message.error(e?.response?.data?.msg || '驳回失败')
  } finally {
    rejectLoading.value = false
  }
}

const handleSubmitAdoptions = async () => {
  if (fieldAdoptions.length === 0) {
    message.warning('至少需要选择一个字段或一张图片')
    return
  }
  submitLoading.value = true
  try {
    const data = {
      fieldAdoptions: fieldAdoptions.map(a => {
        const item = { field: a.field, contributionId: a.contributionId }
        if (a.field === 'imageUrls') {
          item.imageIndex = a.imageIndex
        }
        return item
      })
    }
    await handleCourtContributions(contributionCourtId.value, data)
    message.success('处理成功')
    fieldAdoptions.length = 0
    fetchContributionList()
    fetchData()
  } catch (e) {
    message.error(e?.response?.data?.msg || '处理失败')
  } finally {
    submitLoading.value = false
  }
}

const contributionColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '用户', dataIndex: 'nickname', key: 'nickname', width: 100 },
  { title: '材质', dataIndex: 'material', key: 'material', width: 70, slots: { customRender: 'material' } },
  { title: '灯光', dataIndex: 'hasLight', key: 'hasLight', width: 60, slots: { customRender: 'hasLight' } },
  { title: '收费', dataIndex: 'isFree', key: 'isFree', width: 60, slots: { customRender: 'isFree' } },
  { title: '收费描述', dataIndex: 'feeDesc', key: 'feeDesc', width: 120, ellipsis: true, slots: { customRender: 'feeDesc' } },
  { title: '全场', dataIndex: 'fullCourtQty', key: 'fullCourtQty', width: 60, slots: { customRender: 'fullCourtQty' } },
  { title: '半场', dataIndex: 'halfCourtQty', key: 'halfCourtQty', width: 60, slots: { customRender: 'halfCourtQty' } },
  { title: '室内外', dataIndex: 'indoorOutdoor', key: 'indoorOutdoor', width: 70, slots: { customRender: 'indoorOutdoor' } },
  { title: '开放时间', dataIndex: 'openTime', key: 'openTime', width: 110, slots: { customRender: 'openTime' } },
  { title: '图片', dataIndex: 'imageUrls', key: 'imageUrls', width: 120, slots: { customRender: 'imageUrls' } },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center', slots: { customRender: 'status' } },
  { title: '管理员备注', dataIndex: 'adminRemark', key: 'adminRemark', width: 130, ellipsis: true, slots: { customRender: 'adminRemark' } },
  { title: '提交时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
  { title: '操作', key: 'action', width: 70, align: 'center', slots: { customRender: 'contributionAction' } },
]

const openContribution = (record) => {
  contributionCourtId.value = record.courtId
  contributionCourtName.value = record.name
  contributionStatus.value = undefined
  contributionPagination.value.current = 1
  fieldAdoptions.length = 0
  contributionVisible.value = true
  fetchContributionList()
}

const handleContributionCancel = () => {
  contributionVisible.value = false
  fieldAdoptions.length = 0
}

const handleContributionStatusChange = (status) => {
  contributionStatus.value = status
  contributionPagination.value.current = 1
  fieldAdoptions.length = 0
  fetchContributionList()
}

const handleContributionTableChange = (p) => {
  contributionPagination.value.current = p.current
  contributionPagination.value.pageSize = p.pageSize
  fetchContributionList()
}

const fetchContributionList = async () => {
  contributionLoading.value = true
  try {
    const params = {
      pageNum: contributionPagination.value.current,
      pageSize: contributionPagination.value.pageSize,
      courtId: contributionCourtId.value,
    }
    if (contributionStatus.value !== undefined) {
      params.status = contributionStatus.value
    }
    const res = await getContributionPage(params)
    if (res?.data) {
      contributionList.value = res.data.records || res.data.list || []
      contributionPagination.value.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    contributionLoading.value = false
  }
}

// ---- 搜索 ----
const searchForm = reactive({
  keyword: '',
  cityCode: '',
  status: undefined,
})
const loading = ref(false)
const dataList = ref([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (t) => `共 ${t} 条`,
})

const { isMobile } = useIsMobile()

const columns = computed(() => [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '封面', dataIndex: 'coverImage', key: 'coverImage', width: 80, align: 'center', slots: { customRender: 'coverImage' } },
  { title: '球场名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 220 },
  { title: '区/县', dataIndex: 'district', key: 'district', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90, align: 'center', slots: { customRender: 'status' } },
  { title: '待处理贡献', dataIndex: 'pendingContributionCount', key: 'pendingContributionCount', width: 100, align: 'center', slots: { customRender: 'pendingContributionCount' } },
  { title: '添加时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 180, ...(isMobile.value ? {} : { fixed: 'right' }), slots: { customRender: 'action' } },
])

const buildParams = () => {
  const params = {
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize,
  }
  if (searchForm.keyword) params.keyword = searchForm.keyword
  if (searchForm.cityCode) params.cityCode = searchForm.cityCode
  if (searchForm.status !== undefined) params.status = searchForm.status
  return params
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCourtWallPage(buildParams())
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

const handleSearch = () => {
  pagination.value.current = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchForm, { keyword: '', cityCode: '', status: undefined })
  handleSearch()
}

const handleTableChange = (p) => {
  pagination.value.current = p.current
  pagination.value.pageSize = p.pageSize
  fetchData()
}

// ---- 移除 ----
const removeLoadingId = ref(null)

const handleRemove = async (record) => {
  removeLoadingId.value = record.courtId
  try {
    await removeCourtFromWall(record.courtId)
    message.success('移除成功')
    fetchData()
  } catch (e) {
    message.error('移除失败')
  } finally {
    removeLoadingId.value = null
  }
}

// ---- 上架 ----
const relistLoadingId = ref(null)

const handleRelist = async (record) => {
  relistLoadingId.value = record.courtId
  try {
    await addCourtToWall({ courtId: record.courtId })
    message.success('上架成功')
    fetchData()
  } catch (e) {
    message.error('上架失败')
  } finally {
    relistLoadingId.value = null
  }
}

onMounted(() => {
  fetchData()
})
</script>