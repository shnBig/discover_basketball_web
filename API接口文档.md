# Discover Basketball API 接口文档

## 目录
1. [通用说明](#通用说明)
2. [管理员模块 (Admin)](#管理员模块-admin)
3. [用户模块 (User)](#用户模块-user)
4. [角色模块 (Role)](#角色模块-role)
5. [菜单模块 (Menu)](#菜单模块-menu)
6. [球场模块 (Court)](#球场模块-court)
7. [COS对象存储](#cos对象存储)
8. [TOS对象存储](#tos对象存储)

---

## 通用说明

### 基础信息
- **基础路径**: `/api`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 统一响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200表示成功，0或其它数字表示失败 |
| msg | String | 提示信息 |
| data | Object | 返回数据 |

### 客户端类型说明
前端请求头设置规范：
- 用户小程序端: `header['X-Client-Type'] = 'mini-program'`
- 员工信息采集APP端: `header['X-Client-Type'] = 'collector-app'`
- 后台管理系统端: `header['X-Client-Type'] = 'admin-system'`

---

## 管理员模块 (Admin)

### 1. 管理员登录

**请求URL:** `/api/admin/login`

**请求方式:** `POST`

**客户端类型:** 采集APP端、后台管理系统端

**请求参数:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**响应示例:**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "管理员",
    "phone": "13800138000",
    "email": "admin@example.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roles": ["admin", "editor"],
    "permissions": {
      "buttons": ["add", "edit", "delete"],
      "menus": [1, 2, 3]
    }
  }
}
```

---

### 2. 管理员注册

**请求URL:** `/api/admin/register`

**请求方式:** `POST`

**客户端类型:** 采集APP端、后台管理系统端

**请求参数:**
```json
{
  "username": "newadmin",
  "password": "123456",
  "realName": "新管理员",
  "phone": "13800138001",
  "email": "newadmin@example.com"
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "注册成功",
  "data": {
    "id": 2,
    "username": "newadmin",
    "realName": "新管理员",
    "phone": "13800138001",
    "email": "newadmin@example.com",
    "status": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. 获取当前管理员信息

**请求URL:** `/api/admin/info`

**请求方式:** `GET`

**请求头:** 需要携带token

**响应示例:**
```json
{
  "code": 200,
  "msg": "获取用户信息成功",
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "管理员",
    "phone": "13800138000",
    "email": "admin@example.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": 1,
    "roles": ["admin"],
    "permissions": {
      "buttons": ["add", "edit", "delete"],
      "menus": [1, 2, 3]
    }
  }
}
```

---

### 4. 分页查询管理员列表

**请求URL:** `/api/admin/page`

**请求方式:** `GET`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| username | String | 否 | 用户名（模糊查询） |
| realName | String | 否 | 真实姓名（模糊查询） |
| phone | String | 否 | 手机号 |
| status | Integer | 否 | 状态：0-禁用，1-启用 |

**响应示例:**
```json
{
  "code": 200,
  "msg": "获取用户列表成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "username": "admin",
        "realName": "管理员",
        "phone": "13800138000",
        "email": "admin@example.com",
        "avatarUrl": "https://example.com/avatar.jpg",
        "status": 1,
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "size": 10,
    "pages": 10
  }
}
```

---

### 5. 根据ID查询管理员

**请求URL:** `/api/admin/{id}`

**请求方式:** `GET`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 管理员ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "获取用户信息成功",
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "管理员",
    "phone": "13800138000",
    "email": "admin@example.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": 1,
    "createTime": "2024-01-01 12:00:00"
  }
}
```

---

### 6. 创建管理员

**请求URL:** `/api/admin`

**请求方式:** `POST`

**请求参数:**
```json
{
  "username": "newadmin",
  "password": "123456",
  "realName": "新管理员",
  "phone": "13800138001",
  "email": "newadmin@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "status": 1
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "创建用户成功",
  "data": 2
}
```

---

### 7. 更新管理员

**请求URL:** `/api/admin`

**请求方式:** `PUT`

**请求参数:**
```json
{
  "id": 2,
  "realName": "更新后的姓名",
  "phone": "13800138002",
  "email": "updated@example.com",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "status": 1
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "更新用户成功",
  "data": null
}
```

---

### 8. 删除管理员

**请求URL:** `/api/admin/{id}`

**请求方式:** `DELETE`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 管理员ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "删除用户成功",
  "data": null
}
```

---

### 9. 批量删除管理员

**请求URL:** `/api/admin`

**请求方式:** `DELETE`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | Long[] | 是 | 管理员ID数组 |

**请求示例:** `/api/admin?ids=1,2,3`

**响应示例:**
```json
{
  "code": 200,
  "msg": "批量删除用户成功",
  "data": null
}
```

---

### 10. 修改密码

**请求URL:** `/api/admin/password`

**请求方式:** `PUT`

**请求参数:**
```json
{
  "userId": 1,
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | Long | 是 | 用户ID |
| oldPassword | String | 是 | 旧密码 |
| newPassword | String | 是 | 新密码 |

**响应示例:**
```json
{
  "code": 200,
  "msg": "修改密码成功",
  "data": null
}
```

---

### 11. 给管理员分配角色

**请求URL:** `/api/admin/assignRoles`

**请求方式:** `POST`

**请求参数:**
```json
{
  "adminId": 1,
  "roleIds": [1, 2, 3]
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| adminId | Long | 是 | 管理员ID |
| roleIds | Long[] | 是 | 角色ID列表 |

**响应示例:**
```json
{
  "code": 200,
  "msg": "分配角色成功",
  "data": null
}
```

---

## 用户模块 (User)

### 1. 小程序用户登录

**请求URL:** `/api/user/login`

**请求方式:** `POST`

**请求参数:**
```json
{
  "code": "wx_login_code_xxx"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | String | 是 | 微信登录code |

**响应示例:**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isNew": false,
    "nickname": "微信用户",
    "avatarUrl": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "city": "北京",
    "gender": 1,
    "totalSubmit": 10,
    "passCount": 8,
    "status": 1,
    "lastLoginTime": "2024-01-01T12:00:00"
  }
}
```

---

### 2. 刷新Token

**请求URL:** `/api/user/refresh_token`

**请求方式:** `POST`

**请求参数:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | String | 是 | 刷新令牌 |

**响应示例:**
```json
{
  "code": 200,
  "msg": "token刷新成功",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. 更新用户信息

**请求URL:** `/api/user/update`

**请求方式:** `PUT`

**请求头:** 需要携带token

**请求参数:**
```json
{
  "nickname": "新昵称",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "phone": "13800138001",
  "city": "上海",
  "gender": 2
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "用户信息更新成功",
  "data": {
    "id": 1,
    "nickname": "新昵称",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "phone": "13800138001",
    "city": "上海",
    "gender": 2,
    "status": 1
  }
}
```

---

### 4. 查询用户信息

**请求URL:** `/api/user/info/{id}`

**请求方式:** `GET`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "id": 1,
    "nickname": "微信用户",
    "avatarUrl": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "city": "北京",
    "gender": 1,
    "status": 1
  }
}
```

---

### 5. 用户注册补全

**请求URL:** `/api/user/register`

**请求方式:** `POST`

**请求参数:**
```json
{
  "id": 1,
  "nickname": "新用户",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |
| nickname | String | 是 | 昵称 |
| avatarUrl | String | 否 | 头像URL |

**响应示例:**
```json
{
  "code": 200,
  "msg": "注册成功",
  "data": {
    "id": 1,
    "nickname": "新用户",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": 1
  }
}
```

---

## 角色模块 (Role)

### 1. 分页查询角色列表

**请求URL:** `/api/role/page`

**请求方式:** `GET`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| name | String | 否 | 角色名称（模糊查询） |
| code | String | 否 | 角色编码 |
| status | Integer | 否 | 状态 |

**响应示例:**
```json
{
  "code": 200,
  "msg": "获取角色列表成功",
  "data": {
    "total": 10,
    "list": [
      {
        "id": 1,
        "name": "超级管理员",
        "code": "admin",
        "status": 1,
        "remark": "拥有所有权限",
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 2. 根据ID查询角色

**请求URL:** `/api/role/{id}`

**请求方式:** `GET`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 角色ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "查询角色成功",
  "data": {
    "id": 1,
    "name": "超级管理员",
    "code": "admin",
    "status": 1,
    "remark": "拥有所有权限",
    "createTime": "2024-01-01 12:00:00"
  }
}
```

---

### 3. 获取所有角色列表

**请求URL:** `/api/role/list`

**请求方式:** `GET`

**响应示例:**
```json
{
  "code": 200,
  "msg": "查询角色列表成功",
  "data": [
    {
      "id": 1,
      "name": "超级管理员",
      "code": "admin",
      "status": 1,
      "remark": "拥有所有权限"
    },
    {
      "id": 2,
      "name": "普通用户",
      "code": "user",
      "status": 1,
      "remark": "基础权限"
    }
  ]
}
```

---

### 4. 创建角色

**请求URL:** `/api/role`

**请求方式:** `POST`

**请求参数:**
```json
{
  "name": "新角色",
  "code": "new_role",
  "status": 1,
  "remark": "角色描述"
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "创建角色成功",
  "data": 3
}
```

---

### 5. 更新角色

**请求URL:** `/api/role`

**请求方式:** `PUT`

**请求参数:**
```json
{
  "id": 3,
  "name": "更新后的角色",
  "code": "updated_role",
  "status": 1,
  "remark": "更新后的描述"
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "更新角色成功",
  "data": null
}
```

---

### 6. 删除角色

**请求URL:** `/api/role/{id}`

**请求方式:** `DELETE`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 角色ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "删除角色成功",
  "data": null
}
```

---

### 7. 批量删除角色

**请求URL:** `/api/role`

**请求方式:** `DELETE`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | Long[] | 是 | 角色ID数组 |

**请求示例:** `/api/role?ids=1,2,3`

**响应示例:**
```json
{
  "code": 200,
  "msg": "批量删除角色成功",
  "data": null
}
```

---

### 8. 给角色分配菜单

**请求URL:** `/api/role/assignMenus`

**请求方式:** `POST`

**请求参数:**
```json
{
  "roleId": 1,
  "menuIds": [1, 2, 3, 4, 5]
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleId | Long | 是 | 角色ID |
| menuIds | Long[] | 是 | 菜单ID列表 |

**响应示例:**
```json
{
  "code": 200,
  "msg": "分配菜单成功",
  "data": null
}
```

---

## 菜单模块 (Menu)

### 1. 分页查询菜单列表

**请求URL:** `/api/menu/page`

**请求方式:** `GET`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| name | String | 否 | 菜单名称 |
| type | Integer | 否 | 菜单类型 |
| parentId | Long | 否 | 父菜单ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "查询菜单列表成功",
  "data": {
    "total": 20,
    "list": [
      {
        "id": 1,
        "name": "系统管理",
        "type": 1,
        "parentId": 0,
        "path": "/system",
        "component": "Layout",
        "icon": "setting",
        "sort": 1,
        "status": 1
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 2. 根据ID查询菜单

**请求URL:** `/api/menu/{id}`

**请求方式:** `GET`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 菜单ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "查询菜单成功",
  "data": {
    "id": 1,
    "name": "系统管理",
    "type": 1,
    "parentId": 0,
    "path": "/system",
    "component": "Layout",
    "icon": "setting",
    "sort": 1,
    "status": 1
  }
}
```

---

### 3. 获取所有菜单列表

**请求URL:** `/api/menu/list`

**请求方式:** `GET`

**响应示例:**
```json
{
  "code": 200,
  "msg": "查询菜单列表成功",
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "type": 1,
      "parentId": 0,
      "path": "/system",
      "icon": "setting",
      "sort": 1,
      "status": 1
    },
    {
      "id": 2,
      "name": "用户管理",
      "type": 2,
      "parentId": 1,
      "path": "user",
      "icon": "user",
      "sort": 1,
      "status": 1
    }
  ]
}
```

---

### 4. 获取菜单树形结构

**请求URL:** `/api/menu/tree`

**请求方式:** `GET`

**响应示例:**
```json
{
  "code": 200,
  "msg": "查询菜单树成功",
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "type": 1,
      "parentId": 0,
      "path": "/system",
      "icon": "setting",
      "sort": 1,
      "children": [
        {
          "id": 2,
          "name": "用户管理",
          "type": 2,
          "parentId": 1,
          "path": "user",
          "icon": "user",
          "sort": 1,
          "children": []
        }
      ]
    }
  ]
}
```

---

### 5. 创建菜单

**请求URL:** `/api/menu`

**请求方式:** `POST`

**请求参数:**
```json
{
  "name": "新菜单",
  "type": 1,
  "parentId": 0,
  "path": "/new",
  "component": "NewComponent",
  "icon": "plus",
  "sort": 1,
  "status": 1,
  "permission": "system:new:add"
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "创建菜单成功",
  "data": 10
}
```

---

### 6. 更新菜单

**请求URL:** `/api/menu`

**请求方式:** `PUT`

**请求参数:**
```json
{
  "id": 10,
  "name": "更新后的菜单",
  "type": 1,
  "parentId": 0,
  "path": "/updated",
  "component": "UpdatedComponent",
  "icon": "edit",
  "sort": 2,
  "status": 1
}
```

**响应示例:**
```json
{
  "code": 200,
  "msg": "更新菜单成功",
  "data": null
}
```

---

### 7. 删除菜单

**请求URL:** `/api/menu/{id}`

**请求方式:** `DELETE`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 菜单ID |

**响应示例:**
```json
{
  "code": 200,
  "msg": "删除菜单成功",
  "data": null
}
```

---

### 8. 批量删除菜单

**请求URL:** `/api/menu`

**请求方式:** `DELETE`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | Long[] | 是 | 菜单ID数组 |

**请求示例:** `/api/menu?ids=1,2,3`

**响应示例:**
```json
{
  "code": 200,
  "msg": "批量删除菜单成功",
  "data": null
}
```

---

### 9. 获取当前管理员动态路由菜单

**请求URL:** `/api/menu/routes`

**请求方式:** `GET`

**请求头:** 需要携带token

**响应示例:**
```json
{
  "code": 200,
  "msg": "获取动态路由菜单成功",
  "data": [
    {
      "path": "/system",
      "name": "System",
      "component": "Layout",
      "redirect": "/system/user",
      "meta": {
        "title": "系统管理",
        "icon": "setting",
        "hidden": false
      },
      "children": [
        {
          "path": "user",
          "name": "User",
          "component": "system/user/index",
          "meta": {
            "title": "用户管理",
            "icon": "user",
            "hidden": false
          }
        }
      ]
    }
  ]
}
```

---

## 球场模块 (Court)

### 1. 获取球场列表

**请求URL:** `/api/court/list`

**请求方式:** `GET`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| minLat | BigDecimal | 否 | 最小纬度 |
| maxLat | BigDecimal | 否 | 最大纬度 |
| minLng | BigDecimal | 否 | 最小经度 |
| maxLng | BigDecimal | 否 | 最大经度 |

**请求示例:** `/api/court/list?minLat=39.9&maxLat=40.1&minLng=116.3&maxLng=116.5`

**响应示例:**
```json
{
  "code": 200,
  "msg": "获取球场列表成功",
  "data": [
    {
      "id": 1,
      "name": "朝阳公园篮球场",
      "address": "北京市朝阳区朝阳公园南路1号",
      "latitude": 39.9335,
      "longitude": 116.4729,
      "imageUrls": [
        "https://example.com/court1.jpg",
        "https://example.com/court2.jpg"
      ]
    },
    {
      "id": 2,
      "name": "奥体中心篮球场",
      "address": "北京市朝阳区安定路1号",
      "latitude": 39.9929,
      "longitude": 116.3956,
      "imageUrls": [
        "https://example.com/court3.jpg"
      ]
    }
  ]
}
```

---

## COS对象存储

### 1. 上传文件到腾讯云COS

**请求URL:** `/api/cos/upload`

**请求方式:** `POST`

**Content-Type:** `multipart/form-data`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | MultipartFile | 是 | 上传的文件 |
| dir | String | 否 | 存储目录前缀，如 "court"、"avatar" |

**响应示例:**
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "url": "https://bucket.cos.ap-region.myqcloud.com/court/abc123.jpg",
    "fileName": "photo.jpg"
  }
}
```

---

## TOS对象存储

### 1. 生成TOS临时访问链接

**请求URL:** `/tos/presigned-url`

**请求方式:** `GET`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| objectKey | String | 是 | 对象键（文件路径） |
| expiresSeconds | Long | 否 | 过期时间（秒），默认使用配置值 |

**请求示例:** `/tos/presigned-url?objectKey=court/abc123.jpg&expiresSeconds=3600`

**响应示例:**
```json
{
  "code": 200,
  "msg": "生成TOS临时链接成功",
  "data": {
    "url": "https://bucket.tos-region.volces.com/court/abc123.jpg?Expires=1234567890&Signature=xxx",
    "objectKey": "court/abc123.jpg"
  }
}
```

---

### 2. 批量生成TOS临时访问链接

**请求URL:** `/tos/presigned-urls/batch`

**请求方式:** `POST`

**请求参数:**
```json
[
  "court/abc123.jpg",
  "court/def456.jpg",
  "avatar/user1.jpg"
]
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| objectKeys | String[] | 是 | 对象键数组 |
| expiresSeconds | Long | 否 | 过期时间（秒） |

**请求示例:** `/tos/presigned-urls/batch?expiresSeconds=3600`

**响应示例:**
```json
{
  "code": 200,
  "msg": "生成TOS临时链接成功",
  "data": {
    "urls": {
      "court/abc123.jpg": "https://bucket.tos-region.volces.com/court/abc123.jpg?Expires=xxx",
      "court/def456.jpg": "https://bucket.tos-region.volces.com/court/def456.jpg?Expires=xxx",
      "avatar/user1.jpg": "https://bucket.tos-region.volces.com/avatar/user1.jpg?Expires=xxx"
    },
    "count": 3
  }
}
```

---

## 附录

### HTTP状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或token过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 业务状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 0 | 操作失败 |

### 客户端类型枚举

| 类型 | 值 | 说明 |
|------|------|------|
| MINI_PROGRAM | mini-program | 用户小程序端 |
| COLLECTOR_APP | collector-app | 员工信息采集APP端 |
| ADMIN_SYSTEM | admin-system | 后台管理系统端 |

---

**文档版本:** v1.0.0  
**更新日期:** 2024-01-01  
**维护人员:** Discover Basketball 开发团队
