<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="角色名称">
          <a-input v-model:value="searchForm.name" placeholder="请输入角色名称" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="角色编码">
          <a-input v-model:value="searchForm.code" placeholder="请输入角色编码" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.status" placeholder="全部" allowClear style="width: 120px">
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
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
    <a-card title="角色列表">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><plus-outlined /></template>
          新增角色
        </a-button>
      </template>

      <BaseTable
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        :scroll-x="970"
        @change="handleTableChange"
      >
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handleAssignMenus(record)">分配菜单</a-button>
            <a-popconfirm title="确认删除该角色？" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="mt-4">
        <a-form-item label="角色名称" name="roleName">
          <a-input v-model:value="form.roleName" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色编码" name="roleCode">
          <a-input v-model:value="form.roleCode" placeholder="请输入角色编码，如 admin" />
        </a-form-item>
        <a-form-item label="备注" name="description">
          <a-textarea v-model:value="form.description" placeholder="请输入备注" :rows="3" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="分配菜单">
          <a-tree
            v-if="menuTreeData.length"
            checkable
            check-strictly
            :tree-data="menuTreeData"
            :field-names="{ title: 'menuName', key: 'id', children: 'children' }"
            v-model:checkedKeys="form.menuIds"
            default-expand-all
            :height="250"
            @check="onMenuCheck"
          />
          <a-empty v-else description="暂无菜单数据" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配菜单弹窗 -->
    <a-modal
      v-model:open="menuVisible"
      title="分配菜单权限"
      :confirm-loading="menuLoading"
      @ok="handleMenuSubmit"
      @cancel="menuVisible = false"
      width="500px"
    >
      <div class="mt-4 max-h-96 overflow-y-auto">
        <a-tree
          v-if="menuTreeData.length"
          checkable
          check-strictly
          :tree-data="menuTreeData"
          :field-names="{ title: 'menuName', key: 'id', children: 'children' }"
          v-model:checkedKeys="selectedMenuIds"
          default-expand-all
          @check="onAssignMenuCheck"
        />
        <a-empty v-else description="暂无菜单数据" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  getRolePage,
  addRole,
  updateRole,
  deleteRole,
  getRoleDetail,
  assignMenus,
} from '@/api/role'
import { getMenuTree } from '@/api/menu'

// ---- 搜索 ----
const searchForm = reactive({ name: '', code: '', status: undefined })
const loading = ref(false)
const dataList = ref([])
const pagination = ref({
  current: 1, pageSize: 10, total: 0,
  showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName', width: 150 },
  { title: '角色编码', dataIndex: 'roleCode', key: 'roleCode', width: 130 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center', slots: { customRender: 'status' } },
  { title: '备注', dataIndex: 'description', key: 'description', width: 150, ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 220, fixed: 'right', slots: { customRender: 'action' } },
]

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchForm,
    }
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k])
    const res = await getRolePage(params)
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
  Object.assign(searchForm, { name: '', code: '', status: undefined })
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

const defaultForm = () => ({
  id: undefined,
  roleName: '',
  roleCode: '',
  description: '',
  status: 1,
  // check-strictly 模式需要 { checked: [], halfChecked: [] } 格式
  menuIds: { checked: [], halfChecked: [] }
})
const form = reactive(defaultForm())

const rules = {
  roleName: [{ required: true, message: '请输入角色名称' }],
  roleCode: [{ required: true, message: '请输入角色编码' }],
}

const handleAdd = () => {
  Object.assign(form, defaultForm())
  isEdit.value = false
  modalVisible.value = true
}

const handleEdit = async (record) => {
  isEdit.value = true
  try {
    const res = await getRoleDetail(record.id)
    if (res?.data) {
      // 后端返回的 menuIds 是数组，需要转成 check-strictly 格式
      const data = { ...res.data }
      if (Array.isArray(data.menuIds)) {
        data.menuIds = { checked: data.menuIds, halfChecked: [] }
      }
      Object.assign(form, data)
      modalVisible.value = true
    }
  } catch (e) {
    message.error('获取详情失败')
  }
}

