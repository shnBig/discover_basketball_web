<template>
  <div class="permission-container">
    <a-card title="用户列表" >
      <div>
        <div class="flex justify-between items-center mb-2">
          <a-button type="primary" @click="showAddModal = true">
            添加
          </a-button>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </div>

        <a-form
          layout="inline"
          :model="searchForm"
          class="search-form flex flex-wrap gap-[10px]"
        >
          <a-form-item label="用户名">
            <a-input
              v-model:value="searchForm.username"
              placeholder="请输入用户名"
              @keyup.enter="handleSearch"
              allowClear
              style="width: 120px"
            />
          </a-form-item>
          <a-form-item label="昵称">
            <a-input
              v-model:value="searchForm.nickName"
              placeholder="请输入昵称"
              @keyup.enter="handleSearch"
              allowClear
              style="width: 120px"
            />
          </a-form-item>
          <a-form-item label="手机号">
            <a-input
              v-model:value="searchForm.phone"
              placeholder="请输入手机号"
              @keyup.enter="handleSearch"
              allowClear
              style="width: 130px"
            />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input
              v-model:value="searchForm.email"
              placeholder="请输入邮箱"
              @keyup.enter="handleSearch"
              allowClear
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="性别">
            <a-select
              v-model:value="searchForm.gender"
              placeholder="请选择"
              @keyup.enter="handleSearch"
              allowClear
              style="width: 80px"
            >
              <a-select-option :value="1">男</a-select-option>
              <a-select-option :value="2">女</a-select-option>
              <a-select-option :value="0">未知</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择"
              @keyup.enter="handleSearch"
              allowClear
              style="width: 80px"
            >
              <a-select-option :value="1">正常</a-select-option>
              <a-select-option :value="2">禁用</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="创建时间">
            <a-range-picker
              v-model:value="searchForm.createTimeRange"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              :placeholder="['开始时间', '结束时间']"
              style="width: 280px"
            />
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
        <template #avatar="{ text }">
          <img v-if="text" :src="text" :alt="text" class="avatar-img" />
          <span v-else>-</span>
        </template>
        <template #gender="{ text }">
          {{ genderMap[text] || "未知" }}
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? "正常" : "禁用" }}
          </a-tag>
        </template>
        <template #creditScore="{ text }">
          <!-- 分数 -->
          <span :class="getCreditScoreClass(text)" class="w-12 font-medium">
            {{ text }}
          </span>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleEditClick(record)">
              编辑
            </a-button>
            <a-button
              type="link"
              size="small"
              @click="handlePasswordClick(record)"
            >
              修改密码
            </a-button>
            <a-button
              type="link"
              size="small"
              :loading="statusLoading === record.id"
              @click="handleStatusChange(record)"
            >
              {{ record.status === 1 ? "禁用" : "启用" }}
            </a-button>
            <a-button
              type="link"
              danger
              size="small"
              :loading="deleteLoadingId === record.id"
              @click="handleDeleteClick(record)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <a-modal
      v-model:open="showAddModal"
      title="添加用户"
      :confirm-loading="addLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleAdd"
      @cancel="handleCancel"
      width="600px"
    >
      <a-form
        ref="addFormRef"
        :model="addForm"
        :rules="addRules"
        layout="vertical"
        class="add-form"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input
                v-model:value="addForm.username"
                placeholder="请输入用户名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="昵称" name="nickName">
              <a-input
                v-model:value="addForm.nickName"
                placeholder="请输入昵称"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="密码" name="password">
              <a-input-password
                v-model:value="addForm.password"
                placeholder="请输入密码"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input
                v-model:value="addForm.phone"
                placeholder="请输入手机号"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="addForm.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="性别" name="gender">
              <a-select v-model:value="addForm.gender" placeholder="请选择性别">
                <a-select-option :value="1">男</a-select-option>
                <a-select-option :value="2">女</a-select-option>
                <a-select-option :value="0">未知</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="头像">
              <a-upload
                v-model:file-list="addFileList"
                list-type="picture-card"
                :max-count="1"
                @preview="handlePreview"
                :customRequest="uploadAddFile"
                :remove="handleRemoveAdd"
              >
                <div v-if="addFileList.length < 1">
                  <plus-outlined />
                  <div style="margin-top: 8px">上传</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="showEditModal"
      title="编辑用户"
      :confirm-loading="editLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleEdit"
      @cancel="handleEditCancel"
      width="600px"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        layout="vertical"
        class="add-form"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input
                v-model:value="editForm.username"
                placeholder="请输入用户名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="昵称" name="nickName">
              <a-input
                v-model:value="editForm.nickName"
                placeholder="请输入昵称"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input
                v-model:value="editForm.phone"
                placeholder="请输入手机号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input
                v-model:value="editForm.email"
                placeholder="请输入邮箱"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="性别" name="gender">
              <a-select
                v-model:value="editForm.gender"
                placeholder="请选择性别"
              >
                <a-select-option :value="1">男</a-select-option>
                <a-select-option :value="2">女</a-select-option>
                <a-select-option :value="0">未知</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="头像">
              <a-upload
                v-model:file-list="editFileList"
                list-type="picture-card"
                :max-count="1"
                @preview="handlePreview"
                :customRequest="uploadEditFile"
                :remove="handleRemoveEdit"
              >
                <div v-if="editFileList.length < 1">
                  <plus-outlined />
                  <div style="margin-top: 8px">上传</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="showPasswordModal"
      title="修改密码"
      :confirm-loading="passwordLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handlePasswordConfirm"
      @cancel="handlePasswordCancel"
    >
      <a-form :model="passwordForm" layout="vertical" class="add-form">
        <a-form-item
          label="旧密码"
          name="oldPassword"
          :rules="[{ required: true, message: '请输入旧密码' }]"
        >
          <a-input-password
            v-model:value="passwordForm.oldPassword"
            placeholder="请输入旧密码"
          />
        </a-form-item>
        <a-form-item
          label="新密码"
          name="newPassword"
          :rules="[{ required: true, message: '请输入新密码' }]"
        >
          <a-input-password
            v-model:value="passwordForm.newPassword"
            placeholder="请输入新密码"
          />
        </a-form-item>
        <a-form-item
          label="确认密码"
          name="confirmPassword"
          :rules="[{ required: true, message: '请输入确认密码' }]"
        >
          <a-input-password
            v-model:value="passwordForm.confirmPassword"
            placeholder="请输入确认密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="showDeleteModal"
      title="确认删除"
      :confirm-loading="deleteLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleDeleteConfirm"
      @cancel="showDeleteModal = false"
    >
      <p>
        确定要删除用户
        <strong>{{ deleteRecord?.username }}</strong> 吗？删除后无法恢复。
      </p>
    </a-modal>

    <a-modal
      :open="previewVisible"
      :title="previewTitle"
      :footer="null"
      @cancel="handleCancel2"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { uploadFileImage } from "@/api/upload";
