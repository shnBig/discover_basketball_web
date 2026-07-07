<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="城市编码">
          <a-input v-model:value="searchForm.cityCode" placeholder="请输入城市编码" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="城市名称">
          <a-input v-model:value="searchForm.cityName" placeholder="请输入城市名称" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="是否开放">
          <a-select v-model:value="searchForm.isOpen" placeholder="全部" allowClear style="width: 100px">
            <a-select-option :value="1">已开放</a-select-option>
            <a-select-option :value="0">未开放</a-select-option>
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
    <a-card title="城市配置列表">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><plus-outlined /></template>
          新增城市
        </a-button>
      </template>

      <BaseTable
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        :scroll-x="700"
        @change="handleTableChange"
      >
        <template #isOpen="{ record }">
          <a-tag :color="record.isOpen === 1 ? 'green' : 'default'">
            {{ record.isOpen === 1 ? '已开放' : '未开放' }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm :title="`确认删除「${record.cityName}」？`" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑城市配置' : '新增城市配置'"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="mt-4">
        <a-form-item label="城市编码" name="cityCode">
          <a-input v-model:value="form.cityCode" placeholder="请输入城市编码，如 110000" />
        </a-form-item>
        <a-form-item label="城市名称" name="cityName">
          <a-input v-model:value="form.cityName" placeholder="请输入城市名称" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="是否开放">
              <a-radio-group v-model:value="form.isOpen">
                <a-radio :value="1">已开放</a-radio>
                <a-radio :value="0">未开放</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="优先级">
              <a-input-number v-model:value="form.priority" :min="0" style="width: 100%" placeholder="数值越大越优先" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { getCityPage, getCityDetail, addCity, updateCity, deleteCity } from '@/api/city'
import { getCourtDataApi } from '@/api/amap/court';
// ---- 搜索 ----
const searchForm = reactive({ cityCode: '', cityName: '', isOpen: undefined })
const loading = ref(false)
const dataList = ref([])
const pagination = ref({
  current: 1, pageSize: 10, total: 0,
  showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '城市编码', dataIndex: 'cityCode', key: 'cityCode', width: 120 },
  { title: '城市名称', dataIndex: 'cityName', key: 'cityName', width: 150 },
  { title: '是否开放', dataIndex: 'isOpen', key: 'isOpen', width: 100, align: 'center', slots: { customRender: 'isOpen' } },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80, align: 'center', sorter: (a, b) => a.priority - b.priority },
  { title: '纬度', dataIndex: 'latitude', key: 'latitude', width: 100, align: 'center' },
  { title: '经度', dataIndex: 'longitude', key: 'longitude', width: 100, align: 'center'},
  
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 170 },
  { title: '操作', key: 'action', width: 140, fixed: 'right', slots: { customRender: 'action' } },
]

const buildParams = () => {
  const params = { pageNum: pagination.value.current, pageSize: pagination.value.pageSize }
  if (searchForm.cityCode) params.cityCode = searchForm.cityCode
  if (searchForm.cityName) params.cityName = searchForm.cityName
  if (searchForm.isOpen !== undefined) params.isOpen = searchForm.isOpen
  return params
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCityPage(buildParams())
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
  Object.assign(searchForm, { cityCode: '', cityName: '', isOpen: undefined })
  handleSearch()
}
const handleTableChange = (p) => {
  pagination.value.current = p.current
  pagination.value.pageSize = p.pageSize
  fetchData()
}

// ---- 新增/编辑 ----
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const defaultForm = () => ({ id: undefined, cityCode: '', cityName: '', isOpen: 0, priority: 0 })
const form = reactive(defaultForm())

const rules = {
  cityCode: [{ required: true, message: '请输入城市编码' }],
  cityName: [{ required: true, message: '请输入城市名称' }],
}

const handleAdd = () => {
  Object.assign(form, defaultForm())
  isEdit.value = false
  modalVisible.value = true
}

const handleEdit = async (record) => {
  isEdit.value = true
  try {
    const res = await getCityDetail(record.id)
    if (res?.data) {
      Object.assign(form, res.data)
      modalVisible.value = true
    }
  } catch (e) {
    message.error('获取详情失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    modalLoading.value = true
    if (isEdit.value) {
      await updateCity(form)
      message.success('更新成功')
    } else {
      await addCity(form)
      message.success('新增成功')
    }
    modalVisible.value = false
    fetchData()
  } catch (e) {
    message.error('操作失败')
  } finally {
    modalLoading.value = false
  }
}

// ---- 删除 ----
const handleDelete = async (id) => {
  try {
    await deleteCity(id)
    message.success('删除成功')
    fetchData()
  } catch (e) {
    message.error('删除失败')
  }
}



onMounted(() => {
  fetchData()
})
</script>
