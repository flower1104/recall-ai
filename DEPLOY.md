# 🚀 免费部署上线指南（recall-ai 错题本）

> 目标：**全程 $0、无需绑卡**，前后端全部上线，任何人都能通过网址访问。
> 方案：**前端 Vercel + 后端 Hugging Face Spaces**，推 GitHub 自动更新。

## 部署架构

```
用户浏览器 ──→ Vercel（前端页面，免费静态托管）
                  │
                  └──→ Hugging Face Spaces（后端 API + AI 答疑，免费 Docker 容器）
                           │
                           └──→ 火山引擎 DeepSeek 大模型
```

## 方案怎么选（后端）

| 方案 | 费用 | 要不要绑卡 | 配置 | 备注 |
| --- | --- | --- | --- | --- |
| **Hugging Face Spaces** ⭐推荐 | 免费 | ❌ 不要 | 2 vCPU / 16GB 内存 | 48 小时无访问才休眠 |
| Render | 免费 | ⚠️ 需绑 Visa/Mastercard | 0.1 CPU / 512MB | 15 分钟无访问休眠 |

> 没有国际信用卡就直接用 HF Spaces，全流程不要卡。

---

## 第一步：后端 → Hugging Face Spaces（约 10 分钟）

### 1.1 注册 HF 账号