import {
  getUserPage,
  addUser,
  getUserDetail,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserPassword,
} from "@/api/user";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

const loading = ref(false);
const addLoading = ref(false);
const editLoading = ref(false);
const deleteLoading = ref(false);
const deleteLoadingId = ref(null);
const passwordLoading = ref(false);
const statusLoading = ref(null);

const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showPasswordModal = ref(false);

const deleteRecord = ref(null);
const passwordRecord = ref(null);

const dataList = ref([]);

const genderMap = {
  0: "未知",
  1: "男",
  2: "女",
};

const searchForm = reactive({
  username: "",
  nickName: "",
  phone: "",
  email: "",
  gender: undefined,
  status: undefined,
  createTimeRange: null,
});

const addForm = reactive({
  username: "",
  nickName: "",
  password: "",
  phone: "",
  email: "",
  avatar: "",
  gender: 0,
});

const addRules = {
  username: [{ required: true, message: "请输入用户名" }],
  nickName: [{ required: true, message: "请输入昵称" }],
  password: [{ required: true, message: "请输入密码" }],
  phone: [{ required: true, message: "请输入手机号" }],
  email: [{ required: true, message: "请输入邮箱" }],
};

const editForm = reactive({
  id: null,
  username: "",
  nickName: "",
  phone: "",
  email: "",
  avatar: "",
  gender: 0,
});

