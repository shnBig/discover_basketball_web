# 反馈通知 WebSocket 前端对接文档

## 一、功能概述

当小程序用户提交「球场问题反馈」或「小程序意见反馈」后，后端会通过 WebSocket **实时广播**通知给所有在线的管理端。管理端收到通知后可点击跳转到对应详情页进行处理。

---

## 二、WebSocket 连接

### 2.1 连接地址

```
ws://{后端域名}/ws/feedback/{adminId}
```

- `adminId`：当前登录管理员的 ID（数字类型）

### 2.2 连接时机

管理员**登录成功后**立即建立 WebSocket 连接，页面关闭或退出登录时断开。

### 2.3 示例代码

```javascript
// 连接
const ws = new WebSocket(`ws://${API_BASE_URL}/ws/feedback/${adminId}`)

// 接收消息
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  handleNotification(notification)
}

// 断线重连（建议加指数退避）
ws.onclose = () => {
  setTimeout(() => reconnect(), 3000)
}
```

---

## 三、消息格式

后端推送的消息为 JSON 字符串，通过 `type` 字段区分通知类型。

### 3.1 球场问题反馈通知

当用户提交了球场问题反馈时推送。

```json
{
  "type": "COURT_REPORT",
  "id": 1,
  "courtId": 5,
  "courtName": "XX篮球公园",
  "reportType": 1,
  "reportTypeDesc": "场地破损",
  "content": "地面有裂缝，容易受伤",
  "message": "新的球场问题反馈：XX篮球公园 - 场地破损"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 固定值 `COURT_REPORT` |
| id | number | 反馈记录 ID，用于调详情接口 |
| courtId | number | 球场 ID，用于跳转球场详情页 |
| courtName | string | 球场名称 |
| reportType | number | 反馈类型编码 |
| reportTypeDesc | string | 反馈类型中文描述 |
| content | string | 反馈内容 |
| message | string | 可直接展示的通知文案 |

### 3.2 小程序意见反馈通知

当用户提交了小程序意见反馈时推送。

```json
{
  "type": "APP_FEEDBACK",
  "id": 2,
  "feedbackType": 1,
  "feedbackTypeDesc": "功能建议",
  "content": "希望添加收藏功能",
  "message": "新的小程序意见反馈：功能建议"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 固定值 `APP_FEEDBACK` |
| id | number | 反馈记录 ID，用于调详情接口 |
| feedbackType | number | 反馈类型编码（1=功能建议 2=Bug反馈 3=体验优化 4=其他） |
| feedbackTypeDesc | string | 反馈类型中文描述 |
| content | string | 反馈内容 |
| message | string | 可直接展示的通知文案 |

---

## 四、前端处理逻辑

### 4.1 收到通知 → 弹出提示

收到 WebSocket 消息后，使用 Notification / Message 组件弹出提示：

```javascript
function handleNotification(data) {
  // 1. 弹出通知提示（以 Element Plus 为例）
  ElNotification({
    title: '新反馈',
    message: data.message,
    type: 'warning',
    duration: 0,  // 不自动关闭
    onClick: () => navigateToDetail(data)
  })
}
```

### 4.2 点击通知 → 跳转详情页

根据 `type` 字段决定跳转目标：

```javascript
function navigateToDetail(data) {
  if (data.type === 'COURT_REPORT') {
    // 跳转到球场反馈详情页
    router.push({
      path: '/court-report/detail',
      query: { id: data.id, courtId: data.courtId }
    })
  } else if (data.type === 'APP_FEEDBACK') {
    // 跳转到小程序反馈详情页
    router.push({
      path: '/app-feedback/detail',
      query: { id: data.id }
    })
  }
}
```

### 4.3 跳转球场详情页（可选）

如果是球场反馈，除了查看反馈详情外，还可以用 `courtId` 跳转球场信息页：

```javascript
// 查看关联球场详情
router.push({ path: `/court/${data.courtId}` })
```

---

## 五、相关 HTTP 接口

点击通知跳转后，需要调用以下接口获取完整数据：

### 5.1 球场反馈相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/court-report/admin/{id}` | GET | 获取反馈详情 |
| `/api/court-report/admin/page` | GET | 分页查询反馈列表 |
| `/api/court-report/admin/handle/{id}` | PUT | 处理反馈 |
| `/api/court-report/admin/{id}` | DELETE | 删除反馈 |

**反馈详情返回字段（CourtReportVO）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 反馈 ID |
| userId | number | 反馈用户 ID |
| nickname | string | 用户昵称 |
| courtId | number | 球场 ID |
| courtName | string | 球场名称 |
| reportType | number | 反馈类型编码 |
| reportTypeDesc | string | 反馈类型描述 |
| content | string | 反馈内容 |
| images | string | 图片 URL（JSON 数组字符串，需 parse） |
| status | number | 处理状态（0=待处理 1=已处理 2=已忽略 3=已关闭） |
| statusDesc | string | 状态描述 |
| adminRemark | string | 管理员备注 |
| handleAdminId | number | 处理管理员 ID |
| createTime | string | 创建时间 |
| updateTime | string | 更新时间 |

### 5.2 小程序反馈相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/app-feedback/admin/{id}` | GET | 获取反馈详情 |
| `/api/app-feedback/admin/page` | GET | 分页查询反馈列表 |
| `/api/app-feedback/admin/handle/{id}` | PUT | 处理反馈 |
| `/api/app-feedback/admin/{id}` | DELETE | 删除反馈 |

**反馈详情返回字段（AppFeedbackVO）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 反馈 ID |
| userId | number | 反馈用户 ID |
| nickname | string | 用户昵称 |
| feedbackType | number | 反馈类型编码（1=功能建议 2=Bug反馈 3=体验优化 4=其他） |
| feedbackTypeDesc | string | 反馈类型描述 |
| content | string | 反馈内容 |
| images | string | 图片 URL（JSON 数组字符串，需 parse） |
| contactInfo | string | 联系方式 |
| status | number | 处理状态（0=待处理 1=已处理 2=已忽略 3=已关闭） |
| statusDesc | string | 状态描述 |
| adminRemark | string | 管理员备注 |
| handleAdminId | number | 处理管理员 ID |
| createTime | string | 创建时间 |
| updateTime | string | 更新时间 |

---

## 六、整体流程图

```
小程序用户                    后端                        管理端前端
   |                          |                             |
   |  提交球场反馈/意见反馈     |                             |
   |------------------------->|                             |
   |                          |  写入数据库                   |
   |                          |  WebSocket 广播通知           |
   |                          |---------------------------->|
   |                          |                             |  弹出通知提示
   |                          |                             |  管理员点击通知
   |                          |  GET /admin/{id}             |
   |                          |<----------------------------|
   |                          |  返回反馈详情                 |
   |                          |---------------------------->|
   |                          |                             |  渲染详情页
```

---

## 七、注意事项

1. **images 字段**是 JSON 数组字符串，前端需要 `JSON.parse()` 后渲染图片列表
2. **断线重连**：WebSocket 可能因网络问题断开，建议实现指数退避重连机制
3. **心跳保活**：长时间无消息时，建议前端定时发送 ping 帧防止连接被中间件断开
4. **通知去重**：如果管理端多个标签页同时打开，每个标签页都会收到广播，注意避免重复提示
5. **courtId 用途**：球场反馈通知中的 `courtId` 可用于跳转球场详情页查看球场完整信息
