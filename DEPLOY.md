# 🚀 免费部署上线指南（recall-ai 错题本）

> 目标：**全程 $0、无需绑卡**，前后端全部上线，任何人都能通过网址访问。
> 方案：**前端 Vercel + 后端 Zeabur**，GitHub 推送即自动更新。

## 部署架构

```
用户浏览器 ──→ Vercel（前端页面，免费静态托管）
                  │
                  └──→ Zeabur（后端 API + AI 答疑，免费 Docker 容器）
                           │
                           └──→ 火山引擎 DeepSeek 大模型
```

## 为什么选 Zeabur 做后端

| 平台 | 要不要绑卡 | 国内访问 | 支持 Docker | 免费版说明 |
| --- | --- | --- | --- | --- |
| **Zeabur** ⭐ | ❌ 不要 | ✅ 快 | ✅ 支持 | GitHub 登录即可部署 |
| Hugging Face Spaces | ❌ 不要 | ⚠️ 主站被墙 | ❌ **免费 Docker 已取消** | 仅 Static 免费 |
| Render | ⚠️ 要绑卡 | ✅ 新加坡快 | ✅ 支持 | 新账号强制绑卡 |

> 截至 2026 年 8 月，Hugging Face Spaces 的免费 Docker 空间已取消（仅 Static 免费）。本指南已切换为 **Zeabur**。

---

## 第一步：后端 → Zeabur（约 8 分钟）

### 1.1 注册 / 登录

