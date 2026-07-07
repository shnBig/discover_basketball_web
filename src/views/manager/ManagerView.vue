<template>
  <div class="p-6 space-y-4">
    <!-- 搜索栏 -->
    <a-card>
      <a-form layout="inline" :model="searchForm" class="flex flex-wrap gap-4">
        <a-form-item label="用户名">
          <a-input v-model:value="searchForm.username" placeholder="请输入用户名" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="真实姓名">
          <a-input v-model:value="searchForm.realName" placeholder="请输入真实姓名" allowClear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="searchForm.phone" placeholder="请输入手机号" allowClear @keyup.enter="handleSearch" />
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
    <a-card title="管理员列表">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><plus-outlined /></template>
          新增管理员
        </a-button>
      </template>

      <BaseTable
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        :scroll-x="2020"
        @change="handleTableChange"
      >
        <template #avatarUrl="{ record }">
          <a-avatar :src="record.avatarUrl" :size="40">
            {{ record.realName?.charAt(0) }}
          </a-avatar>
        </template>
        <template #roleDetails="{ record }">
          <template v-if="record.roleDetails?.length">
            <a-tag v-for="role in record.roleDetails" :key="role.id" color="blue" class="mb-1">
              {{ role.roleName }}
            </a-tag>
          </template>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #menuDetails="{ record }">
          <template v-if="record.menuDetails?.length">
            <a-tag v-for="menu in record.menuDetails" :key="menu.id" color="green" class="mb-1">
              {{ menu.menuName }}
            </a-tag>
          </template>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handlePassword(record)">改密</a-button>
            <a-button type="link" size="small" @click="handleAssignRoles(record)">分配角色</a-button>
            <a-popconfirm title="确认删除该管理员？" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑管理员' : '新增管理员'"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
      width="560px"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="mt-4">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="form.username" placeholder="请输入用户名" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="真实姓名" name="realName">
              <a-input v-model:value="form.realName" placeholder="请输入真实姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="!isEdit">
          <a-col :span="12">
            <a-form-item label="密码" name="password">
              <a-input-password v-model:value="form.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="确认密码" name="confirmPassword">
              <a-input-password v-model:value="form.confirmPassword" placeholder="请再次输入密码" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input v-model:value="form.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="form.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="头像">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :max-count="1"
            :custom-request="handleUpload"
            :remove="handleRemoveAvatar"
          >
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div class="mt-1 text-xs">上传头像</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:open="passwordVisible"
      title="修改密码"
      :confirm-loading="passwordLoading"
      @ok="handlePasswordSubmit"
      @cancel="passwordVisible = false"
    >
      <a-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" layout="vertical" class="mt-4">
        <a-form-item label="旧密码" name="oldPassword">
          <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入旧密码" />
        </a-form-item>
        <a-form-item label="新密码" name="newPassword">
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配角色弹窗 -->
    <a-modal
      v-model:open="roleVisible"
      title="分配角色"
      :confirm-loading="roleLoading"
      @ok="handleRoleSubmit"
      @cancel="roleVisible = false"
    >
      <a-form layout="vertical" class="mt-4">
        <a-form-item label="选择角色">
          <a-select
            v-model:value="selectedRoleIds"
            mode="multiple"
            placeholder="请选择角色"
            :options="roleOptions"
            :filter-option="filterOption"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  getManagerPage,
  addManager,
  updateManager,
  deleteManager,
  getManagerDetailApi,
  updateManagerPassword,
  assignRoles,
} from '@/api/manager'
import { getAllRole } from '@/api/role'
import { uploadFileImage } from '@/api/upload'

// ---- 搜索 ----
const searchForm = reactive({ username: '', realName: '', phone: '', status: undefined })
const loading = ref(false)
const dataList = ref([])
const pagination = ref({
  current: 1, pageSize: 10, total: 0,
  showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
  { title: '真实姓名', dataIndex: 'realName', key: 'realName', width: 120 },
  { title: '头像', dataIndex: 'avatarUrl', key: 'avatarUrl', width: 80, align: 'center', slots: { customRender: 'avatarUrl' } },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 140 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 180 },
  { title: '所属角色', dataIndex: 'roleDetails', key: 'roleDetails', width: 200, slots: { customRender: 'roleDetails' } },
  { title: '所属权限', dataIndex: 'menuDetails', key: 'menuDetails', width: 200, slots: { customRender: 'menuDetails' } },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center', slots: { customRender: 'status' } },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 260, fixed: 'right', slots: { customRender: 'action' } },
]

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchForm,
    }
    // 清除空值
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k])
    const res = await getManagerPage(params)
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
  Object.assign(searchForm, { username: '', realName: '', phone: '', status: undefined })
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
const fileList = ref([])

