<template>
  <div class="map-wrapper">
    <div class="absolute top-0 left-0 w-full z-50 search-box flex gap-2">
      <input
        id="search-input"
        v-model="searchText"
        type="text"
        placeholder="请输入哈尔滨地址（如：哈尔滨市道里区中央大街）"
        class="w-full flex-1 p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        @keyup.enter="handleSearch"
      />
      <button
        @click="handleSearch"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        搜索定位
      </button>
    </div>
    <!-- 地图容器 + 标记操作按钮组 -->
    <div class="map-container-wrapper relative">
      <div id="container" class="map-container"></div>
      <!-- 按钮组：清除搜索标记 + 清除手动标记（并排显示） -->
      <div class="marker-btns absolute top-2 right-2 flex gap-2">
        <button
          @click="clearSearchMarker"
          class="px-3 py-1.5 bg-white/90 text-slate-700 rounded-md hover:bg-white hover:text-red-500 shadow-md transition-all"
        >
          清除搜索标记
        </button>
        <button
          @click="clearMarker"
          class="px-3 py-1.5 bg-white/90 text-slate-700 rounded-md hover:bg-white hover:text-red-500 shadow-md transition-all"
        >
          清除手动标记
        </button>
      </div>
    </div>
    <div v-if="errorMsg" class="error-msg text-red-500 mt-2">
      {{ errorMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useMapStore } from "@/store/map";
// import { reverseGeocodeApi } from "@/api/map";

const props = defineProps({
  lng: { type: Number, default: 126.53505 },
  lat: { type: Number, default: 45.802981 },
});

const emit = defineEmits(["update:lng", "update:lat"]);

const searchText = ref("");
const map = ref(null);
const geocoder = ref(null);
const placeSearch = ref(null);
const autoComplete = ref(null);
const errorMsg = ref("");
const isMapReady = ref(false);
let originalGetContext = null;
let AMap = null;
// 存储搜索生成的标记（蓝色标点）
const searchMarker = ref(null);
// 新增：存储所有手动标记（右键添加的自定义图标标记）
const manualMarkers = ref([]);

// 地图图标地址
const mapIconUrl = ref(null);

// 获取地图图标
const getMapIcon = async (objectKey, expiresSeconds) => {
  try {
    const res = await useMapStore().getMapIcon(objectKey, expiresSeconds);
    console.log("res", res);
    mapIconUrl.value = res.url;
  } catch (error) {
    return Promise.reject(error);
  }
};

// 统一设置经纬度和搜索标记的方法（只替换搜索标记，保留手动标记）
const setLngLat = (lng, lat, title = "") => {
  if (!isMapReady.value || !map.value) return;
  emit("update:lng", lng);
  emit("update:lat", lat);
  
  // 移除旧的搜索标记（不影响手动标记）
  if (searchMarker.value) {
    map.value.remove(searchMarker.value);
    searchMarker.value = null;
  }
  
  // 创建新的搜索标记并保存引用
  searchMarker.value = new AMap.Marker({
    position: [lng, lat],
    map: map.value,
    title: title || searchText.value,
  });
  
  map.value.setCenter([lng, lat]);
};

// 清除搜索生成的蓝色标记
const clearSearchMarker = () => {
  if (!map.value || !searchMarker.value) {
    errorMsg.value = "暂无搜索标记可清除";
    return;
  }
  // 从地图移除搜索标记
  map.value.remove(searchMarker.value);
  searchMarker.value = null;
  errorMsg.value = "";
  console.log("搜索标记已清除");
};

// 重构：仅清除手动标记（右键添加的自定义图标标记），保留搜索标记
const clearMarker = () => {
  if (!map.value || manualMarkers.value.length === 0) {
    errorMsg.value = "暂无手动标记可清除";
    return;
  }
  // 遍历删除所有手动标记
  manualMarkers.value.forEach(marker => {
    map.value.remove(marker);
  });
  // 清空手动标记数组
  manualMarkers.value = [];
  errorMsg.value = "";
  console.log("所有手动标记已清除");
};

// 初始化地图
const initMap = async () => {
  try {
    // 修复 Canvas 上下文
    // 保留原版上下文,方便在子页面卸载的时候恢复
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (contextType, options) {
      if (contextType === "2d") {
        return originalGetContext.call(this, contextType, {
          ...options,
          willReadFrequently: true,
        });
      }
      return originalGetContext.call(this, contextType, options);
    };
    // 获取地图图标
    await getMapIcon("icon/court_logo.png", 36000);

    // 加载 SDK 时传入安全密钥
    AMap = await AMapLoader.load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: "2.0",
      plugins: ["AMap.Geocoder", "AMap.PlaceSearch", "AMap.ToolBar"],
    });

    // 初始化地图
    map.value = new AMap.Map("container", {
      zoom: 15,
      center: [props.lng, props.lat],
      resizeEnable: true,
      viewMode: "2D",
    });

    // 添加右键事件（自定义图标标记）- 新增：存入manualMarkers数组
    map.value.on("rightclick", (e) => {
      console.log("右键事件触发的对象:", e.lnglat);
      // 定义图标尺寸（统一配置，方便修改）
      const iconSize = 30; // 图标宽高都是30px
      const anchorX = iconSize / 2; // 锚点X：15
      const anchorY = iconSize / 2; // 锚点Y：15
      // 在右键位置添加标记,红色标记
      let marker = new AMap.Marker({
        position: e.lnglat, // 点击的经纬度（核心坐标）
        map: map.value,
        title: `经纬度: ${e.lnglat.lng.toFixed(6)}, ${e.lnglat.lat.toFixed(6)}`,
        icon: new AMap.Icon({
          image: mapIconUrl.value, // 你的图标路径
          size: new AMap.Size(iconSize, iconSize), // 图标在地图上的显示尺寸
          imageSize: new AMap.Size(iconSize, iconSize), // 图片实际尺寸（和显示尺寸一致）
          anchor: new AMap.Pixel(anchorX, anchorY), // 【关键】锚点设为图标中心点
        }),
        // 额外兜底：确保Marker的偏移量为0（避免默认偏移干扰）
        offset: new AMap.Pixel(-anchorX, -anchorY),
      });
      // 新增：将手动标记存入数组，用于后续清除
      manualMarkers.value.push(marker);
      marker.on("click", () => {
        console.log("点击了手动标记:", marker);
      });
    });

    // 初始化PlaceSearch（限定哈尔滨）
    placeSearch.value = new AMap.PlaceSearch({
      city: "哈尔滨市",
      citylimit: true, // 强制只返回哈尔滨结果
      pageSize: 10,
      type: "poi", // 只搜POI点
      extensions: "all", // 返回详细信息
    });

    // 初始化Geocoder
    geocoder.value = new AMap.Geocoder({
      radius: 1000,
      extensions: "all",
    });

    // 添加工具条
    const toolbar = new AMap.ToolBar();
    map.value.addControl(toolbar);

    // 初始化AutoComplete（优化配置）
    AMap.plugin("AMap.AutoComplete", function () {
      autoComplete.value = new AMap.AutoComplete({
        city: "哈尔滨市",
        citylimit: true, // 强制只返回哈尔滨结果
        input: "search-input",
        outPutDirAuto: false,
        type: "poi", // 只搜POI点
        datatype: "all", // 返回所有类型POI
      });

      // 监听AutoComplete选中事件
      autoComplete.value.on("select", function (event) {
        if (event?.poi?.location) {
          const lng = event.poi.location.lng;
          const lat = event.poi.location.lat;
          console.log("AutoComplete选中POI：", event.poi);
          setLngLat(lng, lat, event.poi.name);
          errorMsg.value = "";
        }
      });
    });

    isMapReady.value = true;
    errorMsg.value = "";
    console.log("地图初始化成功");
  } catch (err) {
    errorMsg.value = `地图初始化失败：${err.message}`;
    console.error("初始化错误：", err);
  }
};