// 提交时收集所有选中的 ID（包括父级和子集）
const collectFormMenuIds = () => {
  const checkedSet = new Set(form.menuIds.checked || [])
  const result = new Set()

  const traverse = (nodes) => {
    for (const node of nodes) {
      if (checkedSet.has(node.id)) {
        result.add(node.id)
      }
      if (node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(menuTreeData.value)
  return [...result]
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    modalLoading.value = true
    const submitData = { ...form, menuIds: collectFormMenuIds() }
    if (isEdit.value) {
      await updateRole(submitData)
      message.success('更新成功')
    } else {
      await addRole(submitData)
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
    await deleteRole(id)
    message.success('删除成功')
    fetchData()
  } catch (e) {
    message.error('删除失败')
  }
}

// ---- 分配菜单 ----
const menuVisible = ref(false)
const menuLoading = ref(false)
const menuRoleId = ref(null)
// check-strictly 模式需要 { checked: [], halfChecked: [] } 格式
const selectedMenuIds = ref({ checked: [], halfChecked: [] })
const menuTreeData = ref([])

const loadMenuTree = async () => {
  try {
    const res = await getMenuTree()
    if (res?.data) {
      menuTreeData.value = res.data
    }
  } catch (e) { /* ignore */ }
}

// 递归获取节点及其所有子节点的 ID
const getAllChildIds = (node) => {
  let ids = [node.id]
  if (node.children) {
    node.children.forEach(child => {
      ids = ids.concat(getAllChildIds(child))
    })
  }
  return ids
}

// 前端点击父级时联动选中所有子集
const onMenuCheck = (_, { node, checked }) => {
  const ids = getAllChildIds(node)
  const currentChecked = form.menuIds.checked || []
  if (checked) {
    // 选中：添加该节点及所有子节点
    const newKeys = new Set([...currentChecked, ...ids])
    form.menuIds = { checked: [...newKeys], halfChecked: [] }
  } else {
    // 取消：移除该节点及所有子节点
    const removeSet = new Set(ids)
    form.menuIds = {
      checked: currentChecked.filter(id => !removeSet.has(id)),
      halfChecked: []
    }
  }
}

// 分配菜单弹窗的联动逻辑
const onAssignMenuCheck = (_, { node, checked }) => {
  const ids = getAllChildIds(node)
  const currentChecked = selectedMenuIds.value.checked || []
  if (checked) {
    const newKeys = new Set([...currentChecked, ...ids])
    selectedMenuIds.value = { checked: [...newKeys], halfChecked: [] }
  } else {
    const removeSet = new Set(ids)
    selectedMenuIds.value = {
      checked: currentChecked.filter(id => !removeSet.has(id)),
      halfChecked: []
    }
  }
}

// 提交时收集所有选中的 ID（包括父级和子集）
const collectAllCheckedIds = () => {
  const checkedSet = new Set(selectedMenuIds.value.checked || [])
  const result = new Set()

  const traverse = (nodes) => {
    for (const node of nodes) {
      if (checkedSet.has(node.id)) {
        result.add(node.id)
      }
      if (node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(menuTreeData.value)
  return [...result]
}

const handleAssignMenus = (record) => {
  menuRoleId.value = record.id
  selectedMenuIds.value = { checked: record.menuIds || [], halfChecked: [] }
  menuVisible.value = true
}

const handleMenuSubmit = async () => {
  try {
    menuLoading.value = true
    const allIds = collectAllCheckedIds()
    await assignMenus({ roleId: menuRoleId.value, menuIds: allIds })
    message.success('分配菜单成功')
    menuVisible.value = false
    fetchData()
  } catch (e) {
    message.error('分配菜单失败')
  } finally {
    menuLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  loadMenuTree()
})
</script>