const editRules = {
  username: [{ required: true, message: "请输入用户名" }],
  nickName: [{ required: true, message: "请输入昵称" }],
  phone: [{ required: true, message: "请输入手机号" }],
  email: [{ required: true, message: "请输入邮箱" }],
};

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`,
  pageSizeOptions: ["10", "20", "50", "100"],
  showQuickJumper: true,
});

const columns = [
  {
    title: "用户名",
    dataIndex: "username",
    key: "username",
    width: 120,
    sorter: true,
  },
  {
    title: "昵称",
    dataIndex: "nickName",
    key: "nickName",
    width: 120,
    sorter: true,
  },
  {
    title: "手机号",
    dataIndex: "phone",
    key: "phone",
    width: 130,
    sorter: true,
  },
  {
    title: "邮箱",
    dataIndex: "email",
    key: "email",
    width: 180,
  },
  {
    title: "头像",
    dataIndex: "avatar",
    key: "avatar",
    width: 80,
    slots: { customRender: "avatar" },
  },
  {
    title: "性别",
    dataIndex: "gender",
    key: "gender",
    width: 80,
    slots: { customRender: "gender" },
  },
  {
    title: "信用分",
    dataIndex: "creditScore",
    key: "creditScore",
    width: 90,
    sorter: true,
    slots: { customRender: "creditScore" },
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 80,
    slots: { customRender: "status" },
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
    width: 170,
    sorter: true,
    slots: { customRender: "createTime" },
  },
  {
    title: "操作",
    key: "action",
    width: 220,
    fixed: "right",
    slots: { customRender: "action" },
  },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
};

const buildQueryParams = () => {
  const params = {
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize,
  };

  if (searchForm.username) params.username = searchForm.username;
  if (searchForm.nickName) params.nickName = searchForm.nickName;
  if (searchForm.phone) params.phone = searchForm.phone;
  if (searchForm.email) params.email = searchForm.email;
  if (searchForm.gender !== undefined && searchForm.gender !== null)
    params.gender = searchForm.gender;
  if (searchForm.status !== undefined && searchForm.status !== null)
    params.status = searchForm.status;
  if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
    params.createTimeStart = dayjs(searchForm.createTimeRange[0]).format(
      "YYYY-MM-DD HH:mm:ss",
    );
    params.createTimeEnd = dayjs(searchForm.createTimeRange[1]).format(
      "YYYY-MM-DD HH:mm:ss",
    );
  }

  return params;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = buildQueryParams();
    const res = await getUserPage(params);
    if (res && res.data) {
      dataList.value = res.data.list || [];
      pagination.value.total = res.data.total || 0;
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    message.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.username = "";
  searchForm.nickName = "";
  searchForm.phone = "";
  searchForm.email = "";
  searchForm.gender = undefined;
  searchForm.status = undefined;
  searchForm.createTimeRange = null;
  handleSearch();
};

const handleTableChange = (pag, filters, sorter) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;

  if (sorter.field && sorter.order) {
    const orderMap = {
      ascend: "asc",
      descend: "desc",
    };
    pagination.value.orderByField = sorter.field;
    pagination.value.orderByDirection = orderMap[sorter.order];
  }

  fetchData();
};

const addFileList = ref([]);

const handleAdd = async () => {
  addLoading.value = true;
  try {
    const data = { ...addForm };
    const res = await addUser(data);
    if (res.code === 200) {
      message.success("添加成功");
      showAddModal.value = false;
      resetAddForm();
      fetchData();
    } else {
      message.error(res.message || "添加失败");
    }
  } catch (error) {
    console.error("添加用户失败:", error);
    message.error("添加用户失败");
  } finally {
    addLoading.value = false;
  }
};

const handleCancel = () => {
  showAddModal.value = false;
  resetAddForm();
};

const resetAddForm = () => {
  addForm.username = "";
  addForm.nickName = "";
  addForm.password = "";
  addForm.phone = "";
  addForm.email = "";
  addForm.avatar = "";
  addForm.gender = 0;
  addFileList.value = [];
};

const handleEditClick = async (record) => {
  editLoading.value = true;
  try {
    const res = await getUserDetail(record.id);
    if (res.code === 200 && res.data) {
      const data = res.data;
      editForm.id = data.id;
      editForm.username = data.username;
      editForm.nickName = data.nickName;
      editForm.phone = data.phone;
      editForm.email = data.email;
      editForm.avatar = data.avatar || "";
      editForm.gender = data.gender ?? 0;

      if (data.avatar) {
        editFileList.value = [
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: data.avatar,
          },
        ];
      } else {
        editFileList.value = [];
      }
      showEditModal.value = true;
    } else {
      message.error(res.message || "获取用户详情失败");
    }
  } catch (error) {
    console.error("获取用户详情失败:", error);
    message.error("获取用户详情失败");
  } finally {
    editLoading.value = false;
  }
};

const handleEdit = async () => {
  editLoading.value = true;
  try {
    const data = { ...editForm };
    const res = await updateUser(data);
    if (res.code === 200) {
      message.success("更新成功");
      showEditModal.value = false;
      resetEditForm();
      fetchData();
    } else {
      message.error(res.message || "更新失败");
    }
  } catch (error) {
    console.error("更新用户失败:", error);
    message.error("更新用户失败");
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
  editForm.username = "";
  editForm.nickName = "";
  editForm.phone = "";
  editForm.email = "";
  editForm.avatar = "";
  editForm.gender = 0;
  editFileList.value = [];
};

const handleDeleteClick = (record) => {
  deleteRecord.value = record;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = async () => {
  if (!deleteRecord.value) return;

  deleteLoading.value = true;
  try {
    const res = await deleteUser(deleteRecord.value.id);
    if (res.code === 200) {
      message.success("删除成功");
      showDeleteModal.value = false;
      deleteRecord.value = null;
      fetchData();
    } else {
      message.error(res.message || "删除失败");
    }
  } catch (error) {
    console.error("删除用户失败:", error);
    message.error("删除用户失败");
  } finally {
    deleteLoading.value = false;
  }
};

const handleStatusChange = async (record) => {
  const newStatus = record.status === 1 ? 2 : 1;
  const actionText = newStatus === 1 ? "启用" : "禁用";

  statusLoading.value = record.id;
  try {
    const res = await updateUserStatus({ id: record.id, status: newStatus });
    if (res.code === 200) {
      message.success(`${actionText}成功`);
      fetchData();
    } else {
      message.error(res.message || `${actionText}失败`);
    }
  } catch (error) {
    console.error(`${actionText}失败:`, error);
    message.error(`${actionText}失败`);
  } finally {
    statusLoading.value = null;
  }
};

const handlePasswordClick = (record) => {
  passwordRecord.value = record;
  resetPasswordForm();
  showPasswordModal.value = true;
};

const handlePasswordConfirm = async () => {
  if (
    !passwordForm.oldPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    message.error("请填写所有密码字段");
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error("新密码和确认密码不一致");
    return;
  }

  passwordLoading.value = true;
  try {
    const data = {
      id: passwordRecord.value.id,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    };

    const res = await updateUserPassword(data);
    if (res.code === 200) {
      message.success("修改密码成功");
      showPasswordModal.value = false;
      resetPasswordForm();
      passwordRecord.value = null;
    } else {
      message.error(res.message || "修改密码失败");
    }
  } catch (error) {
    console.error("修改密码失败:", error);
    message.error("修改密码失败");
  } finally {
    passwordLoading.value = false;
  }
};

const handlePasswordCancel = () => {
  showPasswordModal.value = false;
  resetPasswordForm();
  passwordRecord.value = null;
};

const resetPasswordForm = () => {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

const editFileList = ref([]);

const uploadAddFile = async ({ file, onSuccess, onError }) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await uploadFileImage(formData);
    if (res.code === 200 && res.data) {
      addForm.avatar = res.data.url;
      message.success("上传成功");
      onSuccess(res.data);
    } else {
      message.error(res.message || "上传失败");
      onError(new Error(res.message || "上传失败"));
    }
  } catch (error) {
    console.error("上传头像失败:", error);
    message.error("上传头像失败");
    onError(error);
  }
};

const uploadEditFile = async ({ file, onSuccess, onError }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dir", "avatar");
  try {
    const res = await uploadFileImage(formData);
    if (res.code === 200 && res.data) {
      editForm.avatar = res.data.url;
      message.success("上传成功");
      onSuccess(res.data);
    } else {
      message.error(res.msg || res.message || "上传失败");
      onError(new Error(res.msg || res.message || "上传失败"));
    }
  } catch (error) {
    console.error("上传头像失败:", error);
    message.error("上传头像失败");
    onError(error);
  }
};

const handleRemoveAdd = () => {
  addForm.avatar = "";
  addFileList.value = [];
};

const handleRemoveEdit = () => {
  editForm.avatar = "";
  editFileList.value = [];
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("");

const handleCancel2 = () => {
  previewVisible.value = false;
  previewTitle.value = "";
};

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj);
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value =
    file.name || file.url.substring(file.url.lastIndexOf("/") + 1);
};

// 信誉分颜色
const getCreditScoreClass = (score) => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.permission-container {
  padding: 16px;
}

.avatar-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.search-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.add-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}
</style>