const handleSearch = () => {
  const keyword = searchText.value.trim();
  if (!keyword) {
    errorMsg.value = "请输入有效地址";
    return;
  }
  if (!isMapReady.value) {
    errorMsg.value = "地图未初始化完成";
    return;
  }

  errorMsg.value = "";
  console.log("开始搜索：", keyword);

  // 第一步：尝试PlaceSearch搜索（优先级最高）
  placeSearch.value.search(keyword, (status, result) => {
    if (status === "complete" && result?.poiList?.pois?.length) {
      // PlaceSearch搜到结果
      const firstPoi = result.poiList.pois[0];
      setLngLat(firstPoi.location.lng, firstPoi.location.lat, firstPoi.name);
      errorMsg.value = `搜索成功：${firstPoi.name}`;
    } else {
      // 第二步：PlaceSearch没结果，用Geocoder地址解析兜底
      geocoder.value.getLocation(keyword, (status, result) => {
        if (status === "complete" && result?.geocodes?.length) {
          const loc = result.geocodes[0].location;
          setLngLat(loc.lng, loc.lat);
          errorMsg.value = `解析成功：${result.geocodes[0].formattedAddress}`;
        } else {
          // 最终兜底失败提示
          errorMsg.value = `未找到该地址，请尝试更精确的关键词（如：哈尔滨市XX区XX路）`;
        }
      });
    }
  });
};

