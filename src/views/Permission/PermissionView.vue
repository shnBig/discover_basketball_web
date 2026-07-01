<template>
  <div class="permission-container">
    <a-card :title="'权限列表'" class="">
      <div class="flex justify-between">
        <a-button type="primary" @click="showAddModal = true" class="mb-[20px]">
          添加
        </a-button>

        <a-form layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="权限名称">
            <a-input
              v-model:value="searchForm.keyword"
              placeholder="请输入权限名称"
              @keyup.enter="handleSearch"
              allowClear
            />
          </a-form-item>
          <a-form-item label="菜单类型" class="w-[300px]">
            <a-select
              v-model:value="searchForm.menuType"
              placeholder="请选择菜单类型"
              allowClear
            >
              <a-select-option value="C">菜单</a-select-option>
              <a-select-option value="F">按钮</a-select-option>
              <a-select-option value="M">目录</a-select-option>
            </a-select>
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
        <template #menuType="{ text }">
          <a-tag :color="getMenuTypeColor(text)">
            {{ getMenuTypeLabel(text) }}
          </a-tag>
        </template>
        <template #visible="{ text }">
          <a-switch :checked="text === 1" disabled />
        </template>
        <template #createTime="{ text }">
          {{ formatDate(text) }}
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="primary" size="small" @click="handleEditClick(record)">编辑</a-button>
            <a-button danger size="small" @click="handleDeleteClick(record)">删除</a-button>
          </a-space>
        </template>
      </BaseTable>
    </a-card>

    <a-modal
      v-model:open="showAddModal"
      title="添加权限"
      :confirm-loading="addLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleAdd"
      @cancel="handleCancel"
    >
      <a-form :model="addForm" layout="vertical" class="add-form">
        <a-form-item
          label="权限名称"
          :rules="[{ required: true, message: '请输入权限名称' }]"
        >
          <a-input
            v-model:value="addForm.permissionName"
            placeholder="请输入权限名称"
          />
        </a-form-item>
        <a-form-item
          label="权限编码"
          :rules="[{ required: true, message: '请输入权限编码' }]"
        >
          <a-input
            v-model:value="addForm.permissionCode"
            placeholder="请输入权限编码，如：manager:list"
          />
        </a-form-item>
        <a-form-item
          label="菜单类型"
          :rules="[{ required: true, message: '请选择菜单类型' }]"
        >
          <a-select
            v-model:value="addForm.menuType"
            placeholder="请选择菜单类型"
            @change="handleMenuTypeChange"
          >
            <a-select-option value="M">目录</a-select-option>
            <a-select-option value="C">菜单</a-select-option>
            <a-select-option value="F">按钮</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="父权限ID">
          <a-input-number
            disabled
            v-model:value="addForm.parentId"
            placeholder="请输入父权限ID"
            :min="0"
          />
        </a-form-item>
        <a-form-item
          v-if="addForm.menuType === 'C'"
          label="访问路径"
          :rules="[{ required: true, message: '菜单类型必须填写访问路径' }]"
        >
          <a-input
            v-model:value="addForm.path"
            placeholder="请输入访问路径，如：/admin/list"
          />
        </a-form-item>
        <a-form-item
          v-if="addForm.menuType === 'C'"
          label="组件名称"
          :rules="[{ required: true, message: '请输入组件名称' }]"
        >
          <a-input
            v-model:value="addForm.component"
            placeholder="请输入组件名称，如：ManagerView"
          />
        </a-form-item>
        <!-- <a-form-item label="图标">
          <a-input 
            v-model:value="addForm.icon" 
            placeholder="请输入图标名称"
          />
        </a-form-item> -->
        <a-form-item label="显示顺序">
          <a-input-number
            disabled
            v-model:value="addForm.sortOrder"
            placeholder="请输入显示顺序"
            :min="0"
            :step="1"
          />
        </a-form-item>
        <a-form-item label="是否显示">
          <a-switch v-model:checked="addForm.visible" disabled />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="showEditModal"
      title="编辑权限"
      :confirm-loading="editLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleEdit"
      @cancel="handleEditCancel"
    >
      <a-form :model="editForm" layout="vertical" class="add-form">
        <a-form-item
          label="权限名称"
          :rules="[{ required: true, message: '请输入权限名称' }]"
        >
          <a-input
            v-model:value="editForm.permissionName"
            placeholder="请输入权限名称"
          />
        </a-form-item>
        <a-form-item
          label="权限编码"
          :rules="[{ required: true, message: '请输入权限编码' }]"
        >
          <a-input
            v-model:value="editForm.permissionCode"
            placeholder="请输入权限编码，如：manager:list"
          />
        </a-form-item>
        <a-form-item
          label="菜单类型"
          :rules="[{ required: true, message: '请选择菜单类型' }]"
        >
          <a-select
            v-model:value="editForm.menuType"
            placeholder="请选择菜单类型"
            @change="handleEditMenuTypeChange"
          >
            <a-select-option value="M">目录</a-select-option>
            <a-select-option value="C">菜单</a-select-option>
            <a-select-option value="F">按钮</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="父权限ID">
          <a-input-number
            disabled
            v-model:value="editForm.parentId"
            placeholder="请输入父权限ID"
            :min="0"
          />
        </a-form-item>
        <a-form-item
          v-if="editForm.menuType === 'C'"
          label="访问路径"
          :rules="[{ required: true, message: '菜单类型必须填写访问路径' }]"
        >
          <a-input
            v-model:value="editForm.path"
            placeholder="请输入访问路径，如：/admin/list"
          />
        </a-form-item>
        <a-form-item
          v-if="editForm.menuType === 'C'"
          label="组件名称"
          :rules="[{ required: true, message: '请输入组件名称' }]"
        >
          <a-input
            v-model:value="editForm.component"
            placeholder="请输入组件名称，如：ManagerView"
          />
        </a-form-item>
        <a-form-item label="显示顺序">
          <a-input-number
            disabled
            v-model:value="editForm.sortOrder"
            placeholder="请输入显示顺序"
            :min="0"
            :step="1"
          />
        </a-form-item>
        <a-form-item label="是否显示">
          <a-switch v-model:checked="editForm.visible" disabled />
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
      <p>确定要删除权限 <strong>{{ deleteRecord?.permissionName }}</strong> 吗？</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { getPermissionPage, addPermission, deletePermission, updatePermission, getPermissionDetail } from "@/api/permission";
