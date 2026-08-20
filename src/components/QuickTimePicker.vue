<template>
  <a-range-picker
    :value="modelValue"
    show-time
    format="YYYY-MM-DD HH:mm:ss"
    :placeholder="placeholder"
    style="width: 280px"
    :dropdown-class-name="dropdownCls"
    :render-extra-footer="renderFooter"
    @change="handleChange"
  />
</template>

<script setup>
import { ref, h } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Array,
    default: null,
  },
  placeholder: {
    type: Array,
    default: () => ['开始时间', '结束时间'],
  },
})

const emit = defineEmits(['update:modelValue'])

const dropdownCls = 'quick-time-picker-dropdown'
const activeQuick = ref(null)

const quickOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '三天内', value: '3days' },
  { label: '一周内', value: 'week' },
  { label: '一个月内', value: 'month' },
]

const getQuickRange = (type) => {
  const now = dayjs()
  let start, end
  switch (type) {
    case 'today':
      start = now.startOf('day')
      end = now.endOf('day')
      break
    case 'yesterday':
      start = now.subtract(1, 'day').startOf('day')
      end = now.subtract(1, 'day').endOf('day')
      break
    case '3days':
      start = now.subtract(2, 'day').startOf('day')
      end = now.endOf('day')
      break
    case 'week':
      start = now.subtract(6, 'day').startOf('day')
      end = now.endOf('day')
      break
    case 'month':
      start = now.subtract(29, 'day').startOf('day')
      end = now.endOf('day')
      break
    default:
      return null
  }
  return [start, end]
}

const handleQuickSelect = (type) => {
  activeQuick.value = type
  const range = getQuickRange(type)
  emit('update:modelValue', range)
}

const handleChange = (dates) => {
  activeQuick.value = null
  emit('update:modelValue', dates)
}

const renderFooter = () => {
  return h('div', { class: 'quick-time-footer' }, [
    h('div', { class: 'quick-time-footer-title' }, '快捷选择'),
    ...quickOptions.map((item) =>
      h(
        'span',
        {
          key: item.value,
          class: [
            'quick-time-footer-item',
            { 'quick-time-footer-item--active': activeQuick.value === item.value },
          ],
          onClick: () => handleQuickSelect(item.value),
        },
        item.label
      )
    ),
  ])
}
</script>

<style>
.quick-time-picker-dropdown .ant-picker-panel-container {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
}
.quick-time-picker-dropdown .ant-picker-panels {
  flex: 1;
}
.quick-time-picker-dropdown .ant-picker-footer {
  order: -1;
  width: 80px;
  flex-shrink: 0;
  border-top: 0 !important;
  border-right: 1px solid #f0f0f0;
  padding: 8px 0 !important;
}
.quick-time-footer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 4px;
}
.quick-time-footer-title {
  font-size: 12px;
  color: #999;
  padding: 4px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}
.quick-time-footer-item {
  display: block;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
}
.quick-time-footer-item:hover {
  background: #e6f4ff;
  color: #1677ff;
}
.quick-time-footer-item--active {
  background: #1677ff;
  color: #fff;
}
</style>