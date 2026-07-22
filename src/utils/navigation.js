import { UAParser } from 'ua-parser-js';
import { wgs84ToGcj02, gcj02ToWgs84, gcj02ToBd09 } from './coordinateTransformation';

class NavigationManager {
  constructor(gcj02Lat, gcj02Lng, destinationName = '目的地') {
    this.gcj02 = { lat: gcj02Lat, lng: gcj02Lng };
    this.name = destinationName;
    this.currentPosition = null;
    this.parser = new UAParser();
    this.device = this.parser.getDevice();
    this.os = this.parser.getOS();
  }

  // 获取用户当前位置
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const wgs84 = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const gcj02 = wgs84ToGcj02(wgs84.lat, wgs84.lng);
          this.currentPosition = gcj02;
          resolve(gcj02);
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // 判断设备类型
  isIOS() {
    return this.os.name === 'iOS' || this.device.type === 'mobile' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  isAndroid() {
    return this.os.name === 'Android' || this.device.type === 'mobile' && /Android/.test(navigator.userAgent);
  }

  isMobile() {
    return this.device.type === 'mobile' || this.device.type === 'tablet';
  }

  // 获取可用的地图列表
  getAvailableMaps() {
    const maps = [
      { key: 'amap', label: '🗺️ 高德地图' },
      { key: 'tencent', label: '🗺️ 腾讯地图' },
      { key: 'baidu', label: '🗺️ 百度地图' }
    ];

    // 只有 iOS 设备才显示苹果地图
    if (this.isIOS()) {
      maps.push({ key: 'apple', label: '🗺️ 苹果地图' });
    }

    return maps;
  }

  // 导航到目的地
  async navigate(mapType = 'amap') {
    if (!this.currentPosition) {
      try {
        await this.getCurrentPosition();
      } catch (error) {
        console.warn('获取位置失败，将只设置终点', error);
      }
    }

    const mapConfigs = {
      amap: {
        name: '高德地图',
        url: () => {
          const from = this.currentPosition
            ? `from=${this.currentPosition.lng},${this.currentPosition.lat},我的位置&`
            : '';
          return `https://uri.amap.com/navigation?${from}to=${this.gcj02.lng},${this.gcj02.lat},${encodeURIComponent(this.name)}&mode=car`;
        },
        scheme: () => {
          const from = this.currentPosition
            ? `slat=${this.currentPosition.lat}&slon=${this.currentPosition.lng}&sname=我的位置&`
            : '';
          return `androidamap://navi?sourceApplication=myapp&${from}dlat=${this.gcj02.lat}&dlon=${this.gcj02.lng}&dname=${encodeURIComponent(this.name)}&dev=0&style=0`;
        }
      },
      tencent: {
        name: '腾讯地图',
        url: () => {
          const from = this.currentPosition
            ? `from=我的位置&fromcoord=${this.currentPosition.lat},${this.currentPosition.lng}&`
            : '';
          return `https://apis.map.qq.com/uri/v1/routeplan?type=drive&${from}to=${encodeURIComponent(this.name)}&tocoord=${this.gcj02.lat},${this.gcj02.lng}`;
        },
        scheme: () => {
          const from = this.currentPosition
            ? `from=我的位置&fromcoord=${this.currentPosition.lat},${this.currentPosition.lng}&`
            : '';
          return `qqmap://map/routeplan?type=drive&${from}to=${encodeURIComponent(this.name)}&tocoord=${this.gcj02.lat},${this.gcj02.lng}`;
        }
      },
      baidu: {
        name: '百度地图',
        url: () => {
          const dest = gcj02ToBd09(this.gcj02.lat, this.gcj02.lng);
          const origin = this.currentPosition
            ? `origin=latlng:${this.currentPosition.lat},${this.currentPosition.lng}|name:我的位置&`
            : '';
          return `https://api.map.baidu.com/direction?${origin}destination=latlng:${dest.lat},${dest.lng}|name:${encodeURIComponent(this.name)}&coord_type=bd09ll&output=html`;
        },
        scheme: () => {
          const dest = gcj02ToBd09(this.gcj02.lat, this.gcj02.lng);
          const origin = this.currentPosition
            ? `origin=latlng:${this.currentPosition.lat},${this.currentPosition.lng}|name:我的位置&`
            : '';
          return `baidumap://map/direction?${origin}destination=latlng:${dest.lat},${dest.lng}|name:${encodeURIComponent(this.name)}&coord_type=gcj02&mode=driving`;
        }
      },
      apple: {
        name: '苹果地图',
        url: () => {
          const dest = gcj02ToWgs84(this.gcj02.lat, this.gcj02.lng);
          const saddr = this.currentPosition
            ? `saddr=${gcj02ToWgs84(this.currentPosition.lat, this.currentPosition.lng).lat},${gcj02ToWgs84(this.currentPosition.lat, this.currentPosition.lng).lng}&`
            : '';
          return `http://maps.apple.com/?${saddr}daddr=${dest.lat},${dest.lng}&q=${encodeURIComponent(this.name)}`;
        },
        scheme: () => {
          const dest = gcj02ToWgs84(this.gcj02.lat, this.gcj02.lng);
          const saddr = this.currentPosition
            ? `saddr=${gcj02ToWgs84(this.currentPosition.lat, this.currentPosition.lng).lat},${gcj02ToWgs84(this.currentPosition.lat, this.currentPosition.lng).lng}&`
            : '';
          return `http://maps.apple.com/?${saddr}daddr=${dest.lat},${dest.lng}&q=${encodeURIComponent(this.name)}`;
        }
      }
    };

    const config = mapConfigs[mapType];
    if (!config) {
      throw new Error(`不支持的地图类型: ${mapType}`);
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = config.scheme();
      document.body.appendChild(iframe);

      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(config.url());
      }, 2000);
    } catch (error) {
      window.open(config.url());
    }
  }

  // 显示地图选择器
  async showMapSelector() {
    try {
      await this.getCurrentPosition();
    } catch (error) {
      console.warn('获取位置失败', error);
    }

    const maps = this.getAvailableMaps();

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 9999;
      min-width: 300px;
      text-align: center;
    `;

    const title = document.createElement('div');
    title.textContent = this.currentPosition
      ? `📍 从我的位置导航到 ${this.name}`
      : `📍 导航到 ${this.name}`;
    title.style.cssText = 'font-size: 18px; font-weight: bold; margin-bottom: 15px;';
    container.appendChild(title);

    maps.forEach(map => {
      const btn = document.createElement('button');
      btn.textContent = map.label;
      btn.style.cssText = `
        display: block;
        width: 100%;
        padding: 12px;
        margin: 8px 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f8f9fa;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
      `;
      btn.onmouseover = () => {
        btn.style.background = '#e9ecef';
      };
      btn.onmouseout = () => {
        btn.style.background = '#f8f9fa';
      };
      btn.onclick = () => {
        this.navigate(map.key);
        document.body.removeChild(container);
      };
      container.appendChild(btn);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ 取消';
    closeBtn.style.cssText = `
      display: block;
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      border: none;
      background: transparent;
      color: #999;
      font-size: 14px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(container);
    };
    container.appendChild(closeBtn);

    document.body.appendChild(container);
  }

  // 智能导航
  async smartNavigate() {
    if (this.isMobile()) {
      // 移动端直接打开地图，不显示选择器
      if (this.isIOS()) {
        await this.navigate('apple');
      } else if (this.isAndroid()) {
        await this.navigate('amap');
      } else {
        await this.showMapSelector();
      }
    } else {
      // PC端显示选择器
      await this.showMapSelector();
    }
  }
}

export default NavigationManager;
