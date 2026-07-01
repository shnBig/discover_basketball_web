<template>
  <div class="permission-container">
    <a-card :title="'角色列表'" class="">
      <div class="flex justify-between">
        <a-button type="primary" @click="showAddModal = true" class="mb-[20px]">
          添加
        </a-button>

        <a-form layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="角色名称">
            <a-input
              v-model:value="searchForm.keyword"
              placeholder="请输入角色名称"
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
        <template #permissions="{ record }">
          <!-- 便利权限数组 -->
          <div v-if="record.permissions.length > 0">
            <a-tag
              color="#2db7f5"
              v-for="item in record.permissions"
              :index="item.id"
              :key="item.id"
              class="m-1"
              >{{ item.permissionName }}</a-tag
            >
          </div>
          <div v-else>暂无权限</div>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" 
              @click="handleEditClick(record)"
              >编辑</a-button
            >
            <a-button danger type="link" size="small" @click="handleDeleteClick(record)"
              >删除</a-button
            >
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <a-modal
      v-model:open="showAddModal"
      title="添加角色"
      :confirm-loading="addLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleAdd"
      @cancel="handleCancel"
    >
      <a-form :model="addForm" layout="vertical" class="add-form">
        <a-form-item
          label="角色名称"
          :rules="[{ required: true, message: '请输入角色名称' }]"
        >
          <a-input
            v-model:value="addForm.roleName"
            placeholder="请输入角色名称"
          />
        </a-form-item>
        <a-form-item
          label="角色介绍"
          :rules="[{ required: true, message: '请输入角色介绍' }]"
        >
          <a-input
            v-model:value="addForm.description"
            placeholder="请输入角色介绍"
          />
        </a-form-item>
        <!-- 选择关联权限 -->
        <a-form-item
          label="关联权限"
          :rules="[{ required: true, message: '请选择关联权限' }]"
        >
          <a-select
            v-model:value="addForm.permissionIds"
            show-search
            placeholder="请选择关联权限"
            :options="permissionList"
            :filter-option="filterOption"
            mode="multiple"
          ></a-select>
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
          label="角色名称"
          :rules="[{ required: true, message: '请输入角色名称' }]"
        >
          <a-input
            v-model:value="editForm.roleName" 
            placeholder="请输入角色名称"
          />
        </a-form-item>
        <a-form-item
          label="角色介绍"
          :rules="[{ required: true, message: '请输入角色介绍' }]"
        >
          <a-input
            v-model:value="editForm.description"
            placeholder="请输入角色介绍"
          />
        </a-form-item>
        <!-- 选择关联权限 -->
        <a-form-item
          label="关联权限"
          :rules="[{ required: true, message: '请选择关联权限' }]"
        >
          <a-select
            v-model:value="editForm.permissionIds"
            show-search
            placeholder="请选择关联权限"
            :options="permissionList"
            :filter-option="filterOption"
            mode="multiple"
          ></a-select>
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
import {
  getPermissionPage,
  addPermission,
  deletePermission,
  updatePermission,
  getPermissionDetail,
  getAllPermission,
} from "@/api/permission";
import {
  getRolePage,
  addRole,
  deleteRole,
  updateRole,
  getRoleDetail,
} from "@/api/role";
import { message } from "ant-design-vue";
import create from "@ant-design/icons-vue/lib/components/IconFont";

const loading = ref(false);
const addLoading = ref(false);
const editLoading = ref(false);
const deleteLoading = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const deleteRecord = ref(null);
const editRecord = ref(null);
const dataList = ref([]);
const permissionList = ref([]);

const searchForm = reactive({
  keyword: "",
});

const addForm = reactive({
  roleName: "",
  description: "",
  createTime: "",
  permissionIds: [],
});

const editForm = reactive({
  id: null,
  roleName: "",
  description: "",
  createTime: "",
  permissionIds: [],
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
    title: "角色名称",
    dataIndex: "roleName",
    key: "roleName",
    width: 180,
  },
  {
    title: "角色介绍",
    dataIndex: "description",
    key: "description",
    width: 180,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
    width: 160,
    slots: { customRender: "createTime" },
  },
  {
    title: "拥有权限",
    dataIndex: "permissions",
    key: "permissions",
    width: 160,
    slots: { customRender: "permissions" },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    slots: { customRender: "action" },
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
    const res = await getRolePage(params);
    if (res && res.data) {
      dataList.value = res.data.list || [];
      pagination.value.total = res.data.total || 0;
    }
  } catch (error) {
    console.error("获取权限列表失败:", error);
  } finally {
    loading.value = false;
  }
};


const handleAdd = async () => {
  if (!addForm.roleName || !addForm.description || !addForm.permissions) {
    message.error("请填写必填字段");
    return;
  }

  addLoading.value = true;
  try {
    const data = {
      ...addForm
    };

    const res = await addRole(data);
    if (res.code === 200) {
      message.success("添加成功");
      showAddModal.value = false;
      resetAddForm();
      fetchData();
    } else {
      message.error(res.message || "添加失败");
    }
  } catch (error) {
    console.error("添加权限失败:", error);
  } finally {
    addLoading.value = false;
  }
};

const handleCancel = () => {
  showAddModal.value = false;
  resetAddForm();
};

const resetAddForm = () => {
  addForm.roleName = "";
  addForm.description = "";
  addForm.permissions = [];
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

const handleEditClick = async (record) => {
  editRecord.value = record;
  editLoading.value = true;
  try {
    const res = await getRoleDetail(record.id);
    if (res.code === 200 && res.data) {
      const data = res.data;
      editForm.id = data.id;
      editForm.roleName = data.roleName;
      editForm.description = data.description;
      editForm.createTime = data.createTime || "";
      editForm.permissionIds = data.permissionIds || [];
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
  if (
    !editForm.roleName ||
    !editForm.description ||
    !editForm.permissionIds
  ) {
    message.error("请填写必填字段");
    return;
  }

  editLoading.value = true;
  try {
    const data = {
      ...editForm
    };

    const res = await updateRole(data);
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
  editForm.parentId = 0;
  editForm.permissionName = "";
  editForm.permissionCode = "";
  editForm.menuType = null;
  editForm.path = "";
  editForm.component = "";
  editForm.icon = "";
  editForm.sortOrder = 0;
  editForm.visible = true;
};

// 获取所有的权限
const getPermissionList = async () => {
  try {
    const res = await getAllPermission();
    if (res.code === 200 && res.data) {
      permissionList.value = res.data.map((item) => ({
        label: item.permissionName,
        value: item.id,
      }));
    } else {
      message.error(res.message || "获取权限列表失败");
    }
  } catch (error) {
    console.error("获取权限列表失败:", error);
    message.error("获取权限列表失败");
  }
};
const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

onMounted(() => {
  fetchData();
  getPermissionList();
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
