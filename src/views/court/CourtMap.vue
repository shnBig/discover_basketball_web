<template>
  <div class="court-view">
    <!-- 全屏地图 -->
    <div id="court-map" class="court-view__map" :class="{ 'court-view__map--disabled': drawerVisible }"></div>

    <!-- 左侧开放城市列表 -->
    <div class="court-view__city-list">
      <div class="city-list__header">
        <span class="city-list__title">开放城市</span>
        <div
          class="city-list__refresh"
          :class="{ 'city-list__refresh--loading': cityRefreshing }"
          @click="refreshCities"
        >
          <ReloadOutlined :spin="cityRefreshing" />
        </div>
      </div>
      <div
        v-for="city in openCities"
        :key="city.id"
        class="city-tag"
        :class="{ 'city-tag--active': activeCityId === city.id }"
        @click="handleCityClick(city)"
      >
        {{ city.cityName }}
      </div>
    </div>

    <!-- 数据库搜索模式 -->
    <div v-if="!amapMode" class="court-view__search">
      <div
        class="search-panel"
        :class="{ 'search-panel--collapsed': searchCollapsed }"
      >
        <div v-show="!searchCollapsed" class="search-panel__body">
          <div class="search-panel__content">
            <a-form layout="inline" :model="searchForm" class="search-form">
              <a-form-item label="名称">
                <a-input
                  v-model:value="searchForm.name"
                  placeholder="球场名称"
                  allowClear
                  class="search-input"
                  @keyup.enter="handleSearch"
                />
              </a-form-item>
              <a-form-item label="状态">
                <a-select
                  v-model:value="searchForm.status"
                  placeholder="全部"
                  allowClear
                  class="search-input"
                >
                  <a-select-option :value="0">待审核</a-select-option>
                  <a-select-option :value="1">已上架</a-select-option>
                  <a-select-option :value="2">已下架</a-select-option>
                  <a-select-option :value="3">已驳回</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="材质">
                <a-select
                  v-model:value="searchForm.material"
                  placeholder="全部"
                  allowClear
                  class="search-input"
                >
                  <a-select-option :value="0">未知</a-select-option>
                  <a-select-option :value="1">水泥</a-select-option>
                  <a-select-option :value="2">沥青</a-select-option>
                  <a-select-option :value="3">硅PU</a-select-option>
                  <a-select-option :value="4">木地板</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="收费">
                <a-select
                  v-model:value="searchForm.isFree"
                  placeholder="全部"
                  allowClear
                  class="search-input search-input--sm"
                >
                  <a-select-option :value="1">免费</a-select-option>
                  <a-select-option :value="0">收费</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="有灯">
                <a-select
                  v-model:value="searchForm.hasLight"
                  placeholder="全部"
                  allowClear
                  class="search-input search-input--sm"
                >
                  <a-select-option :value="1">有灯</a-select-option>
                  <a-select-option :value="0">无灯</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="来源">
                <a-select
                  v-model:value="searchForm.source"
                  placeholder="全部"
                  allowClear
                  class="search-input search-input--sm"
                >
                  <a-select-option :value="1">用户提交</a-select-option>
                  <a-select-option :value="2">官方采集</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="室内外">
                <a-select
                  v-model:value="searchForm.indoorOutdoor"
                  placeholder="全部"
                  allowClear
                  class="search-input search-input--sm"
                >
                  <a-select-option :value="1">室内</a-select-option>
                  <a-select-option :value="2">室外</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
            <div class="search-panel__actions">
              <a-button type="primary" size="small" @click="handleSearch"
                >搜索</a-button
              >
              <a-button size="small" @click="handleReset">重置</a-button>
            </div>
          </div>
        </div>
        <div class="search-panel__footer">
          <div v-if="searchCollapsed" class="search-panel__collapsed-bar">
            <span class="search-panel__title">球场筛选</span>
          </div>
          <div
            class="search-panel__toggle"
            @click="searchCollapsed = !searchCollapsed"
          >
            <DownOutlined v-if="searchCollapsed" />
            <UpOutlined v-else />
            <span class="toggle-text">{{
              searchCollapsed ? "展开搜索" : "收起"
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 高德地图搜索模式 -->
    <div v-else class="court-view__search">
      <div class="search-panel">
        <div class="search-panel__body">
          <div class="search-panel__content">
            <a-form layout="inline" :model="amapForm" class="search-form">
              <a-form-item label="关键词">
                <a-input
                  v-model:value="amapForm.keywords"
                  placeholder="如：篮球场"
                  allowClear
                  class="search-input"
                  @keyup.enter="handleAmapSearch"
                />
              </a-form-item>
              <a-form-item label="类型">
                <a-input
                  v-model:value="amapForm.types"
                  placeholder="如：体育场馆"
                  allowClear
                  class="search-input"
                  @keyup.enter="handleAmapSearch"
                />
              </a-form-item>
              <a-form-item label="区域">
                <a-input
                  v-model:value="amapForm.region"
                  placeholder="如：北京市"
                  allowClear
                  class="search-input"
                  @keyup.enter="handleAmapSearch"
                />
              </a-form-item>
            </a-form>
            <div class="search-panel__actions">
              <a-button
                type="primary"
                size="small"
                :loading="amapSearching"
                @click="handleAmapSearch"
                >搜索</a-button
              >
              <a-button size="small" @click="clearAmapSearch">清除</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧浮动操作按钮组 -->
    <div class="court-view__float-actions">
      <a-tooltip
        placement="left"
        :title="amapMode ? '返回数据管理' : '高德地图搜索'"
      >
        <div
          class="float-action-btn"
          :class="{ 'float-action-btn--active': amapMode }"
          @click="toggleMode"
        >
          <EnvironmentOutlined v-if="!amapMode" />
          <DatabaseOutlined v-else />
        </div>
      </a-tooltip>
      <a-tooltip placement="left" title="搜索">
        <div
          class="float-action-btn"
          @click="
            amapMode
              ? handleAmapSearch()
              : ((searchCollapsed = false), handleSearch())
          "
        >
          <SearchOutlined />
        </div>
      </a-tooltip>
      <template v-if="!amapMode">
        <a-tooltip placement="left" title="添加球场">
          <div
            class="float-action-btn float-action-btn--primary"
            @click="enterAddMode"
          >
            <PlusOutlined />
          </div>
        </a-tooltip>
      </template>
    </div>

    <!-- 添加模式提示 -->
    <div v-if="addMode" class="court-view__tip">
      <a-alert
        message="添加模式：点击地图选点"
        type="info"
        show-icon
        closable
        @close="addMode = false"
      />
    </div>

    <!-- 底部球场卡片条（高德模式下隐藏） -->
    <div v-show="!amapMode" class="court-view__cards">
      <div class="card-strip__count">共 {{ courtList.length }} 个球场</div>
      <div ref="cardStripRef" class="card-strip">
        <CourtCard
          v-for="court in courtList"
          :key="court.id"
          :court="court"
          :active="activeCourtId === court.id"
          @click="handleCardClick"
        />
        <div
          v-if="!loading && courtList.length === 0"
          class="card-strip__empty"
        >
          暂无球场数据
        </div>
      </div>
    </div>

    <!-- 添加/编辑球场抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? '编辑球场' : '添加球场'"
      :width="drawerWidth"
      :destroy-on-close="true"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-divider orientation="left">基本信息</a-divider>
        <a-form-item label="球场名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入球场名称" />
        </a-form-item>
        <a-form-item label="详细地址" name="address">
          <a-input v-model:value="form.address" placeholder="请输入详细地址" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="城市编码" name="cityCode">
              <a-input v-model:value="form.cityCode" placeholder="自动识别或手动输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="区/县">
              <a-input v-model:value="form.district" placeholder="请输入区/县" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="球场状态" name="status">
          <a-select v-model:value="form.status" placeholder="请选择状态">
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">已上架</a-select-option>
            <a-select-option :value="2">已下架</a-select-option>
            <a-select-option :value="3">审核驳回</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="form.status === 3" label="驳回原因" name="rejectReason">
          <a-textarea v-model:value="form.rejectReason" placeholder="请输入驳回原因" :rows="3" />
        </a-form-item>
        <a-form-item v-if="form.status === 2" label="下架原因" name="offlineReason">
          <a-textarea v-model:value="form.offlineReason" placeholder="请输入下架原因" :rows="3" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="经度" name="longitude">
              <a-input-number
                v-model:value="form.longitude"
                :precision="6"
                style="width: 100%"
                placeholder="点击地图自动填入"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="纬度" name="latitude">
              <a-input-number
                v-model:value="form.latitude"
                :precision="6"
                style="width: 100%"
                placeholder="点击地图自动填入"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">场地信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="地面材质">
              <a-select v-model:value="form.material" placeholder="请选择">
                <a-select-option :value="0">未知</a-select-option>
                <a-select-option :value="1">水泥</a-select-option>
                <a-select-option :value="2">沥青</a-select-option>
                <a-select-option :value="3">硅PU</a-select-option>
                <a-select-option :value="4">木地板</a-select-option>
                <a-select-option :value="5">悬浮底板</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="室内外">
              <a-select v-model:value="form.indoorOutdoor" placeholder="请选择">
                <a-select-option :value="0">未知</a-select-option>
                <a-select-option :value="1">室内</a-select-option>
                <a-select-option :value="2">室外</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="是否有灯">
              <a-switch
                v-model:checked="form.hasLight"
                checked-children="有灯"
                un-checked-children="无灯"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="是否收费">
              <a-switch
                v-model:checked="form.isFree"
                checked-children="免费"
                un-checked-children="收费"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="收费描述">
              <a-input
                v-model:value="form.feeDesc"
                placeholder="如：10元/人"
                :disabled="form.isFree"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="全场数">
              <a-input-number
                v-model:value="form.fullCourtQty"
                :min="0"
                :max="20"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="半场数">
              <a-input-number
                v-model:value="form.halfCourtQty"
                :min="0"
                :max="9"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="开放时间">
              <a-input
                v-model:value="form.openTime"
                placeholder="06:00-22:00"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">照片</a-divider>
        <a-form-item>
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :max-count="9"
            :custom-request="handleUpload"
            :multiple="true"
            accept="image/*"
          >
            <div v-if="fileList.length < 9">
              <plus-outlined />
              <div class="mt-1 text-xs">上传照片</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
            >保存</a-button
          >
        </a-space>
      </template>
    </a-drawer>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:open="auditVisible"
      :title="`球场审核 - ${auditStatusText[auditForm.status] || '审核'}`"
      :confirm-loading="auditLoading"
      @ok="handleAuditSubmit"
      @cancel="auditVisible = false"
      :ok-text="auditStatusText[auditForm.status] || '确认'"
      :ok-button-props="{ danger: auditForm.status === 3 || auditForm.status === 2 }"
      width="480px"
    >
      <div class="mt-4">
        <a-alert
          v-if="auditForm.status === 1"
          message="确认通过审核？球场将上架展示。"
          type="success"
          show-icon
          class="mb-4"
        />
        <a-alert
          v-if="auditForm.status === 2"
          message="确认下架该球场？下架后用户将不可见。"
          type="warning"
          show-icon
          class="mb-4"
        />
        <a-alert
          v-if="auditForm.status === 3"
          message="确认驳回该球场？请填写驳回原因。"
          type="error"
          show-icon
          class="mb-4"
        />

        <a-form layout="vertical">
          <a-form-item
            v-if="auditForm.status === 3"
            label="驳回原因"
            required
          >
            <a-textarea
              v-model:value="auditForm.rejectReason"
              placeholder="请输入驳回原因，将通知提交者"
              :rows="3"
            />
          </a-form-item>
          <a-form-item
            v-if="auditForm.status === 2"
            label="下架原因"
            required
          >
            <a-textarea
              v-model:value="auditForm.offlineReason"
              placeholder="请输入下架原因"
              :rows="3"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 球场详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="球场详情"
      :footer="null"
      width="680px"
    >
      <a-spin :spinning="detailLoading">
        <template v-if="detailData">
          <!-- 基本信息 -->
          <a-divider orientation="left">基本信息</a-divider>
          <a-descriptions :column="2" size="small" bordered>
            <a-descriptions-item label="球场ID">{{ detailData.id }}</a-descriptions-item>
            <a-descriptions-item label="球场名称">{{ detailData.name }}</a-descriptions-item>
            <a-descriptions-item label="地址" :span="2">{{ detailData.address }}</a-descriptions-item>
            <a-descriptions-item label="城市编码">{{ detailData.cityCode || '-' }}</a-descriptions-item>
            <a-descriptions-item label="区/县">{{ detailData.district || '-' }}</a-descriptions-item>
            <a-descriptions-item label="经度">{{ detailData.longitude }}</a-descriptions-item>
            <a-descriptions-item label="纬度">{{ detailData.latitude }}</a-descriptions-item>
          </a-descriptions>

          <!-- 场地信息 -->
          <a-divider orientation="left">场地信息</a-divider>
          <a-descriptions :column="2" size="small" bordered>
            <a-descriptions-item label="地面材质">
              <a-tag>{{ materialLabelMap[detailData.material] || '未知' }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="灯光">
              <a-tag :color="detailData.hasLight === 1 ? 'green' : 'default'">
                {{ detailData.hasLight === 1 ? '有灯' : '无灯' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="收费">
              <a-tag :color="detailData.isFree === 1 ? 'blue' : 'orange'">
                {{ detailData.isFree === 1 ? '免费' : '收费' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="收费描述">{{ detailData.feeDesc || '-' }}</a-descriptions-item>
            <a-descriptions-item label="全场数量">{{ detailData.fullCourtQty || 0 }}</a-descriptions-item>
            <a-descriptions-item label="半场数量">{{ detailData.halfCourtQty || 0 }}</a-descriptions-item>
            <a-descriptions-item label="开放时间" :span="2">{{ detailData.openTime || '-' }}</a-descriptions-item>
          </a-descriptions>

          <!-- 状态与来源 -->
          <a-divider orientation="left">状态与来源</a-divider>
          <a-descriptions :column="2" size="small" bordered>
            <a-descriptions-item label="状态">
              <a-tag :color="statusColorMap[detailData.status]">{{ statusLabelMap[detailData.status] }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="来源">
              <a-tag :color="detailData.source === 2 ? 'purple' : 'cyan'">
                {{ detailData.source === 2 ? '官方采集' : '用户提交' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="驳回原因" :span="2" v-if="detailData.rejectReason">
              <span style="color: #ff4d4f">{{ detailData.rejectReason }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="浏览量">{{ detailData.viewCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="收藏数">{{ detailData.favoriteCount || 0 }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ detailData.createTime }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ detailData.updateTime }}</a-descriptions-item>
          </a-descriptions>

          <!-- 球场图片 -->
          <template v-if="detailData.images?.length">
            <a-divider orientation="left">球场图片</a-divider>
            <a-image-preview-group>
              <a-space :size="12" wrap>
                <div
                  v-for="img in detailData.images"
                  :key="img.id"
                  style="position: relative;"
                >
                  <a-image
                    :src="img.imageUrl"
                    :width="120"
                    :height="90"
                    style="object-fit: cover; border-radius: 6px;"
                  />
                  <a-tag
                    v-if="img.isCover === 1"
                    color="blue"
                    style="position: absolute; top: 4px; left: 4px; font-size: 10px;"
                  >
                    封面
                  </a-tag>
                </div>
              </a-space>
            </a-image-preview-group>
          </template>
        </template>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
defineOptions({ name: 'CourtMap' });

import { ref, reactive, onMounted, onActivated, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  PlusOutlined,
  DownOutlined,
  UpOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  DatabaseOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import { message, notification } from "ant-design-vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useUserStore } from "@/store/user";
import { getOpenCityList } from "@/api/city";
import {
  getCourtList,
  getCourtDetail,
  addCourt,
  updateCourt,
  updateCourtStatus,
  deleteCourt,
  auditCourt,
} from "@/api/court";
import { uploadFileImage } from "@/api/upload";
import CourtCard from "@/components/CourtCard.vue";

const statusLabelMap = { 0: "待审核", 1: "已上架", 2: "已下架", 3: "已驳回" };
const statusColorMap = { 0: "orange", 1: "green", 2: "default", 3: "red" };
const materialLabelMap = {
  0: "未知",
  1: "水泥",
  2: "沥青",
  3: "硅PU",
  4: "木地板",
  5: "悬浮底板",
};

// ---- 地图 ----
let AMap = null;
const map = ref(null);
const markers = ref([]);
const addMode = ref(false);
const searchCollapsed = ref(false);
const activeCourtId = ref(null);
let infoWindow = null;

// ---- 开放城市列表 ----
const userStore = useUserStore();
const openCities = computed(() => userStore.openCourts || []);
const activeCityId = ref(userStore.openCourts?.[0]?.id || null);
const cityRefreshing = ref(false);

const handleCityClick = (city) => {
  infoWindow?.close();
  activeCityId.value = city.id;
  if (map.value) {
    map.value.setZoomAndCenter(
      12,
      [Number(city.longitude), Number(city.latitude)],
      false,
      600,
    );
  }
  fetchList();
};

const refreshCities = async () => {
  infoWindow?.close();
  cityRefreshing.value = true;
  try {
    const res = await getOpenCityList();
    userStore.openCourts = res.data || [];
    if (userStore.openCourts.length) {
      activeCityId.value = userStore.openCourts[0].id;
    }
    message.success("城市列表已刷新");
    fetchList();
  } catch {
    message.error("刷新失败");
  } finally {
    cityRefreshing.value = false;
  }
};

// ---- 高德地图搜索模式 ----
const amapMode = ref(false);
const amapSearching = ref(false);
const amapForm = reactive({ keywords: "", types: "", region: "" });
let amapPlaceSearch = null;
let amapMarkers = [];

const toggleMode = () => {
  infoWindow?.close();
  amapMode.value = !amapMode.value;
  if (!amapMode.value) {
    clearAmapSearch();
  }
};

const handleAmapSearch = () => {
  const { keywords, types, region } = amapForm;
  if (!keywords && !types && !region) {
    message.warning("请至少填写一个搜索条件");
    return;
  }
  if (!map.value) return;

  amapSearching.value = true;
  clearAmapMarkers();

  if (!amapPlaceSearch) {
    amapPlaceSearch = new AMap.PlaceSearch({
      pageSize: 30,
      pageIndex: 1,
      extensions: "all",
    });
  }

  // 设置城市限定
  if (region) {
    amapPlaceSearch.setCity(region);
  } else {
    amapPlaceSearch.setCity("");
  }

  // 拼接搜索词
  const query = [keywords, types].filter(Boolean).join(" ");
  amapPlaceSearch.search(query, (status, result) => {
    amapSearching.value = false;
    if (status === "complete" && result?.poiList?.pois?.length) {
      const pois = result.poiList.pois;
      pois.forEach((poi, i) => addAmapMarker(poi, i + 1));
      if (amapMarkers.length > 0) {
        map.value.setFitView(amapMarkers);
      }
      message.success(`找到 ${pois.length} 个结果`);
    } else {
      message.info("未找到相关结果");
    }
  });
};

const addAmapMarker = (poi, index) => {
  if (!poi.location) return;
  const marker = new AMap.Marker({
    position: [poi.location.lng, poi.location.lat],
    map: map.value,
    title: poi.name,
    extData: poi,
    offset: new AMap.Pixel(-10, -10),
  });

  marker.setContent(
    `<div style="background:#1677ff;width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:bold;">${index}</div>`,
  );

  marker.on("click", () => {
    const p = marker.getExtData();
    const html = `
      <div style="padding:14px;min-width:220px;font-size:13px;line-height:1.8;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.15);position:relative;">
        <div onclick="window.__closeInfoWindow()" style="position:absolute;top:8px;right:10px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#86909c;font-size:14px;border-radius:50%;transition:all .2s;" onmouseover="this.style.color='#1677ff';this.style.background='rgba(22,119,255,0.08)'" onmouseout="this.style.color='#86909c';this.style.background='none'">✕</div>
        <div style="font-weight:600;font-size:15px;margin-bottom:6px;color:#1d2129;">📍 ${p.name}</div>
        <div style="color:#4e5969;">🏠 ${p.address || p.cityname || "-"}</div>
        ${p.tel ? `<div style="color:#4e5969;">📞 ${p.tel}</div>` : ""}
        ${p.type ? `<div style="color:#4e5969;">🏷️ ${p.type}</div>` : ""}
        <div style="color:#86909c;font-size:12px;margin-top:4px;">📍 ${p.location?.lng?.toFixed(6)}, ${p.location?.lat?.toFixed(6)}</div>
      </div>`;
    infoWindow.setContent(html);
    infoWindow.open(map.value, marker.getPosition());
  });

  amapMarkers.push(marker);
};

const clearAmapMarkers = () => {
  amapMarkers.forEach((m) => map.value?.remove(m));
  amapMarkers = [];
};

const clearAmapSearch = () => {
  clearAmapMarkers();
  amapForm.keywords = "";
  amapForm.types = "";
  amapForm.region = "";
  infoWindow?.close();
};

// ---- 响应式 ----
const windowWidth = ref(window.innerWidth);
const drawerWidth = computed(() => (windowWidth.value < 768 ? "100%" : 520));
const onResize = () => {
  windowWidth.value = window.innerWidth;
};

window._AMapSecurityConfig = {
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
};

const initMap = async () => {
  AMap = await AMapLoader.load({
    key: import.meta.env.VITE_AMAP_KEY,
    version: "2.0",
    plugins: ["AMap.Geocoder", "AMap.ToolBar", "AMap.PlaceSearch", "AMap.Geolocation"],
  });

  // 默认中心点：取 store 中第一个开放城市的经纬度，否则回退到北京
  const firstCity = userStore.openCourts?.[0];
  const defaultCenter = firstCity
    ? [Number(firstCity.longitude), Number(firstCity.latitude)]
    : [116.397428, 39.90923];
  if (firstCity) activeCityId.value = firstCity.id;

  map.value = new AMap.Map("court-map", {
    zoom: 12,
    center: defaultCenter,
    resizeEnable: true,
  });

  map.value.addControl(new AMap.ToolBar());

  // 点击地图 → 添加模式下选点
  const geocoder = new AMap.Geocoder({ extensions: "all" });
  map.value.on("click", (e) => {
    if (!addMode.value) return;
    const lng = parseFloat(e.lnglat.getLng().toFixed(6));
    const lat = parseFloat(e.lnglat.getLat().toFixed(6));
    form.longitude = lng;
    form.latitude = lat;
    addMode.value = false;
    drawerVisible.value = true;
    isEdit.value = false;

    // 逆地理编码：获取地址和城市编码
    geocoder.getAddress(new AMap.LngLat(lng, lat), (status, result) => {
      console.log("[Geocoder]", status, JSON.stringify(result));
      if (status === "complete") {
        const regeocode = result.regeocode || result;
        const formatted = regeocode.formattedAddress || "";
        const ac = regeocode.addressComponent || {};
        if (formatted) form.address = formatted;
        form.cityCode = ac.adcode ? ac.adcode.slice(0, 4) + "00" : "";
        form.district = ac.district || "";
      } else {
        console.warn("逆地理编码失败:", status, result);
        message.warning("地址识别失败，请手动填写");
      }
    });
  });

  infoWindow = new AMap.InfoWindow({
    isCustom: true,
    offset: new AMap.Pixel(0, -30),
  });
};

const addMarker = (court) => {
  if (!court.longitude || !court.latitude) return;
  const colorMap = { 0: "#fa8c16", 1: "#52c41a", 2: "#999", 3: "#f5222d" };
  const marker = new AMap.Marker({
    position: [court.longitude, court.latitude],
    map: map.value,
    title: court.name,
    extData: court,
  });

  marker.setContent(
    `<div style="background:${colorMap[court.status] || "#999"};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);cursor:pointer;"></div>`,
  );

  marker.on("click", () => {
    const c = marker.getExtData();
    activeCourtId.value = c.id;
    // 获取封面图
    const coverImage = (c.imageUrls && c.imageUrls.length > 0)
      ? c.imageUrls[0]
      : ((c.images && c.images.length > 0)
        ? (c.images.find(img => img.isCover === 1)?.imageUrl || c.images[0]?.imageUrl)
        : '');

    // 根据状态显示不同的审核按钮
    let auditBtn = '';
    if (c.status === 0) {
      auditBtn = `<button onclick="window.__courtAudit(${c.id}, 1)" style="padding:4px 10px;background:#52c41a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">通过</button>
        <button onclick="window.__courtAudit(${c.id}, 3)" style="padding:4px 10px;background:#fa8c16;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">驳回</button>`;
    } else if (c.status === 1) {
      auditBtn = `<button onclick="window.__courtAudit(${c.id}, 2)" style="padding:4px 10px;background:#fa541c;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">下架</button>`;
    } else if (c.status === 2) {
      auditBtn = `<button onclick="window.__courtAudit(${c.id}, 1)" style="padding:4px 10px;background:#52c41a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">上架</button>`;
    }

    // 图片 HTML
    const imageHtml = coverImage
      ? `<img src="${coverImage}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;" onerror="this.style.display='none'" />`
      : `<div style="width:100%;height:80px;background:linear-gradient(135deg,#e6f4ff,#bae0ff);border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:28px;">🏀</div>`;

    const html = `
      <div style="padding:14px;min-width:240px;max-width:280px;font-size:13px;line-height:1.8;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.15);position:relative;">
        <div onclick="window.__closeInfoWindow()" style="position:absolute;top:8px;right:10px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#86909c;font-size:14px;border-radius:50%;z-index:1;background:rgba(255,255,255,0.8);transition:all .2s;" onmouseover="this.style.color='#1677ff';this.style.background='rgba(22,119,255,0.08)'" onmouseout="this.style.color='#86909c';this.style.background='rgba(255,255,255,0.8)'">✕</div>
        ${imageHtml}
        <div style="font-weight:600;font-size:15px;margin-bottom:6px;color:#1d2129;">${c.name}</div>
        <div style="color:#4e5969;font-size:12px;">📍 ${c.address || "-"}</div>
        <div style="display:flex;gap:6px;margin:6px 0;flex-wrap:wrap;">
          <span style="color:${colorMap[c.status]};font-size:12px;">● ${statusLabelMap[c.status]}</span>
          <span style="color:#4e5969;font-size:12px;">${materialLabelMap[c.material] || "-"}</span>
          <span style="color:#4e5969;font-size:12px;">${c.hasLight ? "💡有灯" : "🌙无灯"}</span>
          <span style="color:#4e5969;font-size:12px;">${c.isFree ? "🆓免费" : "💰收费"}</span>
        </div>
        <div style="color:#86909c;font-size:11px;margin-bottom:8px;">📅 ${c.createTime || "-"}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${auditBtn}
          <button onclick="window.__courtDetail(${c.id})" style="padding:4px 10px;background:#722ed1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">详情</button>
          <button onclick="window.__courtEdit(${c.id})" style="padding:4px 10px;background:#1677ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">编辑</button>
          <button onclick="window.__courtDelete(${c.id})" style="padding:4px 10px;background:#ff4d4f;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">删除</button>
        </div>
      </div>`;
    infoWindow.setContent(html);
    infoWindow.open(map.value, marker.getPosition());

    scrollToCard(c.id);
  });

  markers.value.push(marker);
};

// 地图上的编辑/删除/审核/详情按钮回调（在 onMounted 中注册，避免重新挂载后丢失）

// ---- 卡片交互 ----
const cardStripRef = ref(null);

const scrollToCard = (courtId) => {
  const el = cardStripRef.value?.querySelector(`[data-court-id="${courtId}"]`);
  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
};

const handleCardClick = (court) => {
  activeCourtId.value = court.id;
  focusOnMap(court);
};

const focusOnMap = (record) => {
  if (!map.value || !record.longitude) return;
  const position = [record.longitude, record.latitude];
  const marker = markers.value.find((m) => m.getExtData().id === record.id);

  // 瞬间定位（不带动画），确保坐标精确
  map.value.setZoomAndCenter(16, position, true);

  // 直接触发 marker 的 click 事件打开 InfoWindow
  if (marker) {
    marker.emit("click");
  }
};

// ---- 搜索 ----
const route = useRoute();
const searchForm = reactive({
  name: "",
  status: undefined,
  material: undefined,
  isFree: undefined,
  hasLight: undefined,
  source: undefined,
  indoorOutdoor: undefined,
});
const loading = ref(false);
const courtList = ref([]);

const buildParams = () => {
  const city = openCities.value.find((c) => c.id === activeCityId.value);
  const params = {};
  if (city) params.cityCode = city.cityCode;
  if (searchForm.name) params.name = searchForm.name;
  if (searchForm.status !== undefined) params.status = searchForm.status;
  if (searchForm.material !== undefined) params.material = searchForm.material;
  if (searchForm.isFree !== undefined) params.isFree = searchForm.isFree;
  if (searchForm.hasLight !== undefined) params.hasLight = searchForm.hasLight;
  if (searchForm.source !== undefined) params.source = searchForm.source;
  if (searchForm.indoorOutdoor !== undefined) params.indoorOutdoor = searchForm.indoorOutdoor;
  return params;
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getCourtList(buildParams());
    courtList.value = res?.data || [];
    refreshMapMarkers(courtList.value);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const refreshMapMarkers = (courts) => {
  if (!map.value) return;
  markers.value.forEach((m) => map.value.remove(m));
  markers.value = [];
  courts.forEach((court) => addMarker(court));
};

const handleSearch = () => {
  fetchList();
};
const handleReset = () => {
  Object.assign(searchForm, {
    name: "",
    status: undefined,
    material: undefined,
    isFree: undefined,
    hasLight: undefined,
    source: undefined,
    indoorOutdoor: undefined,
  });
  handleSearch();
};

// ---- 添加/编辑 ----
const drawerVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const fileList = ref([]);

const defaultForm = () => ({
  id: undefined,
  name: "",
  address: "",
  latitude: undefined,
  longitude: undefined,
  cityCode: "",
  district: "",
  status: 0,
  rejectReason: "",
  offlineReason: "",
  indoorOutdoor: 0,
  material: 0,
  hasLight: false,
  isFree: true,
  feeDesc: "",
  fullCourtQty: 0,
  halfCourtQty: 0,
  openTime: "",
  imageUrls: [],
});
const form = reactive(defaultForm());

const rules = {
  name: [{ required: true, message: "请输入球场名称" }],
  address: [{ required: true, message: "请输入详细地址" }],
  cityCode: [{ required: true, message: "请输入城市编码" }],
  longitude: [{ required: true, message: "请在地图上选点或手动输入经度" }],
  latitude: [{ required: true, message: "请在地图上选点或手动输入纬度" }],
};

const enterAddMode = () => {
  infoWindow?.close();
  Object.assign(form, defaultForm());
  fileList.value = [];
  isEdit.value = false;
  addMode.value = true;
};

const handleEdit = async (record) => {
  isEdit.value = true;
  try {
    const res = await getCourtDetail(record.id);
    if (res?.data) {
      Object.assign(form, res.data);
      form.hasLight = !!res.data.hasLight;
      form.isFree = !!res.data.isFree;
      // 兼容两种格式：images 对象数组 或 imageUrls 字符串数组
      const imageUrls = res.data.imageUrls?.length
        ? res.data.imageUrls
        : (res.data.images || []).map((img) => img.imageUrl).filter(Boolean);
      form.imageUrls = imageUrls;
      fileList.value = imageUrls.map((url, i) => ({
        uid: `-${i}`,
        name: `photo-${i}`,
        status: "done",
        url,
      }));
      drawerVisible.value = true;
    }
  } catch (e) {
    message.error("获取详情失败");
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;
    form.imageUrls = fileList.value.filter((f) => f.url).map((f) => f.url);
    const data = { ...form };
    data.hasLight = data.hasLight ? 1 : 0;
    data.isFree = data.isFree ? 1 : 0;
    // 移除前端管理字段，不提交给后端
    delete data.id;

    if (isEdit.value) {
      await updateCourt(form.id, data);
      message.success("更新成功");
    } else {
      await addCourt(data);
      message.success("添加成功");
    }
    drawerVisible.value = false;
    addMode.value = false;
    fetchList();
  } catch (e) {
    message.error("操作失败");
  } finally {
    submitLoading.value = false;
  }
};

// ---- 删除 ----
const handleDelete = async (id) => {
  try {
    await deleteCourt(id);
    message.success("删除成功");
    //关闭弹窗
    infoWindow?.close();
    fetchList();
  } catch (e) {
    message.error("删除失败");
  }
};

// ---- 审核 ----
const auditVisible = ref(false);
const auditLoading = ref(false);
const auditForm = reactive({
  id: undefined,
  status: undefined,
  rejectReason: "",
  offlineReason: "",
});

// statusText: 1=通过/上架, 2=下架, 3=驳回
const auditStatusText = { 1: "上架", 2: "下架", 3: "驳回" };

const handleAudit = (id, status) => {
  auditForm.id = id;
  auditForm.status = status;
  auditForm.rejectReason = "";
  auditForm.offlineReason = "";
  auditVisible.value = true;
  infoWindow?.close();
};

const handleAuditSubmit = async () => {
  // 驳回时必须填写驳回原因
  if (auditForm.status === 3 && !auditForm.rejectReason.trim()) {
    message.warning("请填写驳回原因");
    return;
  }
  // 下架时必须填写下架原因
  if (auditForm.status === 2 && !auditForm.offlineReason.trim()) {
    message.warning("请填写下架原因");
    return;
  }

  try {
    auditLoading.value = true;
    await auditCourt({
      id: auditForm.id,
      status: auditForm.status,
      rejectReason: auditForm.rejectReason || undefined,
      offlineReason: auditForm.offlineReason || undefined,
    });
    message.success(`审核${auditStatusText[auditForm.status]}成功`);
    auditVisible.value = false;
    fetchList();
  } catch (e) {
    message.error("审核失败");
  } finally {
    auditLoading.value = false;
  }
};

// ---- 详情 ----
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);

const handleDetail = async (id) => {
  detailLoading.value = true;
  detailVisible.value = true;
  infoWindow?.close();
  try {
    const res = await getCourtDetail(id);
    if (res?.data) {
      detailData.value = res.data;
    }
  } catch (e) {
    message.error("获取详情失败");
  } finally {
    detailLoading.value = false;
  }
};

// ---- 上传 ----
const handleUpload = async ({ file, onSuccess, onError }) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("dir", "court");
  try {
    const res = await uploadFileImage(fd);
    if (res?.data?.url) {
      // 将 URL 设置到 file 对象上，方便后续收集
      onSuccess(res.data);
      // 更新 fileList 中对应文件的 url
      const target = fileList.value.find((f) => f.uid === file.uid);
      if (target) {
        target.url = res.data.url;
        target.status = "done";
      }
    } else {
      onError(new Error("上传失败"));
    }
  } catch (e) {
    onError(e);
    message.error("上传失败");
  }
};

// ---- 生命周期 ----
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const locateAndCheckCity = () => {
  if (!map.value || !AMap) return;

  const geolocation = new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    zoomToAccuracy: true,
    showCircle: true,
    showMarker: true,
    panToLocation: true,
  });

  map.value.addControl(geolocation);

  geolocation.getCurrentPosition((status, result) => {
    if (status !== "complete") {
      console.warn("定位失败:", result);
      message.warning("定位失败，请手动选择城市");
      return;
    }

    const { addressComponent } = result;
    const userCity = addressComponent?.city || "";
    const userProvince = addressComponent?.province || "";

    // 定位成功后，检查当前城市是否在开放城市中
    const cities = openCities.value;
    if (!cities.length) return;

    const matchedCity = cities.find(
      (c) =>
        userCity.includes(c.cityName) ||
        c.cityName.includes(userCity) ||
        userProvince.includes(c.cityName) ||
        c.cityName.includes(userProvince)
    );

    if (!matchedCity) {
      const cityNames = cities.map((c) => c.cityName).join("、");
      notification.warning({
        message: "当前不在开放城市",
        description: `您当前所在城市为 ${userCity || userProvince}，暂未开放。已开放城市：${cityNames}`,
        duration: 6,
        placement: "top",
      });
    } else {
      // 在开放城市中，自动切换到该城市并刷新数据
      activeCityId.value = matchedCity.id;
      fetchList();
    }
  });
};

let resizeObserver = null;

// 从仪表盘跳转过来时，读取 query 参数并清除
const applyQueryParams = () => {
  const queryStatus = route.query.status;
  const queryName = route.query.name;
  if (queryStatus !== undefined) {
    searchForm.status = Number(queryStatus);
  }
  if (queryName) {
    searchForm.name = queryName;
  }
  if (queryStatus !== undefined || queryName) {
    window.history.replaceState(null, '', '/court/court_map');
    fetchList();
  }
};

// keep-alive 缓存后再次进入时触发
onActivated(() => {
  applyQueryParams();
});

onMounted(async () => {
  refreshCities()
  await initMap()
  fetchList()
  applyQueryParams()

  // 注册地图 InfoWindow 中按钮的全局回调
  window.__courtEdit = (id) => {
    const court = markers.value
      .find((m) => m.getExtData().id === id)
      ?.getExtData();
    if (court) handleEdit(court);
  };
  window.__courtDelete = (id) => {
    handleDelete(id);
  };
  window.__courtAudit = (id, status) => {
    handleAudit(id, status);
  };
  window.__courtDetail = (id) => {
    handleDetail(id);
  };
  window.__closeInfoWindow = () => {
    infoWindow?.close();
  };

  // 手机端自动定位并检查城市
  if (isMobile()) {
    locateAndCheckCity()
  }

  const header = document.querySelector("header")
  if (header) {
    const updateHeaderHeight = () => {
      const h = header.offsetHeight
      document.documentElement.style.setProperty("--header-height", h + "px")
    }
    updateHeaderHeight()
    resizeObserver = new ResizeObserver(updateHeaderHeight)
    resizeObserver.observe(header)
  }
  window.addEventListener("resize", onResize)
})

onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
    map.value = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener("resize", onResize)
  delete window.__courtEdit
  delete window.__courtDelete
  delete window.__courtAudit
  delete window.__courtDetail
  delete window.__closeInfoWindow
})
</script>

<style scoped>
/* 全屏容器 */
.court-view {
  position: fixed;
  top: var(--header-height, 56px);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  overflow: hidden;
  transition: top 0.2s ease;
}

/* 地图铺满 */
.court-view__map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* drawer 打开时禁用地图触摸事件，防止手机端地图拦截点击 */
.court-view__map--disabled {
  pointer-events: none !important;
}

/* 搜索栏悬浮 */
.court-view__search {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 20;
}

.search-panel {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12);
  transition: padding 0.3s ease;
}

.search-panel--collapsed {
  padding: 6px 12px;
}

.search-panel__body {
  overflow: hidden;
}

/* 内容行：筛选条件 + 右侧按钮 */
.search-panel__content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.search-form :deep(.ant-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.ant-form-item-label) {
  padding: 0;
}

/* 统一输入框宽度 */
.search-input {
  width: 110px !important;
}

.search-input--sm {
  width: 88px !important;
}

/* 桌面端按钮组：固定在右侧 */
.search-panel__actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
}

/* 左侧开放城市列表 */
.court-view__city-list {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.city-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.city-list__title {
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
}

.city-list__refresh {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #86909c;
  font-size: 13px;
  transition: all 0.2s;
}

.city-list__refresh:hover {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.08);
}

.city-list__refresh--loading {
  color: #1677ff;
  pointer-events: none;
}

.city-tag {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  color: #4e5969;
  cursor: pointer;
  white-space: nowrap;
  text-align: center;
  transition: all 0.2s ease;
  user-select: none;
  text-align: center;
}

.city-tag:hover {
  color: #1677ff;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(22, 119, 255, 0.2);
}

.city-tag--active {
  background: #1677ff;
  color: #fff;
  box-shadow: 0 2px 10px rgba(22, 119, 255, 0.35);
}

.city-tag--active:hover {
  color: #fff;
  background: #4096ff;
}

/* 右侧浮动按钮组 */
.court-view__float-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
}

/* 折叠态底部操作栏 */
.search-panel__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.search-panel--collapsed .search-panel__footer {
  justify-content: space-between;
  margin-top: 0;
}

.search-panel__collapsed-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-panel__title {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
}

/* 展开/收起按钮 */
.search-panel__toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #86909c;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
}

.search-panel__toggle:hover {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.06);
}

.toggle-text {
  white-space: nowrap;
}

/* 浮动按钮 */
.float-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

/* 按下时变蓝，松开恢复 */
.float-action-btn:active {
  background: #1677ff;
  color: #fff;
  transform: scale(0.92);
}

/* 桌面端 hover 仅缩放，不变色 */
@media (hover: hover) {
  .float-action-btn:hover {
    transform: scale(1.08);
  }
}

/* 高德模式激活态 */
.float-action-btn--active {
  background: #1677ff;
  color: #fff;
}

/* 添加球场按钮 */
.float-action-btn--primary {
  background: #1677ff;
  color: #fff;
}

.float-action-btn--primary:active {
  background: #4096ff;
}

/* ---- 手机端响应式 ---- */
@media (max-width: 768px) {
  .court-view__city-list {
    left: 8px;
    top: 72px;
    transform: none;
    width: fit-content;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }

  .city-tag {
    padding: 4px 10px;
    font-size: 12px;
  }

  .search-panel {
    padding: 8px 10px;
  }

  .search-panel__content {
    flex-direction: column;
    gap: 8px;
  }

  .search-panel__actions {
    display: none;
  }
}

/* 添加模式提示 */
.court-view__tip {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
}

/* 底部卡片条 */
.court-view__cards {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 12px 8px;
  pointer-events: none;
}

.card-strip__count {
  font-size: 12px;
  color: #8c8c8c;
  padding: 0 6px 4px;
  pointer-events: auto;
}

.card-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 6px;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.1);
}

.card-strip::-webkit-scrollbar {
  height: 6px;
}

.card-strip::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.card-strip::-webkit-scrollbar-track {
  background: transparent;
}

.card-strip__empty {
  flex: 1;
  text-align: center;
  color: #86909c;
  font-size: 12px;
  padding: 12px 0;
}
</style>