import { message } from "ant-design-vue";

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

const searchForm = reactive({
  keyword: "",
  menuType: null,
});

const addForm = reactive({
  parentId: 0,
  permissionName: "",
  permissionCode: "",
  menuType: null,
  path: "",
  component: "",
  icon: "",
  sortOrder: 0,
  visible: true,
});

const editForm = reactive({
  id: null,
  parentId: 0,
  permissionName: "",
  permissionCode: "",
  menuType: null,
  path: "",
  component: "",
  icon: "",
  sortOrder: 0,
  visible: true,
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
    title: "权限名称",
    dataIndex: "permissionName",
    key: "permissionName",
    width: 180,
  },
  {
    title: "权限编码",
    dataIndex: "permissionCode",
    key: "permissionCode",
    width: 180,
  },
  {
    title: "菜单类型",
    dataIndex: "menuType",
    key: "menuType",
    width: 100,
    slots: { customRender: "menuType" },
  },
  {
    title: "路径",
    dataIndex: "path",
    key: "path",
    width: 100,
  },
  {
    title: "状态",
    dataIndex: "visible",
    key: "visible",
    width: 80,
    slots: { customRender: "visible" },
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
    width: 140,
    slots: { customRender: "action" },
  },
];

const getMenuTypeLabel = (type) => {
  const map = {
    C: "菜单",
    F: "按钮",
    M: "目录",
  };
  return map[type] || type;
};

const getMenuTypeColor = (type) => {
  const map = {
    C: "blue",
    F: "green",
    M: "purple",
  };
  return map[type] || "default";
};

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
      menuType: searchForm.menuType || "",
    };
    const res = await getPermissionPage(params);
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

const handleMenuTypeChange = () => {
  addForm.path = "";
  addForm.component = "";
};

const handleAdd = async () => {
  if (!addForm.permissionName || !addForm.permissionCode || !addForm.menuType) {
    message.error("请填写必填字段");
    return;
  }

  addLoading.value = true;
  try {
    const data = {
      parentId: addForm.parentId || 0,
      permissionName: addForm.permissionName,
      permissionCode: addForm.permissionCode,
      menuType: addForm.menuType,
      path: addForm.path || "",
      component: addForm.menuType === "C" ? addForm.component : null,
      icon: addForm.icon || null,
      sortOrder: addForm.sortOrder || 0,
      visible: addForm.visible ? 1 : 0,
    };

    const res = await addPermission(data);
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
  addForm.parentId = 0;
  addForm.permissionName = "";
  addForm.permissionCode = "";
  addForm.menuType = null;
  addForm.path = "";
  addForm.component = "";
  addForm.icon = "";
  addForm.sortOrder = 0;
  addForm.visible = true;
};

const handleDeleteClick = (record) => {
  deleteRecord.value = record;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = async () => {
  if (!deleteRecord.value) return;

  deleteLoading.value = true;
  try {
    const res = await deletePermission(deleteRecord.value.id);
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
    const res = await getPermissionDetail(record.id);
    if (res.code === 200 && res.data) {
      const data = res.data;
      editForm.id = data.id;
      editForm.parentId = data.parentId || 0;
      editForm.permissionName = data.permissionName;
      editForm.permissionCode = data.permissionCode;
      editForm.menuType = data.menuType;
      editForm.path = data.path || "";
      editForm.component = data.component || "";
      editForm.icon = data.icon || "";
      editForm.sortOrder = data.sortOrder || 0;
      editForm.visible = data.visible === 1;
      showEditModal.value = true;
    } else {
      message.error(res.message || "获取权限详情失败");
    }
  } catch (error) {
    console.error("获取权限详情失败:", error);
    message.error("获取权限详情失败");
  } finally {
    editLoading.value = false;
  }
};

const handleEditMenuTypeChange = () => {
  editForm.path = "";
  editForm.component = "";
};

const handleEdit = async () => {
  if (!editForm.permissionName || !editForm.permissionCode || !editForm.menuType) {
    message.error("请填写必填字段");
    return;
  }

  editLoading.value = true;
  try {
    const data = {
      id: editForm.id,
      parentId: editForm.parentId || 0,
      permissionName: editForm.permissionName,
      permissionCode: editForm.permissionCode,
      menuType: editForm.menuType,
      path: editForm.path || "",
      component: editForm.menuType === "C" ? editForm.component : null,
      icon: editForm.icon || null,
      sortOrder: editForm.sortOrder || 0,
      visible: editForm.visible ? 1 : 0,
    };

    const res = await updatePermission(data);
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

onMounted(() => {
  fetchData();
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