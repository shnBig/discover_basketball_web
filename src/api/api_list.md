# 前端 API 请求清单

> 项目：backend-admin | HTTP 库：axios | 基础路径：`/api` | 超时时间：100000ms

---

## 一、请求配置 ([http.js](file:///d:/my_project/electronics/discover_basketball-master/src/api/http.js))

| 配置项 | 值 |
|--------|------|
| baseURL | `/api` |
| timeout | 100000ms |
| 请求拦截器 | 添加 `X-Request-Source: admin`、`Authorization: Bearer <token>` |
| 响应拦截器 | `code !== 200` 视为失败，`code === 401` 跳转登录页 |

---

## 二、管理员管理 ([manager.js](file:///d:/my_project/electronics/discover_basketball-master/src/api/manager.js))

| 序号 | 方法 | 接口路径 | 函数名 | 说明 |
|------|------|---------|--------|------|
| 1 | GET | `/admin/page` | `getManagerPage(params)` | 分页查询管理员 |
| 2 | POST | `/admin/add` | `addManager(data)` | 添加管理员 |
| 3 | DELETE | `/admin/delete/:id` | `deleteManager(id)` | 删除管理员 |
| 4 | PUT | `/admin/update` | `updateManager(data)` | 更新管理员 |
| 5 | PUT | `/admin/status` | `updateManagerStatus(data)` | 修改管理员状态 |
| 6 | PUT | `/admin/password` | `updateManagerPassword(data)` | 修改管理员密码 |
| 7 | GET | `/admin/get/:id` | `getManagerDetail(id)` | 获取管理员详情 |
| 8 | GET | `/admin/list` | `getAllManager()` | 获取所有管理员 |

---

## 三、权限管理 ([permission.js](file:///d:/my_project/electronics/discover_basketball-master/src/api/permission.js))

| 序号 | 方法 | 接口路径 | 函数名 | 说明 |
|------|------|---------|--------|------|
| 9 | GET | `/admin/permission/page` | `getPermissionPage(params)` | 分页查询权限 |
| 10 | POST | `/admin/permission/add` | `addPermission(data)` | 添加权限 |
| 11 | DELETE | `/admin/permission/delete/:id` | `deletePermission(id)` | 删除权限 |
| 12 | PUT | `/admin/permission/update` | `updatePermission(data)` | 更新权限 |
| 13 | GET | `/admin/permission/get/:id` | `getPermissionDetail(id)` | 获取权限详情 |
| 14 | GET | `/admin/permission/list` | `getAllPermission()` | 获取所有权限 |
| 15 | GET | `/admin/permission/menus` | `getMenuListApi()` | 获取菜单列表 |

---

## 四、角色管理 ([role.js](file:///d:/my_project/electronics/discover_basketball-master/src/api/role.js))

| 序号 | 方法 | 接口路径 | 函数名 | 说明 |
|------|------|---------|--------|------|
| 16 | GET | `/admin/role/page` | `getRolePage(params)` | 分页查询角色 |
| 17 | GET | `/admin/role/list` | `getAllRole()` | 获取所有角色 |
| 18 | POST | `/admin/role/add` | `addRole(data)` | 添加角色 |
| 19 | DELETE | `/admin/role/delete/:id` | `deleteRole(id)` | 删除角色 |
| 20 | PUT | `/admin/role/update` | `updateRole(data)` | 更新角色 |
| 21 | GET | `/admin/role/get/:id` | `getRoleDetail(id)` | 获取角色详情 |
| 22 | POST | `/admin/role/assignPermissions` | `assignRolePermission(data)` | 为角色分配权限 |

---

## 五、用户管理 ([user.js](file:///d:/my_project/electronics/discover_basketball-master/src/api/user.js))

| 序号 | 方法 | 接口路径 | 函数名 | 说明 |
|------|------|---------|--------|------|
| 23 | POST | `/admin/login` / `/user/login` | `loginApi(data)` | 登录（admin/小程序双模式） |
| 24 | GET | `/admin/list` | `getUserInfoApi()` | 获取管理员列表（获取当前用户信息） |
| 25 | POST | `/admin/page` | `getUserPage(params)` | 分页查询用户 |
| 26 | POST | `/admin/add` | `addUser(data)` | 添加用户 |
| 27 | DELETE | `/admin/delete/:id` | `deleteUser(id)` | 删除用户 |
| 28 | PUT | `/admin/update` | `updateUser(data)` | 更新用户 |
| 29 | PUT | `/admin/status` | `updateUserStatus(data)` | 修改用户状态 |
| 30 | PUT | `/admin/password` | `updateUserPassword(data)` | 修改用户密码 |
| 31 | GET | `/admin/info/:id` | `getUserDetail(id)` | 获取用户详情 |

---

## 六、文件上传 ([upload.js](file:///d:/my_project/electronics/discover_basketball-master/src/api/upload.js))

| 序号 | 方法 | 完整地址 | 函数名 | 说明 |
|------|------|---------|--------|------|
| 32 | POST | `/cos/upload` | `uploadFileImage(data)` | 上传文件到 COS |

> **注意：** upload.js 使用独立的 axios 实例，不走 `/api` 代理，直接请求外部地址。

---

## 七、请求汇总

| 分类 | 接口数量 |
|------|---------|
| 管理员管理 | 8 |
| 权限管理 | 7 |
| 角色管理 | 7 |
| 用户管理 | 9 |
| 文件上传 | 1 |
| **合计** | **32** |

### 按 HTTP 方法汇总

| 方法 | 数量 |
|------|------|
| GET | 13 |
| POST | 10 |
| PUT | 8 |
| DELETE | 4 |

---

## 八、调用关系

### views 调用

| 页面 | 调用的 API |
|------|-----------|
| `views/user/UserView.vue` | getUserPage, addUser, getUserDetail, updateUser, deleteUser, updateUserStatus, updateUserPassword, uploadFileImage |
| `views/manager/ManagerView.vue` | getManagerPage, addManager, getManagerDetail, updateManager, updateManagerStatus, updateManagerPassword, uploadFileImage (及角色相关) |
| `views/permission/PermissionView.vue` | getPermissionPage, addPermission, deletePermission, updatePermission, getPermissionDetail |

### store 调用

| Store | 调用的 API |
|-------|-----------|
| `store/user.js` | loginApi, getUserInfoApi, getMenuListApi |
| `store/map.js` | getMapIconApi (⚠️ 对应文件 `@/api/map.js` 不存在) |

---

## 九、登录页面

登录页面 `views/Login.vue` 通过 `store/user.js` 中的 `loginApi` 发起登录请求：
- **接口：** `POST /admin/login`
- **参数：** `{ username, password }`