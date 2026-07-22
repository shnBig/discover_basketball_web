<template>

    <template v-if="selectedDimensions.includes(2) || selectedDimensions.includes(3)" #cell-lossNoticeCount="{ row }">
            <div
              class="cursor-pointer"
              style="
                color: rgb(22, 119, 255);
                white-space: normal;
                word-wrap: break-word;
                word-break: break-word;
              "
              @click="showLossNoticeFailType(row.mediaId,row.adsenseId,row.mediaName,row.adsenseName)"
            >
              {{ row.lossNoticeCount }}
            </div>
          </template>
  <!-- 竞败类型占比弹窗 -->
    <a-modal
      v-model:open="lossNoticeModalVisible"
      :title="lossNoticeModalTitle"
      width="70%"
      :footer="null"
      @cancel="lossNoticeModalVisible = false"
    >
      <div class="mb-3 text-sm text-gray-500">
        <span v-if="lossNoticeData.mediaName" class="mr-4">媒体：{{ lossNoticeData.mediaName }}</span>
        <span v-if="lossNoticeData.adsenseName">广告位：{{ lossNoticeData.adsenseName }}</span>
      </div>
      <SimpleTable
        :data="lossNoticeData.rows"
        :columns="lossNoticeColumns"
        :loading="lossNoticeLoading"
        rowKey="fail_type"
        :maxHeight="400"
      />
    </a-modal>
</template>

<script setup>

const showLossNoticeFailType = async(mediaId,adsenseId,mediaName,adsenseName) => {
  // 先打开弹窗，展示 Loading 效果
  lossNoticeModalVisible.value = true;
  lossNoticeLoading.value = true;
  lossNoticeModalTitle.value = '竞败类型占比';
  lossNoticeData.value = {
    title: '竞败类型占比',
    mediaName,
    adsenseName,
    rows: [],
  };

  try {
    const params = {
      startTime: filters.value.startTime + ' 00:00:00',
      endTime: filters.value.endTime + ' 23:59:59',
      logTimeFormat: filters.value.logTimeFormat,
      mediaName,
      adsenseName,
    };
    if(selectedDimensions.value.includes(3)){
      params.adsenseIds = `${adsenseId}`;
    } else if (selectedDimensions.value.includes(2)) {
      params.mediaIds = `${mediaId}`;
    }
    const res = await getLossNoticeFailTypeListApi(params);
    if (res.code !== 200) {
      console.log('获取媒体竞败类型占比列表失败', res.message);
      return;
    }
    lossNoticeData.value = {
      title: res.result.title || '竞败类型占比',
      mediaName: res.result.mediaName || mediaName,
      adsenseName: res.result.adsenseName || adsenseName,
      rows: res.result.rows || [],
    };
    lossNoticeModalTitle.value = lossNoticeData.value.title;
  } catch (error) {
    console.log('获取媒体竞败类型占比列表失败', error);
    message.error('获取媒体竞败类型占比列表失败');
  } finally {
    lossNoticeLoading.value = false;
  }
}
</script>

<style scoped>
</style>