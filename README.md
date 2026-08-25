# Recall AI智能错题本

> "3分钟录入，AI陪你练到真会为止"

面向备考群体的AI智能错题本工具，通过OCR识别、AI智能分析、同类型变体题推送和AI对话助手，帮助用户高效管理错题，实现"整理→分析→练习→验收"的完整学习闭环。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 5 (构建工具)
- Tailwind CSS 3 (样式方案)
- Zustand 4 (状态管理)
- React Router 6 (路由)
- Axios (HTTP请求)
- ECharts (数据可视化)

### 后端
- Node.js + Express (API服务)
- JWT (用户认证)
- bcryptjs (密码加密)
- multer (文件上传)
- 内存数据存储 (模拟PostgreSQL，可平滑迁移)

## 快速开始

### 1. 安装依赖
```bash
cd recall-ai
npm run install:all
```

### 2. 启动开发服务
```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:api   # 后端 http://localhost:3001
npm run dev:web   # 前端 http://localhost:5173
```

### 3. 测试账号
- 用户名：`demo`
- 密码：`123456`

## 项目结构
```
recall-ai/
├── web/                    # 前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── layout/     # 布局组件
│   │   │   ├── common/     # 通用组件
│   │   │   ├── notebook/   # 错题本组件
│   │   │   ├── question/   # 错题组件
│   │   │   ├── review/     # 复习组件
│   │   │   ├── dashboard/  # 看板组件
│   │   │   └── chat/       # 对话组件
│   │   ├── pages/          # 页面
│   │   ├── store/          # Zustand状态管理
│   │   ├── utils/          # 工具函数(API、Tokens)
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── types/          # TypeScript类型定义
│   │   └── styles/         # 全局样式
│   ├── tailwind.config.js  # Tailwind配置(含设计Token)
│   └── vite.config.ts      # Vite配置
├── api/                    # 后端
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── middleware/     # 中间件(认证、错误处理)
│   │   ├── models/         # 数据模型
│   │   └── utils/          # 工具函数
│   └── .env                # 环境变量
├── docs/                   # 文档
│   └── 测试用例文档.md
├── docker-compose.yml      # Docker编排
└── .env.example            # 环境变量模板
```

## API接口

Base URL: `/api/v1`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /auth/register | 用户注册 |
| POST | /auth/login | 用户登录 |
| GET | /auth/me | 获取当前用户 |
| GET | /notebooks | 获取错题本列表 |
| POST | /notebooks | 创建错题本 |
| PUT | /notebooks/:id | 更新错题本 |
| DELETE | /notebooks/:id | 删除错题本 |
| GET | /notebooks/:id/questions | 获取错题列表 |
| POST | /questions | 创建错题 |
| PUT | /questions/:id | 更新错题 |
| DELETE | /questions/:id | 删除错题 |
| POST | /questions/ocr | OCR识别 |
| GET | /qa/sessions | 获取对话列表 |
| POST | /qa/sessions | 创建对话 |
| DELETE | /qa/sessions/:id | 删除对话 |
| GET | /qa/sessions/:id/messages | 获取消息历史 |
| POST | /qa/stream | SSE流式问答 |
| POST | /review/start | 开始复习 |
| POST | /review/submit | 提交作答 |
| GET | /analytics/overview | 数据总览 |
| GET | /analytics/trend | 趋势数据 |
| GET | /analytics/weak-points | 薄弱知识点 |

## 设计规范

### 色彩系统
| 类别 | 名称 | 色值 |
|------|------|------|
| 主色 | Primary | #007AFF |
| 背景 | 页面背景 | #F5F5F7 |
| 背景 | 卡片背景 | #FFFFFF |
| 文字 | 主要文字 | #1D1D1F |
| 文字 | 次要文字 | #6E6E73 |
| 语义 | 成功 | #34C759 |
| 语义 | 警告 | #FF9500 |
| 语义 | 错误 | #FF3B30 |

### 响应式断点
| 设备 | 断点 | 布局 |
|------|------|------|
| PC端 | ≥1200px | 完整双栏/单栏 |
| 平板端 | 768-1199px | 双栏缩减/折叠 |
| 移动端 | <768px | 单栏+汉堡菜单 |

## Docker部署
```bash
# 构建并启动
docker-compose up -d

# 服务端口
# Nginx: 80
# API: 3001
# Redis: 6379
```

## License
MIT
