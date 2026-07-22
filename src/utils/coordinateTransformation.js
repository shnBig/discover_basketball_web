import coordtransform from 'coordtransform';

// 1. WGS-84 → GCJ-02（GPS转高德/腾讯）
export function wgs84ToGcj02(lat, lng) {
  const result = coordtransform.wgs84togcj02(lng, lat);
  return { lat: result[1], lng: result[0] };
}

// 2. GCJ-02 → WGS-84（高德转GPS，用于国外地图）
export function gcj02ToWgs84(lat, lng) {
  const result = coordtransform.gcj02towgs84(lng, lat);
  return { lat: result[1], lng: result[0] };
}

// 3. GCJ-02 → BD-09（高德转百度）
export function gcj02ToBd09(lat, lng) {
  const result = coordtransform.gcj02tobd09(lng, lat);
  return { lat: result[1], lng: result[0] };
}

// 4. BD-09 → GCJ-02（百度转高德）
export function bd09ToGcj02(lat, lng) {
  const result = coordtransform.bd09togcj02(lng, lat);
  return { lat: result[1], lng: result[0] };
}

// 5. WGS-84 → BD-09（GPS直接转百度）
export function wgs84ToBd09(lat, lng) {
  const gcj = coordtransform.wgs84togcj02(lng, lat);
  const bd = coordtransform.gcj02tobd09(gcj[0], gcj[1]);
  return { lat: bd[1], lng: bd[0] };
}