1. 打开 [zeabur.com](https://zeabur.com)
2. 点 **Sign Up** → **Continue with GitHub**（用你 flower1104 账号）
3. **不需要任何银行卡**

### 1.2 创建项目并导入仓库

1. 登录后点 **Deploy New Project**
2. 选择 **Import from GitHub** → 找到 `flower1104/recall-ai` → **Import**
3. 项目名可以填 `recall-ai`

### 1.3 创建后端服务

Zeabur 会自动识别仓库根目录的 `zbpack.json`（已配置好指向 `api/Dockerfile`），然后按 Docker 部署：

1. 在项目中点 **Add Service** → **Deploy from source** → 仓库 `recall-ai`
2. 服务名填 `recall-ai-api`
3. **Root Directory**：填 **`api`**（如果不填，Zeabur 也会通过 `zbpack.json` 找到 Dockerfile）
4. 点 **Deploy**

> 仓库里已经放了 `zbpack.json`：`{ "dockerfile": { "path": "api/Dockerfile" } }`，所以 Zeabur 能自动定位后端 Dockerfile。

### 1.4 配置环境变量

等服务卡片出现（还没部署完也行），点服务名进入 → **Variables** → 逐条添加：

| Key | Value |
| --- | --- |
| `JWT_SECRET` | 自编 32 位以上随机字符串（如 `Rx9kP2mQvT7wYb3nZs6jFe4hUg8cLa5d`） |
| `LLM_BASE_URL` | 抄本地 `api/.env` 同名值（`https://ark.cn-beijing.volces.com/api/v3`） |
| `LLM_API_KEY` | 抄本地 `api/.env` 同名值（你的火山引擎密钥） |
| `LLM_MODEL` | 抄本地 `api/.env` 同名值 |
| `CORS_ORIGIN` | 先填 `http://localhost:5173`（前端上线后回来改成 Vercel 地址） |

> 和 Render 一样，密钥只存在 Zeabur，不会进代码仓库。

### 1.5 等待构建 + 验证

1. 首次构建约 2~5 分钟，点服务名 → **Logs** 看进度
2. 构建成功后，Zeabur 会给一个域名，形如 `https://recall-ai-api-<随机串>.zeabur.app`
3. 浏览器访问：

```
https://<你的域名>/api/v1/health
```

看到 `{"status":"healthy",...}` 即成功 ✅

---

## 第二步：前端 → Vercel（约 5 分钟）

### 2.1 导入仓库

1. 打开 [vercel.com](https://vercel.com) → 用 GitHub 登录
2. **Add New** → **Project** → 导入 `flower1104/recall-ai`

### 2.2 配置

| 配置项 | 填写值 |
| --- | --- |
| Framework Preset | **Vite** |
| **Root Directory** | **`web`** ⚠️ 必填 |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 2.3 环境变量

添加：

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://<你的 Zeabur 域名>/api/v1` |

点 **Deploy**。

---

## 第三步：打通 CORS

前端地址拿到后（如 `https://recall-ai.vercel.app`），回到 Zeabur 后端服务的 **Variables**：

1. 修改 `CORS_ORIGIN` 为：

```
https://recall-ai.vercel.app,http://localhost:5173
```

2. **Redeploy** 或 **Restart** 服务使变量生效

### ✅ 端到端验收清单

- [ ] 访问 Vercel 前端地址，页面正常打开
- [ ] 用 `demo / 123456` 登录成功
- [ ] 错题列表正常加载
- [ ] AI 答疑能出结果、LaTeX 公式正常渲染
- [ ] 手机流量打开同样正常

---

## 环境变量速查表

| 变量 | 配在哪 | 说明 |
| --- | --- | --- |
| `JWT_SECRET` | Zeabur 服务 Variables | 登录令牌密钥 |
| `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` | Zeabur 服务 Variables | 火山引擎大模型配置 |
| `CORS_ORIGIN` | Zeabur 服务 Variables | 前端线上地址（逗号分隔可多个） |
| `VITE_API_BASE_URL` | Vercel | 后端 Zeabur 地址 + `/api/v1` |

## 常见问题排查

| 现象 | 原因与解决 |
| --- | --- |
| Zeabur 构建失败 | 点 **Logs** 看报错；常见为 Dockerfile 或 `zbpack.json` 路径问题 |
| 访问域名 502/503 | 免费版无流量会休眠，等几秒刷新；或手动 Restart 服务 |
| 前端请求报 CORS 错误 | `CORS_ORIGIN` 没填对，改完要 Redeploy |
| AI 答疑报 401/500 | `LLM_API_KEY` 或 `LLM_MODEL` 抄错，对照本地 `api/.env` |
| 登录后刷新又变未登录 | 内存数据库，服务重启后重置（demo 账号自动恢复） |
| 国内打开 Vercel 慢 | `vercel.app` 国内直连时好时坏；可后续绑定自定义域名加速 |

## 免费版限制（提前知道，不慌）

- **Zeabur Free Plan**：无需信用卡；无流量一段时间后会休眠（下次访问自动唤醒）；资源有限但小项目够用；无 SLA
- **Vercel Free**：100GB 流量/月，个人项目够用
- **后续升级路线**：见下节「升级路径」

---

## 升级路径：数据持久化 / 0 元云服务器

当前后端是**内存数据库**（`api/src/models/db.js`），服务重启数据即清零（demo 账号由种子数据自动恢复）。产品上线后想让用户数据长期保存，按成本从低到高两条路：

### 路线 A：免费云数据库（改动小）
接入 Neon / Supabase 的免费档 PostgreSQL，把内存存储改造为 Prisma + PG。前后端平台都不用换。

### 路线 B：0 元开云服务器（在校大学生权益）
通过**阿里云「云工开物」高校计划**完成学生认证（学信网学籍核验，无需银行卡），可领 **300 元无门槛代金券**（活动期至 2026-11-10，以官网为准），足够 0 元开一台 2核2G ECS 使用数月：

1. 访问 [university.aliyun.com](https://university.aliyun.com) → 完成学生认证 → 领取代金券
2. 下单 2核2G ECS（代金券抵扣，0 元支付）
3. SSH 登录后安装 Docker，一键跑起后端（项目自带 `api/Dockerfile`）
4. 用 `docker --restart=always` 保证进程常驻，不再因平台休眠丢数据

> ⚠️ 两个坑提前知道：
> 1. **混合内容拦截**：Vercel 前端是 https，直连 `http://IP:3001` 会被浏览器拦截。要么把前端也搬到同一台服务器（nginx 同域反代 `/api`），要么完成域名备案后上 https 证书
> 2. **ICP 备案**：国内服务器绑域名访问 80/443 必须备案（免费，约 1~2 周）；仅用 `IP:3001` 访问则无需备案
>
> 低价替代：腾讯云新人轻量服务器约 38 元/年起；华为云/京东云也常有学生/新人试用。国际厂商（Oracle/AWS/GCP/Azure）免费档均需绑国际信用卡验证，无卡用户不适用。

---

## 附：其他方案为什么没选

- **Hugging Face Spaces**：2026 年 8 月起免费 Docker Space 已取消，仅 Static 免费
- **Render**：免费实例实际仍要绑 Visa/Mastercard 验证身份
