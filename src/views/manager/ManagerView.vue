<template>
  <div class="permission-container">
    <a-card :title="'角色列表'" class="">
      <div class="flex justify-between">
        <a-button type="primary" @click="showAddModal = true" class="mb-[20px]">
          添加
        </a-button>
        <a-form layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="管理员名称">
            <a-input
              v-model:value="searchForm.keyword"
              placeholder="请输入管理员名称"
              @keyup.enter="handleSearch"
              allowClear
            />
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
        <template #createTime="{ text }">
          {{ formatDate(text) }}
        </template>
        <template #avatar="{ text }">
          <img :src="text" :alt="text" />
        </template>
        <template #status="{ record }">
          <a-tag class="bg-[#1ab394] text-white" v-if="record.status === 1"
            >正常</a-tag
          >
          <a-tag class="bg-[#ff4d4f] text-white" v-else>禁用</a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <!-- <a-button
              type="primary"
              size="small"
              @click="handleEditClick(record)"
              >编辑</a-button
            > -->
            <a-button type="link" size="small" 
              @click="handleEditClick(record)"
            >
              编辑
            </a-button>
            <!-- 修改密码 -->
            <a-button type="link" size="small" 
              @click="handlePasswordClick(record)"
            >
              修改密码
            </a-button>
            <!-- <a-button danger size="small" @click="handleDeleteClick(record)"
              >删除</a-button
            > -->
            <!-- 修改状态，根据状态不同颜色不同 -->
            <!-- 开启 -->
            <a-button type="link" size="small" 
              @click="handleStatusChange(record.id, 1)"
              v-if="record.status === 2"
            >
              开启
            </a-button>
            <!-- 暂停 -->
            <a-button type="link" size="small" 
              danger
              @click="handleStatusChange(record.id, 2)"
              v-else
            >
              暂停
            </a-button>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <a-modal
      v-model:open="showAddModal"
      title="添加管理员"
      :confirm-loading="addLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleAdd"
      @cancel="handleCancel"
    >
      <a-form :model="addForm" layout="vertical" class="add-form">
        <a-form-item
          label="管理员名称"
          :rules="[{ required: true, message: '请输入管理员名称' }]"
        >
          <a-input
            v-model:value="addForm.username"
            placeholder="请输入管理员名称"
          />
        </a-form-item>
        <a-form-item
          label="昵称"
          :rules="[{ required: true, message: '请输入昵称' }]"
        >
          <a-input v-model:value="addForm.nickName" placeholder="请输入昵称" />
        </a-form-item>
        <!-- 密码 -->
        <a-form-item
          label="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
        <!-- 打开小眼睛查看密码 -->
          <a-input-password v-model:value="addForm.password" placeholder="请输入密码" />
        </a-form-item>

        <a-form-item
          label="电话号"
          :rules="[{ required: true, message: '请输入电话号码' }]"
        >
          <a-input v-model:value="addForm.phone" placeholder="请输入电话号码" />
        </a-form-item>
        <a-form-item
          label="邮箱"
          :rules="[{ required: true, message: '请输入邮箱' }]"
        >
          <a-input v-model:value="addForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        <!-- 上传头像 -->
        <a-form-item
          label="头像"
        >
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :max-count="1"
            @preview="handlePreview"
            :customRequest="uploadFile"
            :remove="handleRemoveAdd"
          >
            <div v-if="fileList.length < 1">
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
      v-model:open="showEditModal"
      title="编辑角色"
      :confirm-loading="editLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleEdit"
      @cancel="handleEditCancel"
    >
      <a-form :model="editForm" layout="vertical" class="add-form">
        <a-form-item
          label="管理员名称"
          :rules="[{ required: true, message: '请输入管理员名称' }]"
        >
          <a-input
            v-model:value="editForm.username"
            placeholder="请输入管理员名称"
          />
        </a-form-item>
        <a-form-item
          label="昵称"
          :rules="[{ required: true, message: '请输入昵称' }]"
        >
          <a-input v-model:value="editForm.nickName" placeholder="请输入昵称" />
        </a-form-item>

        <a-form-item
          label="电话号"
          :rules="[{ required: true, message: '请输入电话号码' }]"
        >
          <a-input v-model:value="editForm.phone" placeholder="请输入电话号码" />
        </a-form-item>
        <a-form-item
          label="邮箱"
          :rules="[{ required: true, message: '请输入邮箱' }]"
        >
          <a-input v-model:value="editForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        <!-- 上传头像 -->
        <a-form-item
          label="头像"
        >
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :max-count="1"
            @preview="handlePreview"
            :customRequest="uploadEditFile"
            :remove="handleRemoveEdit"
          >
            <div v-if="fileList.length < 1">
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
                <!-- 选择关联角色 -->
        <a-form-item
          label="关联角色"
          :rules="[{ required: true, message: '请选择关联角色' }]"
        >
          <a-select
            v-model:value="editForm.roleIds"
            show-search
            placeholder="请选择关联角色"
            :options="roleList"
            :filter-option="filterOption"
            mode="multiple"
          ></a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码模态框 -->
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
          :rules="[{ required: true, message: '请输入旧密码' }]"
        >
          <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入旧密码" />
        </a-form-item>
        <a-form-item
          label="新密码"
          :rules="[{ required: true, message: '请输入新密码' }]"
        >
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item
          label="确认密码"
          :rules="[{ required: true, message: '请输入确认密码' }]"
        >
          <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请输入确认密码" />
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
        确定要删除角色 <strong>{{ deleteRecord?.roleName }}</strong> 吗？
      </p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { uploadFileImage } from "@/api/upload";
