<template>
  <div v-if="visible" class="nav-overlay" @click="close">
    <div class="nav-popup" @click.stop>
      <div class="nav-indicator"></div>
      <div class="nav-title">选择导航应用</div>
      <div class="nav-subtitle">导航至 {{ destinationName }}</div>
      <div class="nav-list">
        <button
          v-for="map in availableMaps"
          :key="map.key"
          class="nav-item"
          @click="navigate(map.key)"
        >
          <div class="nav-icon">{{ map.icon }}</div>
          <div class="nav-label">{{ map.label }}</div>
          <div class="nav-arrow">></div>
        </button>
      </div>
      <button class="nav-cancel" @click="close">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { UAParser } from 'ua-parser-js';
import { wgs84ToGcj02, gcj02ToWgs84, gcj02ToBd09 } from '@/utils/coordinateTransformation';

const props = defineProps({
  destinationLat: { type: Number, required: true },
  destinationLng: { type: Number, required: true },
  destinationName: { type: String, default: '目的地' }
});

const visible = ref(false);
const currentPosition = ref(null);

const parser = new UAParser();
const os = parser.getOS();

const isIOS = computed(() => os.name === 'iOS');

const availableMaps = computed(() => {
  const maps = [
    { key: 'amap', label: '高德地图', icon: 'A' },
    { key: 'tencent', label: '腾讯地图', icon: 'T' },
    { key: 'baidu', label: '百度地图', icon: 'B' }
  ];
  if (isIOS.value) {
    maps.push({ key: 'apple', label: '苹果地图', icon: '' });
  }
  return maps;
});

// 获取当前位置
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gcj02 = wgs84ToGcj02(position.coords.latitude, position.coords.longitude);
        currentPosition.value = gcj02;
        resolve(gcj02);
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
};

// 获取地图 URL
const getMapUrl = (mapType) => {
  const lat = props.destinationLat;
  const lng = props.destinationLng;
  const name = encodeURIComponent(props.destinationName);
  const pos = currentPosition.value;

  const configs = {
    amap: () => {
      const from = pos ? `from=${pos.lng},${pos.lat},我的位置&` : '';
      return `https://uri.amap.com/navigation?${from}to=${lng},${lat},${name}&mode=car`;
    },
    tencent: () => {
      const from = pos ? `from=我的位置&fromcoord=${pos.lat},${pos.lng}&` : '';
      return `https://apis.map.qq.com/uri/v1/routeplan?type=drive&${from}to=${name}&tocoord=${lat},${lng}`;
    },
    baidu: () => {
      const dest = gcj02ToBd09(lat, lng);
      const origin = pos ? `origin=latlng:${pos.lat},${pos.lng}|name:我的位置&` : '';
      return `https://api.map.baidu.com/direction?${origin}destination=latlng:${dest.lat},${dest.lng}|name:${name}&coord_type=bd09ll&output=html`;
    },
    apple: () => {
      const dest = gcj02ToWgs84(lat, lng);
      const saddr = pos ? `saddr=${gcj02ToWgs84(pos.lat, pos.lng).lat},${gcj02ToWgs84(pos.lat, pos.lng).lng}&` : '';
      return `http://maps.apple.com/?${saddr}daddr=${dest.lat},${dest.lng}&q=${name}`;
    }
  };

  return configs[mapType]();
};

// 打开弹窗
const open = async () => {
  visible.value = true;
  getCurrentPosition().catch(() => {});
};

// 关闭弹窗
const close = () => {
  visible.value = false;
};

// 导航
const navigate = (mapType) => {
  window.open(getMapUrl(mapType));
  close();
};

defineExpose({ open, close });
</script>

<style scoped>
.nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9998;
  animation: fadeIn 0.3s ease;
}

.nav-popup {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 375px;
  height: 50vh;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  z-index: 9999;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.nav-indicator {
  width: 36px;
  height: 4px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  margin: 0 auto 16px;
  flex-shrink: 0;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
  font-family: -apple-system, SF Pro, PingFang SC, sans-serif;
  flex-shrink: 0;
}

.nav-subtitle {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 16px;
  font-family: -apple-system, SF Pro, PingFang SC, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: background 0.2s;
  font-family: -apple-system, SF Pro, PingFang SC, sans-serif;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active {
  background: rgba(0, 0, 0, 0.08);
}

.nav-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0071e3 0%, #40a9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.nav-label {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

.nav-arrow {
  margin-left: auto;
  font-size: 12px;
  color: #86868b;
}

.nav-cancel {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #0071e3;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: -apple-system, SF Pro, PingFang SC, sans-serif;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

@keyframes slideUp {
  from { transform: translate(-50%, 100%); }
  to { transform: translate(-50%, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
