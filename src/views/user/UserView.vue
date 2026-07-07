<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="昵称">
          <a-input v-model:value="searchForm.nickname" placeholder="请输入昵称" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="searchForm.phone" placeholder="请输入手机号" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="城市">
          <a-input v-model:value="searchForm.city" placeholder="请输入城市" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="性别">
          <a-select v-model:value="searchForm.gender" placeholder="全部" allowClear style="width: 100px">
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
            <a-select-option :value="0">未知</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.status" placeholder="全部" allowClear style="width: 120px">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">封禁</a-select-option>
            <a-select-option :value="2">未完善注册</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="最后登录">
          <a-range-picker v-model:value="searchForm.lastLoginTimeRange" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="['开始时间', '结束时间']" style="width: 280px" />
        </a-form-item>
        <a-form-item label="创建时间">
          <a-range-picker v-model:value="searchForm.createTimeRange" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="['开始时间', '结束时间']" style="width: 280px" />
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
    <a-card title="小程序用户列表">
      <BaseTable
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        :scroll-x="1200"
        @change="handleTableChange"
      >
        <template #avatarUrl="{ record }">
          <a-avatar :src="record.avatarUrl" :size="40">
            {{ record.nickname?.charAt(0) }}
          </a-avatar>
        </template>
        <template #gender="{ record }">
          {{ genderMap[record.gender] || '未知' }}
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColorMap[record.status]">
            {{ statusLabelMap[record.status] }}
          </a-tag>
        </template>
        <template #submitStats="{ record }">
          <span>{{ record.passCount }} / {{ record.totalSubmit }}</span>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleViewDetail(record)">详情</a-button>
            <a-button
              type="link"
              size="small"
              :loading="statusLoading === record.id"
              @click="handleStatusChange(record)"
            >
              {{ record.status === 0 ? '解封' : '封禁' }}
            </a-button>
            <a-popconfirm :title="`确认删除用户「${record.nickname}」？`" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small" :loading="deleteLoadingId === record.id">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <!-- 用户详情弹窗 -->
    <a-drawer
      v-model:open="detailVisible"
      title="用户详情"
      width="480"
      :footer="null"
    >
      <template v-if="detailData">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <a-avatar :src="detailData.avatarUrl" :size="64">
              {{ detailData.nickname?.charAt(0) }}
            </a-avatar>
            <div>
              <div class="text-lg font-medium">{{ detailData.nickname }}</div>
              <a-tag :color="statusColorMap[detailData.status]">
                {{ statusLabelMap[detailData.status] }}
              </a-tag>
            </div>
          </div>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="ID">{{ detailData.id }}</a-descriptions-item>
            <a-descriptions-item label="OpenID">{{ detailData.openid }}</a-descriptions-item>
            <a-descriptions-item label="UnionID">{{ detailData.unionid || '-' }}</a-descriptions-item>
            <a-descriptions-item label="手机号">{{ detailData.phone || '-' }}</a-descriptions-item>
            <a-descriptions-item label="城市">{{ detailData.city || '-' }}</a-descriptions-item>
            <a-descriptions-item label="性别">{{ genderMap[detailData.gender] || '未知' }}</a-descriptions-item>
            <a-descriptions-item label="提交/通过">{{ detailData.passCount }} / {{ detailData.totalSubmit }}</a-descriptions-item>
            <a-descriptions-item label="最后登录">{{ detailData.lastLoginTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ detailData.createTime }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ detailData.updateTime || '-' }}</a-descriptions-item>
          </a-descriptions>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getUserPage, getUserDetail, updateUserStatus, deleteUser } from '@/api/user'

const genderMap = { 0: '未知', 1: '男', 2: '女' }
const statusLabelMap = { 0: '封禁', 1: '正常', 2: '未完善注册' }
const statusColorMap = { 0: 'red', 1: 'green', 2: 'orange' }

// ---- 搜索 ----
const searchForm = reactive({
  nickname: '',
  phone: '',
  city: '',
  gender: undefined,
  status: undefined,
  lastLoginTimeRange: null,
  createTimeRange: null,
})
const loading = ref(false)
const dataList = ref([])
const pagination = ref({
  current: 1, pageSize: 10, total: 0,
  showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '头像', dataIndex: 'avatarUrl', key: 'avatarUrl', width: 80, align: 'center', slots: { customRender: 'avatarUrl' } },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname', width: 120 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '城市', dataIndex: 'city', key: 'city', width: 100 },
  { title: '性别', dataIndex: 'gender', key: 'gender', width: 70, align: 'center', slots: { customRender: 'gender' } },
  { title: '通过/提交', dataIndex: 'totalSubmit', key: 'submitStats', width: 100, align: 'center', slots: { customRender: 'submitStats' } },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110, align: 'center', slots: { customRender: 'status' } },
  { title: '最后登录', dataIndex: 'lastLoginTime', key: 'lastLoginTime', width: 170 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 180, fixed: 'right', slots: { customRender: 'action' } },
]

const buildParams = () => {
  const params = {
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize,
  }
  if (searchForm.nickname) params.nickname = searchForm.nickname
  if (searchForm.phone) params.phone = searchForm.phone
  if (searchForm.city) params.city = searchForm.city
  if (searchForm.gender !== undefined) params.gender = searchForm.gender
  if (searchForm.status !== undefined) params.status = searchForm.status
  if (searchForm.lastLoginTimeRange?.length === 2) {
    params.lastLoginTimeStart = dayjs(searchForm.lastLoginTimeRange[0]).format('YYYY-MM-DD HH:mm:ss')
    params.lastLoginTimeEnd = dayjs(searchForm.lastLoginTimeRange[1]).format('YYYY-MM-DD HH:mm:ss')
  }
  if (searchForm.createTimeRange?.length === 2) {
    params.createTimeStart = dayjs(searchForm.createTimeRange[0]).format('YYYY-MM-DD HH:mm:ss')
    params.createTimeEnd = dayjs(searchForm.createTimeRange[1]).format('YYYY-MM-DD HH:mm:ss')
  }
  return params
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserPage(buildParams())
    if (res?.data) {
      dataList.value = res.data.list || []
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
  Object.assign(searchForm, { nickname: '', phone: '', city: '', gender: undefined, status: undefined, lastLoginTimeRange: null, createTimeRange: null })
  handleSearch()
}
const handleTableChange = (p) => {
  pagination.value.current = p.current
  pagination.value.pageSize = p.pageSize
  fetchData()
}

// ---- 详情 ----
const detailVisible = ref(false)
const detailData = ref(null)

const handleViewDetail = async (record) => {
  try {
    const res = await getUserDetail(record.id)
    if (res?.data) {
      detailData.value = res.data
      detailVisible.value = true
    }
  } catch (e) {
    message.error('获取详情失败')
  }
}

// ---- 封禁/解封 ----
const statusLoading = ref(null)

const handleStatusChange = async (record) => {
  const newStatus = record.status === 0 ? 1 : 0
  statusLoading.value = record.id
  try {
    await updateUserStatus({ id: record.id, status: newStatus })
    message.success(newStatus === 1 ? '已解封' : '已封禁')
    fetchData()
  } catch (e) {
    message.error('操作失败')
  } finally {
    statusLoading.value = null
  }
}

// ---- 删除 ----
const deleteLoadingId = ref(null)

const handleDelete = async (id) => {
  deleteLoadingId.value = id
  try {
    await deleteUser(id)
    message.success('删除成功')
    fetchData()
  } catch (e) {
    message.error('删除失败')
  } finally {
    deleteLoadingId.value = null
  }
}

onMounted(() => {
  fetchData()
})
</script>
