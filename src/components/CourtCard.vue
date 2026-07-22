<template>
  <div
    class="court-card"
    :class="{ 'court-card--active': active }"
    @click="$emit('click', court)"
  >
    <!-- 封面图 -->
    <div class="court-card__cover">
      <img
        v-if="coverImage"
        :src="coverImage"
        :alt="court.name"
      />
      <div v-else class="court-card__cover-empty">🏀</div>
      <!-- 状态标签叠加在图片上 -->
      <a-tag :color="statusColorMap[court.status]" class="court-card__tag">
        {{ statusLabelMap[court.status] }}
      </a-tag>
    </div>

    <!-- 信息区 -->
    <div class="court-card__info">
      <span class="court-card__name" :title="court.name">{{ court.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  court: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

// 获取封面图：兼容 imageUrls 数组和 images 对象数组两种格式
const coverImage = computed(() => {
  const { imageUrls, images } = props.court

  // 优先使用 imageUrls（简单字符串数组）
  if (imageUrls && imageUrls.length > 0) {
    return imageUrls[0]
  }

  // 其次使用 images（对象数组，找封面图）
  if (images && images.length > 0) {
    const cover = images.find(img => img.isCover === 1)
    return cover?.imageUrl || images[0]?.imageUrl || ''
  }

  return ''
})

const statusLabelMap = { 0: '待审核', 1: '已上架', 2: '已下架', 3: '已驳回' }
const statusColorMap = { 0: 'orange', 1: 'green', 2: 'default', 3: 'red' }
</script>

<style scoped>
.court-card {
  flex-shrink: 0;
  width: 130px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.court-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.court-card--active {
  border-color: #1677ff;
  box-shadow: 0 3px 12px rgba(22, 119, 255, 0.3);
}

.court-card__cover {
  position: relative;
  height: 85px;
  overflow: hidden;
  background: #f0f2f5;
}

.court-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.court-card__cover-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: linear-gradient(135deg, #e6f4ff, #bae0ff);
}

.court-card__tag {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  line-height: 16px;
  backdrop-filter: blur(4px);
  transform: scale(0.85);
  transform-origin: top right;
}

.court-card__info {
  padding: 5px 8px;
}

.court-card__name {
  font-weight: 600;
  font-size: 12px;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
</style>