import {
  getRolePage,
  addRole,
  deleteRole,
  updateRole,
  getRoleDetail,
  getAllRole,
} from "@/api/role";
import { addManager, getManagerDetail, getManagerPage, updateManager, updateManagerStatus, updateManagerPassword } from "@/api/manager";
import { message } from "ant-design-vue";
import create from "@ant-design/icons-vue/lib/components/IconFont";

const loading = ref(false);
const addLoading = ref(false);
const editLoading = ref(false);
const deleteLoading = ref(false);
const passwordLoading = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showPasswordModal = ref(false);
const deleteRecord = ref(null);
const editRecord = ref(null);
const passwordRecord = ref(null);
const dataList = ref([]);
const roleList = ref([]);

const searchForm = reactive({
  keyword: "",
});

const addForm = reactive({
  username: "",
  nickName: "",
  password: "",
  phone: "",
  email: "",
  avatar: "",
});

const editForm = reactive({
  id: null,
  username: "",
  nickName: "",
  phone: "",
  email: "",
  avatar: "",
  roleIds: [],
});

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
});

const columns = [
  {
    title: "管理员名称",
    dataIndex: "username",
    key: "username",
    width: 180,
  },
  {
    title: "昵称",
    dataIndex: "nickName",
    key: "nickName",
    width: 180,
  },
  {
    title: "电话号",
    dataIndex: "phone",
    key: "phone",
    width: 160,
  },
  {
    title: "邮箱",
    dataIndex: "email",
    key: "email",
    width: 160,
  },
  {
    title: "头像",
    dataIndex: "avatar",
    key: "avatar",
    width: 140,
    slots: { customRender: "avatar" },
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
    width: 160,
    slots: { customRender: "createTime" },
  },
  {
    title: "操作",
    key: "action",
    width: 200,
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
      keyword: searchForm.keyword || "",
    };
    const res = await getManagerPage(params);
    if (res && res.data) {
      dataList.value = res.data.list || [];
      pagination.value.total = res.data.total || 0;
    }
  } catch (error) {
    console.error("获取管理员列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleAdd = async () => {
  if (!addForm.username || !addForm.nickName || !addForm.password || !addForm.phone || !addForm.email) {
    message.error("请填写必填字段");
    return;
  }

  addLoading.value = true;
  try {
    const data = {
      ...addForm,
    };

    const res = await addManager(data);
    if (res.code === 200) {
      message.success("添加成功");
      showAddModal.value = false;
      resetAddForm();
      fetchData();
    } else {
      message.error(res.message || "添加失败");
    }
  } catch (error) {
    console.error("添加管理员失败:", error);
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
  fileList.value = [];
};

const handleDeleteClick = (record) => {
  deleteRecord.value = record;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = async () => {
  if (!deleteRecord.value) return;

  deleteLoading.value = true;
  try {
    const res = await deleteRole(deleteRecord.value.id);
    if (res.code === 200) {
      message.success("删除成功");
      showDeleteModal.value = false;
      deleteRecord.value = null;
      fetchData();
    } else {
      message.error(res.message || "删除失败");
    }
  } catch (error) {
    console.error("删除权限失败:", error);
  } finally {
    deleteLoading.value = false;
  }
};

const handlePasswordClick = (record) => {
  passwordRecord.value = record;
  resetPasswordForm();
  showPasswordModal.value = true;
};

const handlePasswordConfirm = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
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

    const res = await updateManagerPassword(data);
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

const handleEditClick = async (record) => {
  editRecord.value = record;
  editLoading.value = true;
  try {
    const res = await getManagerDetail(record.id);
    if (res.code === 200 && res.data) {
      const data = res.data;
      editForm.id = data.id;
      editForm.username = data.username;
      editForm.nickName = data.nickName;
      editForm.phone = data.phone;
      editForm.email = data.email;
      editForm.avatar = data.avatar;
      editForm.roleIds = data.roleIds || [];
      // 更新 fileList 以显示已有头像
      if (data.avatar) {
        fileList.value = [{
          uid: '-1',
          name: 'avatar.png',
          status: 'done',
          url: data.avatar,
        }];
      } else {
        fileList.value = [];
      }
      showEditModal.value = true;
    } else {
      message.error(res.message || "获取角色详情失败");
    }
  } catch (error) {
    console.error("获取权限详情失败:", error);
    message.error("获取权限详情失败");
  } finally {
    editLoading.value = false;
  }
};

const handleEdit = async () => {
  if (!editForm.username || !editForm.nickName || !editForm.phone || !editForm.email) {
    message.error("请填写必填字段");
    return;
  }

  editLoading.value = true;
  try {
    const data = {
      ...editForm,
    };

    const res = await updateManager(data);
    if (res.code === 200) {
      message.success("更新成功");
      showEditModal.value = false;
      resetEditForm();
      fetchData();
    } else {
      message.error(res.message || "更新失败");
    }
  } catch (error) {
    console.error("更新权限失败:", error);
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
  editForm.roleIds = [];
  fileList.value = [];
};

// 获取所有的角色
const getRoleList = async () => {
  try {
    const res = await getAllRole();
    if (res.code === 200 && res.data) {
      roleList.value = res.data.map((item) => ({
        label: item.roleName,
        value: item.id,
      }));
    } else {
      message.error(res.message || "获取角色列表失败");
    }
  } catch (error) {
    console.error("获取角色列表失败:", error);
    message.error("获取角色列表失败");
  }
};
const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 上传头像
const uploadFile = async ({ file, onSuccess, onError }) => {
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
// 上传头像
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

// 删除添加表单中的头像
const handleRemoveAdd = () => {
  addForm.avatar = "";
  fileList.value = [];
};

// 删除编辑表单中的头像
const handleRemoveEdit = () => {
  editForm.avatar = "";
  fileList.value = [];
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

const fileList = ref([
  // {
  //   uid: '-1',
  //   name: 'image.png',
  //   status: 'done',
  //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  // },
  // {
  //   uid: '-2',
  //   name: 'image.png',
  //   status: 'done',
  //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  // },
  // {
  //   uid: '-3',
  //   name: 'image.png',
  //   status: 'done',
  //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  // },
  // {
  //   uid: '-4',
  //   name: 'image.png',
  //   status: 'done',
  //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  // },
  // {
  //   uid: '-xxx',
  //   percent: 50,
  //   name: 'image.png',
  //   status: 'uploading',
  //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  // },
  // {
  //   uid: '-5',
  //   name: 'image.png',
  //   status: 'error',
  // },
]);

const handleCancel2 = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj));
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

// 修改管理员状态
const handleStatusChange = async (id, status) => {
  try {
    const res = await updateManagerStatus({ id, status });
    if (res.code === 200) {
      message.success("状态更新成功");
    } else {
      message.error(res.message || "状态更新失败");
    }
    // 刷新数据
    fetchData();
  } catch (error) {
    console.error("状态更新失败:", error);
    message.error("状态更新失败");
  }
};

onMounted(() => {
  fetchData();
  getRoleList();
});
</script>

<style scoped>
.permission-container {
  padding: 20px;
  padding-top: 0;
  padding-bottom: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.card {
  margin-bottom: 20px;
}

.add-btn {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.add-form {
  max-height: 400px;
  overflow-y: auto;
}
</style>