const defaultForm = () => ({
  id: undefined, username: '', realName: '', password: '', confirmPassword: '',
  phone: '', email: '', avatarUrl: '', status: 1,
})
const form = reactive(defaultForm())

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  realName: [{ required: true, message: '请输入真实姓名' }],
  password: [{ required: true, message: '请输入密码' }],
  confirmPassword: [{ required: true, message: '请确认密码' }],
}

const handleAdd = () => {
  Object.assign(form, defaultForm())
  fileList.value = []
  isEdit.value = false
  modalVisible.value = true
}

const handleEdit = async (record) => {
  isEdit.value = true
  try {
    const res = await getManagerDetailApi(record.id)
    if (res?.data) {
      Object.assign(form, res.data)
      form.password = ''
      form.confirmPassword = ''
      fileList.value = res.data.avatarUrl
        ? [{ uid: '-1', name: 'avatar', status: 'done', url: res.data.avatarUrl }]
        : []
      modalVisible.value = true
    }
  } catch (e) {
    message.error('获取详情失败')
  }
}

const handleSubmit = async () => {
  try {
    if (!isEdit.value && form.password !== form.confirmPassword) {
      message.error('两次密码不一致'); return
    }
    modalLoading.value = true
    const data = { ...form }
    delete data.confirmPassword
    if (isEdit.value) {
      delete data.password
      await updateManager(data)
      message.success('更新成功')
    } else {
      await addManager(data)
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
    await deleteManager(id)
    message.success('删除成功')
    fetchData()
  } catch (e) {
    message.error('删除失败')
  }
}

// ---- 修改密码 ----
const passwordVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref(null)
const passwordRecordId = ref(null)
const passwordForm = reactive({ oldPassword: '', newPassword: '' })
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码' }],
  newPassword: [{ required: true, message: '请输入新密码' }],
}

const handlePassword = (record) => {
  passwordRecordId.value = record.id
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordVisible.value = true
}

const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value?.validate()
    passwordLoading.value = true
    await updateManagerPassword({
      userId: passwordRecordId.value,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })
    message.success('密码修改成功')
    passwordVisible.value = false
  } catch (e) {
    message.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// ---- 分配角色 ----
const roleVisible = ref(false)
const roleLoading = ref(false)
const roleAdminId = ref(null)
const selectedRoleIds = ref([])
const roleOptions = ref([])

const loadRoles = async () => {
  try {
    const res = await getAllRole()
    if (res?.data) {
      roleOptions.value = res.data.map((r) => ({ label: r.roleName, value: r.id }))
    }
  } catch (e) { /* ignore */ }
}

const handleAssignRoles = (record) => {
  roleAdminId.value = record.id
  selectedRoleIds.value = record.roles || []
  roleVisible.value = true
}

const handleRoleSubmit = async () => {
  try {
    roleLoading.value = true
    await assignRoles({ adminId: roleAdminId.value, roleIds: selectedRoleIds.value })
    message.success('分配角色成功')
    roleVisible.value = false
    fetchData()
  } catch (e) {
    message.error('分配角色失败')
  } finally {
    roleLoading.value = false
  }
}

const filterOption = (input, option) => option.label.toLowerCase().includes(input.toLowerCase())

// ---- 上传头像 ----
const handleUpload = async ({ file, onSuccess, onError }) => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('dir', 'admin_avatar')
  try {
    const res = await uploadFileImage(fd)
    if (res?.data?.url) {
      form.avatarUrl = res.data.url
      onSuccess(res.data)
      message.success('上传成功')
    } else {
      onError(new Error('上传失败'))
    }
  } catch (e) {
    onError(e)
    message.error('上传失败')
  }
}

const handleRemoveAvatar = () => {
  form.avatarUrl = ''
  fileList.value = []
}

onMounted(() => {
  fetchData()
  loadRoles()
})
</script>
