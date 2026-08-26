# Recall AI · 智能错题本

> "3 分钟录入，AI 陪你练到真会为止"

面向备考群体的 AI 智能错题本工具，通过 OCR 识别、AI 智能分析、同类型变体题推送与 AI 对话助手，帮助用户高效管理错题，实现「整理 → 分析 → 练习 → 验收」的完整学习闭环。

---

## ✨ 核心特性

| 模块 | 能力 |
| --- | --- |
| 📷 拍照录题 | OCR 自动识别题目，3 分钟完成录入 |
| 🤖 AI 智能分析 | 自动解析知识点、难度、解题思路 |
| 🔄 变体题推送 | 根据错题生成同类型变体，举一反三 |
| 💬 AI 对话答疑 | 接入 DeepSeek，支持 LaTeX 数学公式渲染 |
| 📊 数据看板 | 掌握度、薄弱知识点、学习趋势可视化（每 15s 自动刷新） |
| 🎯 考前冲刺清单 | 从错题知识点自动提炼必备清单 + 触类旁通推荐 |
| 🧮 登录验证 | 登录页计算验证码，防止机器刷号 |
| ✅ 复习验收 | 定期复习 + 自动作答评估，闭环检验 |
| 📱 响应式设计 | PC / 平板 / 手机三端自适应 |

---

## 🛠 技术栈

### 前端（`web/`）
- **React 18** + **TypeScript**
- **Vite 5** 构建工具
- **Tailwind CSS 3** 样式方案
- **Zustand 4** 状态管理
- **React Router 6** 路由
- **Axios** HTTP 请求
- **ECharts** 数据可视化
- **KaTeX** 数学公式渲染

### 后端（`api/`）
- **Node.js** + **Express**
- **JWT** 用户认证
- **bcryptjs** 密码加密
- **multer** 文件上传
- **内存数据存储**（模拟 PostgreSQL，可平滑迁移至真实数据库）
- **DeepSeek / 火山引擎** 大模型答疑（OpenAI 兼容接口）

---

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18
- npm ≥ 9

### 1. 克隆并安装

```bash
git clone https://github.com/flower1104/recall-ai.git
cd recall-ai
npm run install:all   # 同时安装根目录、web、api 依赖
```

### 2. 配置环境变量

```bash
cp .env.example api/.env
```

编辑 `api/.env`，填入大模型配置（详见 `.env.example` 注释）：

```env
PORT=3001
JWT_SECRET=your-jwt-secret

# 大模型 API（支持 DeepSeek 官方 / 火山引擎 / 阿里云等 OpenAI 兼容接口）
LLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
LLM_API_KEY=ark-xxxxxxxxxxxx
LLM_MODEL=deepseek-v4-flash-ga-260731

# 前端域名（用于 CORS，本地开发可不填）
CORS_ORIGIN=https://your-frontend-domain.com
```

> ⚠️ `.env` 已在 `.gitignore` 中，不会提交到仓库，请勿泄露 API Key。

### 3. 启动开发服务

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:api   # 后端 http://localhost:3001
npm run dev:web   # 前端 http://localhost:5173
```

### 4. 测试账号

| 用户名 | 密码 |
| --- | --- |
| `demo` | `123456` |

---

## 📁 项目结构

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
│   │   │   └── chat/       # AI 对话组件
│   │   ├── pages/          # 页面
│   │   ├── store/          # Zustand 状态管理
│   │   ├── utils/          # 工具函数（API 封装、LaTeX 处理）
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── types/          # TypeScript 类型定义
│   │   └── styles/         # 全局样式
│   ├── tailwind.config.js  # Tailwind 配置（含设计 Token）
│   └── vite.config.ts      # Vite 配置
├── api/                    # 后端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # 中间件（认证、错误处理）
│   │   ├── models/         # 数据模型
│   │   └── utils/          # 工具函数
│   └── .env                # 环境变量（不提交）
├── docs/                   # 文档
├── docker-compose.yml      # Docker 编排
├── Dockerfile              # 云端部署配置（Hugging Face Spaces）
└── .env.example            # 环境变量模板
```

---

## 🔌 API 接口

**Base URL**: `/api/v1`

| 方法 | 路径 | 描述 |
| --- | --- | --- |
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
| POST | /questions/ocr | OCR 识别 |
| GET | /qa/sessions | 获取对话列表 |
| POST | /qa/sessions | 创建对话 |
| DELETE | /qa/sessions/:id | 删除对话 |
| GET | /qa/sessions/:id/messages | 获取消息历史 |
| POST | /qa/stream | SSE 流式问答 |
| POST | /review/start | 开始复习 |
| POST | /review/submit | 提交作答 |
| GET | /analytics/overview | 数据总览 |
| GET | /analytics/trend | 趋势数据 |
| GET | /analytics/weak-points | 薄弱知识点 |
| GET | /analytics/checklist | 考前冲刺清单（知识点聚合 + 触类旁通） |

> 健康检查：`GET /api/v1/health`

---

## 🐳 Docker 部署（本地完整环境）

```bash
docker-compose up -d
```

| 服务 | 端口 |
| --- | --- |
| Nginx | 80 |
| API | 3001 |
| Redis | 6379 |

---

## ☁️ 云端部署（免费上线）

推荐 **Vercel（前端） + Render（后端）** 全免费组合，GitHub 推送即自动更新：

- **后端** → [Render](https://render.com)（免费 Node.js 服务，Root Directory: `api`）
- **前端** → [Vercel](https://vercel.com)（免费静态托管，Root Directory: `web`）

📋 **完整保姆级步骤见 [DEPLOY.md](./DEPLOY.md)**（含环境变量配置表、常见问题排查、验收清单）

部署时在平台环境变量中配置：

| 变量 | 平台 | 说明 |
| --- | --- | --- |
| `JWT_SECRET` | Render | 登录令牌密钥（强随机字符串） |
| `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` | Render | 大模型配置（AI 答疑） |
| `CORS_ORIGIN` | Render | 前端线上地址（逗号分隔可多个） |
| `VITE_API_BASE_URL` | Vercel | 后端线上地址（`https://xxx.onrender.com/api/v1`） |

> 项目也包含 `Dockerfile`，支持部署到任何容器托管平台（如 Hugging Face Spaces，7860 端口）。

---

## 🎨 设计规范

### 色彩系统

| 类别 | 名称 | 色值 |
| --- | --- | --- |
| 主色 | 莫兰迪绿 | `#7BA889` |
| 主色 | 浅绿 | `#A8C5A0` |
| 背景 | 页面背景 | `#F7F6F2` |
| 背景 | 卡片背景 | `#FFFFFF` |
| 边框 | 卡片描边 | `#EDEAE2` |
| 文字 | 主要文字 | `#3C3C3C` |
| 文字 | 次要文字 | `#9B9B9B` |
| 语义 | 成功 | `#5B8C5A` |
| 语义 | 警告 | `#B08B5E` |
| 语义 | 错误 | `#B47A7A` |

### 响应式断点

| 设备 | 断点 | 布局 |
| --- | --- | --- |
| PC 端 | ≥ 1200px | 完整双栏 / 单栏 |
| 平板端 | 768–1199px | 双栏缩减 / 折叠 |
| 移动端 | < 768px | 单栏 + 汉堡菜单 |

---

## 📄 License

[MIT](LICENSE) © 2026 flower1104
