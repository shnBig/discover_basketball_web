<template>
  <div class="table-wrapper">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      class="mt-[16px]"
      :scroll="{ y: scrollY }"
      @change="handleChange"
    >
      <template
        v-for="column in columns"
        :key="column.key"
        #[getSlotName(column)]="{ text, record }"
      >
        <slot
          :name="getSlotName(column)"
          :text="text"
          :record="record"
        >
          <template v-if="column.slots?.customRender === 'menuType'">
            <a-tag :color="getMenuTypeColor(text)">
              {{ getMenuTypeLabel(text) }}
            </a-tag>
          </template>
          <template v-else-if="column.slots?.customRender === 'visible'">
            <a-switch :checked="text === 1" disabled />
          </template>
          <template v-else-if="column.slots?.customRender === 'createTime'">
            {{ formatDate(text) }}
          </template>
          <template v-else-if="column.slots?.customRender === 'action'">
            <a-space>
              <a-button type="primary" size="small">编辑</a-button>
              <a-button size="small">删除</a-button>
            </a-space>
          </template>
          <template v-else>
            {{ text }}
          </template>
        </slot>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const scrollY = ref(window.innerHeight - 460)

const getSlotName = (column) => {
  return column.slots?.customRender || column.key
}

const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  dataSource: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条记录`,
      pageSizeOptions: ["10", "20", "50", "100"],
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change']);

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

const handleChange = (paginationInfo) => {
  emit('change', paginationInfo);
};
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}
</style>