1. 打开 [huggingface.co](https://huggingface.co) → 右上角 **Sign Up**
2. 用邮箱注册即可（也支持 GitHub / Google 一键登录），**全程不需要任何银行卡**

### 1.2 创建 Space（后端容器）

1. 登录后点右上角头像 → **New Space**
2. 按下表填写：

| 配置项 | 填写值 |
| --- | --- |
| Space name | `recall-ai-api` |
| License | 随意（如 MIT） |
| **Select SDK** | **Docker** → **Blank** 模板 |
| Space Hardware | **CPU basic · 2 vCPU · 16GB RAM · FREE** |
| Visibility | **Public**（免费版仅支持公开） |

3. 点 **Create Space**，得到一个空的白板 Space

### 1.3 配置环境变量（密钥只存这里，不进代码）

进入 Space 页面 → **Settings** → 翻到 **Variables and secrets** → 逐条 **New secret** 添加：

| Key | Value |
| --- | --- |
| `JWT_SECRET` | 自编 32 位以上随机字符串（如 `Rx9kP2mQvT7wYb3nZs6jFe4hUg8cLa5d`） |
| `LLM_BASE_URL` | 抄本地 `api/.env` 同名值（`https://ark.cn-beijing.volces.com/api/v3`） |
| `LLM_API_KEY` | 抄本地 `api/.env` 同名值（你的火山引擎密钥） |
| `LLM_MODEL` | 抄本地 `api/.env` 同名值 |
| `CORS_ORIGIN` | 先填 `http://localhost:5173`（前端上线后回来改成 Vercel 地址） |

### 1.4 推送代码到 Space

仓库已内置一键同步脚本（Windows PowerShell，在 `recall-ai/` 目录执行）：

```powershell
.\scripts\sync-to-hf.ps1 -HfUser <你的HF用户名> -HfToken <你的HF访问令牌>
```

- 脚本会自动：组装 `api/` 源码白名单（绝不包含 `.env`/日志）→ 推送到 Space → 清理本地痕迹
- **HF 访问令牌获取**：HF 头像 → **Settings** → **Access Tokens** → **Create new token** → 类型选 **Write** → 复制保存（形如 `hf_xxxxxxxxxxxx`）
- 以后后端代码更新，重跑一遍此脚本即可同步

> 也可以让 AI 助手替你执行：把 HF 用户名和令牌发给它即可。

### 1.5 等待构建 + 验证

1. 推送后 Space 自动构建（首次约 2~4 分钟），点 **Logs** 能看到构建进度
2. 构建完成后浏览器访问：

```
https://<你的HF用户名>-recall-ai-api.hf.space/api/v1/health
```

看到 `{"status":"healthy",...}` 即成功 ✅（注意：HF 域名一律小写，用户名含大写也转小写）

---

## 第二步：前端 → Vercel（约 5 分钟）

### 2.1 注册并导入仓库

1. 打开 [vercel.com](https://vercel.com) → **Sign Up** → 选 **Continue with GitHub**（用 flower1104 账号）
2. 登录后 **Add New** → **Project** → 找到 `flower1104/recall-ai` → **Import**
3. 按下表配置：

| 配置项 | 填写值 |
| --- | --- |
| Framework Preset | **Vite**（一般自动识别） |
| **Root Directory** | **`web`** ⚠️ 千万别漏 |
| Build Command | `npm run build`（默认即可） |
| Output Directory | `dist`（默认即可） |

### 2.2 配置前端环境变量

在 **Environment Variables** 处添加（**先做第一步再做这里，地址才存在**）：

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://<你的HF用户名>-recall-ai-api.hf.space/api/v1` |

4. 点 **Deploy**，等 1~2 分钟得到线上地址（形如 `https://recall-ai.vercel.app`）

---

## 第三步：打通 CORS（最后一环）

前端地址拿到后，回到 **HF Space → Settings → Variables and secrets**：

1. 把 `CORS_ORIGIN` 的值改成你的 Vercel 地址（可逗号分隔保留本地调试地址）：

```
https://recall-ai.vercel.app,http://localhost:5173
```

2. 改完后 **Settings → Factory reboot**（或重跑同步脚本触发重启）使其生效

### ✅ 端到端验收清单

- [ ] 访问 Vercel 前端地址，页面正常打开
- [ ] 用 `demo / 123456` 登录成功
- [ ] 错题列表正常加载
- [ ] AI 答疑能出结果、数学公式（LaTeX）正常渲染
- [ ] 手机流量打开同样正常

---

## 环境变量速查表

| 变量 | 配在哪 | 说明 |
| --- | --- | --- |
| `JWT_SECRET` | HF Space secret | 登录令牌密钥 |
| `LLM_BASE_URL` | HF Space secret | 火山引擎接口地址 |
| `LLM_API_KEY` | HF Space secret | 火山引擎密钥 |
| `LLM_MODEL` | HF Space secret | 模型名 |
| `CORS_ORIGIN` | HF Space secret | 前端线上地址（逗号分隔可多个） |
| `VITE_API_BASE_URL` | Vercel | 后端 HF Space 地址 + `/api/v1` |

## 常见问题排查

| 现象 | 原因与解决 |
| --- | --- |
| Space 构建失败 | 点 **Logs** 看报错；常见为 Dockerfile 问题或 `npm ci` 失败 |
| 访问 `hf.space` 地址 502/503 | Space 休眠唤醒中，等 1~2 分钟刷新；或到 Space 页面点 Settings → Factory reboot |
| 前端请求报 CORS 错误 | `CORS_ORIGIN` 没填对/没包含前端域名；改完要重启（Factory reboot） |
| AI 答疑报 401/500 | `LLM_API_KEY` 或 `LLM_MODEL` 抄错，对照本地 `api/.env` |
| 登录后刷新又变未登录 | 正常——内存数据库，Space 重启后账号重置（demo 账号自动恢复）；持久化见下 |
| 国内打开很慢 | `vercel.app` / `hf.space` 国内直连不稳定，挂代理流畅；正式推广可后续换国内 CDN |

## 免费版限制（提前知道，不慌）

- **HF Spaces 免费版**：48 小时无访问会休眠（任意访问自动唤醒，1~2 分钟）；容器重启后内存数据库清零（demo 账号自动播种恢复）；代码公开（仓库本来就是 public，无影响）
- **Vercel 免费版**：100GB 流量/月，个人项目完全够用
- **后续升级路线**：接入免费 PostgreSQL（如 Neon）做数据持久化 → 告别重启丢数据

---

## 附：Render 备选方案（需绑 Visa/Mastercard）

有国际信用卡也可用 [Render](https://render.com)：New Web Service → 连接 GitHub 仓库 → Root Directory `api` / Build `npm install` / Start `npm start` / Region Singapore / Instance **Free**，环境变量同上表。注意 Render 新注册账号即使选 Free 也可能强制要求绑卡。