// 全局安全密钥配置
window._AMapSecurityConfig = {
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
};

// 生命周期
onMounted(async () => {
  await initMap();
});

onUnmounted(() => {
  if (originalGetContext) {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  }
  if (map.value) {
    map.value.destroy();
  }
  geocoder.value = null;
  placeSearch.value = null;
  autoComplete.value = null;
  searchMarker.value = null; 
  manualMarkers.value = []; // 清理手动标记数组
  isMapReady.value = false;
});
</script>

<style lang="postcss" scoped>
.map-wrapper {
  width: 100%;
}
.search-box {
  align-items: center;
  margin-bottom: 8px;
}
/* 新增地图容器包裹层（相对定位） */
.map-container-wrapper {
  position: relative;
  width: 100%;
}
.map-container {
  width: 100%;
  aspect-ratio: 1 / 0.7;
  border: 1px solid #eee;
}
.error-msg {
  font-size: 14px;
}
/* 按钮组样式：并排显示，间距2px */
.marker-btns {
  z-index: 45; /* 确保按钮在地图上层 */
}
/* 按钮基础样式（复用） */
.marker-btns button {
  border: none;
  cursor: pointer;
  font-size: 14px;
}
</style>

<!-- 全局样式：自定义高德下拉框 -->
<style lang="postcss">
/* 高德下拉框容器 */
body .amap-sug-result {
  width: 100% !important;
  max-width: 500px !important;
  margin-top: 2px !important; /* 贴近输入框 */
  border: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
  padding: 8px 0 !important;
  background: rgba(255, 255, 255, 0.95) !important; /* 半透明 */
  font-size: 14px !important;
  z-index: 99999 !important;
  box-sizing: border-box !important;
}

/* 单个选项 */
body .amap-sug-item {
  padding: 12px 16px !important;
  height: auto !important;
  line-height: 1.5 !important;
  color: #333 !important;
  font-size: 14px !important;
  transition: background 0.2s ease !important;
}

/* 选中/hover 状态 */
body .amap-sug-item:hover,
body .amap-sug-item.amap-sug-item-active {
  background-color: #f0f7ff !important;
  color: #165dff !important;
}

/* 高亮匹配文字 */
body .amap-sug-item em {
  color: #165dff !important;
  font-style: normal !important;
  font-weight: 600 !important;
}

/* 无结果提示 */
body .amap-sug-empty {
  padding: 20px !important;
  color: #999 !important;
  font-size: 14px !important;
  text-align: center !important;
}
</style>