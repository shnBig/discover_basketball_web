<template>
  <div class="p-6 space-y-4">
    <a-card title="版本管理">
      <a-form
        :model="form"
        layout="vertical"
        :label-col="{ span: 4 }"
        style="max-width: 640px;"
      >
        <a-form-item label="版本号" required>
          <div class="flex items-center gap-1">
            <a-input-number
              v-model:value="form.major"
              :min="0"
              :max="999"
              style="width: 100px;"
            />
            <span class="text-lg font-bold">.</span>
            <a-input-number
              v-model:value="form.minor"
              :min="0"
              :max="999"
              style="width: 100px;"
            />
            <span class="text-lg font-bold">.</span>
            <a-input-number
              v-model:value="form.patch"
              :min="0"
              :max="999"
              style="width: 100px;"
            />
            <span class="ml-2 text-gray-400 text-sm">线上版本：{{ originalVersion }}</span>
          </div>
        </a-form-item>

        <a-form-item label="更新说明" required>
          <a-textarea
            v-model:value="displayNotes"
            placeholder="请自由输入更新说明，直接回车换行、Tab 缩进即可"
            :rows="10"
            :maxlength="2000"
            show-count
          />
          <div class="mt-2 text-xs text-gray-400">
            提示：直接回车换行、Tab 缩进，系统会自动转换格式
          </div>
        </a-form-item>

        <a-form-item label="预览效果">
          <div class="p-4 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
            {{ displayNotes || '（暂无内容）' }}
          </div>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
              保存并发布
            </a-button>
            <a-button :loading="fetchLoading" @click="handleRefresh">
              重新加载
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getAppVersion, updateAppVersion } from '@/api/version'

const form = reactive({
  major: 1,
  minor: 0,
  patch: 0,
})

const displayNotes = ref('')
const originalVersion = ref('')
const fetchLoading = ref(false)
const submitLoading = ref(false)
const loadingData = ref(false)

const fullVersion = computed(() => {
  return `${form.major}.${form.minor}.${form.patch}`
})

watch(() => form.major, (newVal, oldVal) => {
  if (loadingData.value) return
  if (newVal !== oldVal) {
    form.minor = 0
    form.patch = 0
  }
})

watch(() => form.minor, (newVal, oldVal) => {
  if (loadingData.value) return
  if (newVal !== oldVal) {
    form.patch = 0
  }
})

const toApiFormat = (text) => {
  return text.replace(/\n/g, '\\n').replace(/\t/g, '\\t')
}

const fromApiFormat = (text) => {
  if (!text) return ''
  return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

const parseVersion = (versionStr) => {
  const parts = (versionStr || '1.0.0').split('.')
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
  }
}

const fetchVersion = async () => {
  fetchLoading.value = true
  try {
    const res = await getAppVersion()
    if (res?.data) {
      originalVersion.value = res.data.version || '1.0.0'
      const v = parseVersion(res.data.version)
      loadingData.value = true
      form.major = v.major
      form.minor = v.minor
      form.patch = v.patch
      loadingData.value = false
      displayNotes.value = fromApiFormat(res.data.updateNotes || '')
    }
  } catch (e) {
    console.error(e)
  } finally {
    fetchLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!displayNotes.value.trim()) {
    message.warning('更新说明不能为空')
    return
  }
  submitLoading.value = true
  try {
    await updateAppVersion({
      version: fullVersion.value,
      updateNotes: toApiFormat(displayNotes.value),
    })
    message.success('版本信息更新成功')
  } catch (e) {
    console.error(e)
  } finally {
    submitLoading.value = false
  }
}

const handleRefresh = () => {
  fetchVersion()
}

onMounted(() => {
  fetchVersion()
})
</script>