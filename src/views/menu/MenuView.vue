<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="菜单名称">
          <a-input v-model:value="searchForm.menuName" placeholder="请输入菜单名称" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="菜单类型">
          <a-select v-model:value="searchForm.menuType" placeholder="全部" allowClear style="width: 120px">
            <a-select-option :value="1">目录</a-select-option>
            <a-select-option :value="2">菜单</a-select-option>
            <a-select-option :value="3">按钮</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.status" placeholder="全部" allowClear style="width: 100px">
            <a-select-option :value="1">显示</a-select-option>
            <a-select-option :value="0">隐藏</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="toggleExpand">{{ expandAll ? '折叠' : '展开' }}全部</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格 -->
    <a-card title="菜单列表">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAdd(0)">
            <template #icon><plus-outlined /></template>
            新增顶级菜单
          </a-button>
        </a-space>
      </template>

      <BaseTable
        :key="tableKey"
        :columns="columns"
        :data-source="treeData"
        :pagination="false"
        :loading="loading"
        :scroll-x="1080"
        :default-expand-all-rows="expandAll"
      >
        <template #menuType="{ record }">
          <a-tag :color="typeColorMap[record.menuType]">
            {{ typeLabelMap[record.menuType] }}
          </a-tag>
        </template>
        <template #icon="{ record }">
          <span v-if="record.icon">{{ record.icon }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '显示' : '隐藏' }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleAdd(record.id)">新增子菜单</a-button>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确认删除该菜单及其子菜单？" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
      width="600px"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="mt-4">
        <a-form-item label="上级菜单">
          <a-tree-select
            v-model:value="form.parentId"
            :tree-data="parentTreeData"
            :field-names="{ label: 'menuName', value: 'id', children: 'children' }"
            placeholder="选择上级菜单（不选则为顶级）"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>
        <a-form-item label="菜单类型" name="menuType">
          <a-radio-group v-model:value="form.menuType">
            <a-radio :value="1">目录</a-radio>
            <a-radio :value="2">菜单</a-radio>
            <a-radio :value="3">按钮</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="菜单名称" name="menuName">
              <a-input v-model:value="form.menuName" placeholder="请输入菜单名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="路由路径" name="menuPath">
              <a-input v-model:value="form.menuPath" placeholder="如 /user 或 user" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="form.menuType !== 3">
          <a-col :span="12">
            <a-form-item label="组件路径">
              <a-input v-model:value="form.component" placeholder="如 system/user/index" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="图标">
              <a-input v-model:value="form.icon" placeholder="图标名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="form.menuType === 3">
          <a-col :span="24">
            <a-form-item label="权限标识">
              <a-input v-model:value="form.permission" placeholder="如 system:user:add" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model:value="form.sort" :min="0" style="width: 100%" placeholder="排序号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-radio-group v-model:value="form.status">
                <a-radio :value="1">显示</a-radio>
                <a-radio :value="0">隐藏</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  getMenuPage,
  getMenuTree,
  getMenuDetail,
  addMenu,
  updateMenu,
  deleteMenu,
} from '@/api/menu'

const typeLabelMap = { 1: '目录', 2: '菜单', 3: '按钮' }
const typeColorMap = { 1: 'purple', 2: 'blue', 3: 'green' }

// ---- 搜索 ----
const searchForm = reactive({ menuName: '', menuType: undefined, status: undefined })
const loading = ref(false)
const treeData = ref([])
const expandAll = ref(true)
const tableKey = ref(0)

const toggleExpand = () => {
  expandAll.value = !expandAll.value
  tableKey.value++
}

const columns = [
  { title: '菜单名称', dataIndex: 'menuName', key: 'menuName', width: 200 },
  { title: '类型', dataIndex: 'menuType', key: 'menuType', width: 80, align: 'center', slots: { customRender: 'menuType' } },
  { title: '路由路径', dataIndex: 'menuPath', key: 'menuPath', width: 150 },
  { title: '权限标识', dataIndex: 'permission', key: 'permission', width: 160 },
  { title: '图标', dataIndex: 'icon', key: 'icon', width: 100 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 70, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center', slots: { customRender: 'status' } },
  { title: '操作', key: 'action', width: 240, fixed: 'right', slots: { customRender: 'action' } },
]

const fetchData = async () => {
  loading.value = true
  try {
    // 优先用树形接口
    const res = await getMenuTree()
    if (res?.data) {
      treeData.value = filterTree(res.data, searchForm.menuName, searchForm.menuType, searchForm.status)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 前端过滤树
function filterTree(nodes, menuName, menuType, status) {
  if (!menuName && menuType === undefined && status === undefined) return nodes
  return nodes
    .map((node) => {
      const children = node.children ? filterTree(children, menuName, menuType, status) : []
      const nameMatch = !menuName || node.menuName?.includes(menuName)
      const typeMatch = menuType === undefined || node.menuType === menuType
      const statusMatch = status === undefined || node.status === status
      if (nameMatch && typeMatch && statusMatch) return { ...node, children }
      if (children.length) return { ...node, children }
      return null
    })
    .filter(Boolean)
}

const handleSearch = () => fetchData()
const handleReset = () => {
  Object.assign(searchForm, { menuName: '', menuType: undefined, status: undefined })
  handleSearch()
}

// ---- 新增/编辑 ----
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const defaultForm = () => ({
  id: undefined, parentId: 0, menuName: '', menuType: 2, menuPath: '',
  component: '', icon: '', sort: 0, status: 1, permission: '',
})
const form = reactive(defaultForm())

const rules = {
  menuName: [{ required: true, message: '请输入菜单名称' }],
  menuType: [{ required: true, message: '请选择菜单类型' }],
}

// 上级菜单树（添加"顶级菜单"选项）
const parentTreeData = computed(() => {
  return [{ id: 0, menuName: '顶级菜单', children: treeData.value }]
})

const handleAdd = (parentId) => {
  Object.assign(form, defaultForm())
  form.parentId = parentId || 0
  isEdit.value = false
  modalVisible.value = true
}

const handleEdit = async (record) => {
  isEdit.value = true
  try {
    const res = await getMenuDetail(record.id)
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
      await updateMenu(form)
      message.success('更新成功')
    } else {
      await addMenu(form)
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
    await deleteMenu(id)
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
