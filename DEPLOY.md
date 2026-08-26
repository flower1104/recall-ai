# 🚀 Recall AI 免费部署上线指南

> 本指南带你把 Recall AI（错题本）免费部署到公网，让任何人都能通过链接访问。
> 全程零费用，只需一个 GitHub 账号（你已有：flower1104）。

---

## 📐 部署架构

| 部分 | 托管平台 | 免费额度 | 说明 |
| --- | --- | --- | --- |
| 前端（web/） | **Vercel** | 个人版完全免费 | 静态页面 + 全球 CDN，自动构建 Vite 项目 |
| 后端（api/） | **Render** | 750 小时/月 | 长驻 Node.js 服务，支持 SSE 流式 AI 答疑 |

```
用户浏览器 ──→ Vercel（前端页面）
                 │
                 └──→ Render（后端 API + AI 答疑）
                          │
                          └──→ 火山引擎/DeepSeek 大模型
```

**为什么选这两家？**
- 前端是静态文件，Vercel 是全球最流行的免费前端托管（GitHub 仓库一键导入）
- 后端是 Express 长驻服务 + SSE 流式响应，需要真正的服务器进程，Render 免费版正好支持
- 两者都能用 GitHub 账号直接登录，**以后每次 `git push` 代码自动更新线上版本**

---

## 第一步：部署后端到 Render（约 5 分钟）

### 1.1 注册 Render
1. 打开 https://render.com
2. 点右上角 **Get Started** 或 **Sign Up**
3. 选择 **GitHub** 图标登录（推荐，免去填表）→ 授权 Render 访问你的 GitHub

### 1.2 创建 Web Service
1. 登录后进入 Dashboard，点右上角 **New +** → **Web Service**
2. 首次会要求连接 GitHub 仓库：点 **Connect account** → 勾选 `flower1104/recall-ai` → Install
3. 回到 Render 页面，在仓库列表中找到 **recall-ai**，点 **Connect**

### 1.3 填写配置（⚠️ 逐项对照）

| 配置项 | 填写值 |
| --- | --- |
| Name | `recall-ai-api`（会决定你的域名） |
| Project | 随意（可留空） |
| Language | Node（自动检测） |
| Region | **Singapore**（离中国最近，访问最快） |
| Branch | `master` |
| **Root Directory** | `api` ⚠️ 关键！ |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | **Free** |

### 1.4 添加环境变量
在同一页面往下翻到 **Environment Variables**，逐条 **Add Environment Variable**：

| Key | Value | 说明 |
| --- | --- | --- |
| `JWT_SECRET` | 一串 32 位以上的随机字母数字（如 `Rx9kP2mQvT7wYb3nZs6jFe4hUg8cLa5d`） | 登录令牌签名密钥，别用示例值 |
| `LLM_BASE_URL` | 抄你本地 `recall-ai/api/.env` 里的同名值 | 火山引擎/DeepSeek 接口地址 |
| `LLM_API_KEY` | 抄你本地 `recall-ai/api/.env` 里的同名值 | 大模型密钥（只存在 Render，不会进代码仓库） |
| `LLM_MODEL` | 抄你本地 `recall-ai/api/.env` 里的同名值 | 模型名 |
| `CORS_ORIGIN` | 先填 `http://localhost:5173` | 前端部署后再回来补线上地址 |

> 💡 不知道本地 .env 在哪？用记事本打开 `recall-ai/api/.env`，把三个 `LLM_` 开头的值原样抄进 Render 即可。

### 1.5 启动并验证
1. 点底部 **Create Web Service**（或 Deploy Web Service）
2. 等待 2~3 分钟，日志出现 `[Recall API] Server running on ...` 即成功
3. 浏览器访问：`https://recall-ai-api.onrender.com/api/v1/health`
   看到 `{"code":200,...,"status":"healthy"}` 就说明后端已上线 🎉

---

## 第二步：部署前端到 Vercel（约 3 分钟）

### 2.1 注册 Vercel
1. 打开 https://vercel.com
2. 点 **Sign Up** → 选择 **Continue with GitHub** → 授权登录

### 2.2 导入项目
1. 进入 Dashboard，点 **Add New...** → **Project**
2. 在仓库列表找到 **recall-ai**，点右侧 **Import**
   （如果没有，点 Adjust GitHub App Permissions 重新授权）

### 2.3 填写配置（⚠️ 逐项对照）

| 配置项 | 填写值 |
| --- | --- |
| Project Name | `recall-ai`（可自定义） |
| Framework Preset | Vite（自动检测） |
| **Root Directory** | 点 Edit 改为 `web` ⚠️ 关键！ |
| Build Command | `npm run build`（自动） |
| Output Directory | `dist`（自动） |
| Install Command | `npm install`（自动） |

### 2.4 添加环境变量
展开 **Environment Variables**，添加：

| Name | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://recall-ai-api.onrender.com/api/v1`（换成第一步你的实际域名） |

### 2.5 部署并验证
1. 点 **Deploy**，等待 1~2 分钟出现 🎉 Confetti 动画即成功
2. 得到地址，如：`https://recall-ai.vercel.app`
3. 打开能看到登录页 → 前端上线成功 🎉

---

## 第三步：打通前后端（关键收尾）

前端已经能访问了，但登录会失败——因为后端还不知道前端的线上地址（跨域拦截）：

1. 回到 **Render** → 打开 `recall-ai-api` 服务 → 顶部 **Environment** 标签
2. 找到 `CORS_ORIGIN`，把 Value 改成（⚠️ 用你自己的 Vercel 地址替换）：
   ```
   https://recall-ai.vercel.app,http://localhost:5173
   ```
   > 逗号分隔：第一个是线上前端，第二个保留本地开发能力
3. 点 **Save Changes**，Render 会自动重新部署（约 1~2 分钟）
4. 打开 `https://recall-ai.vercel.app`，用 **demo / 123456** 登录测试
5. 再试试：侧边栏 → AI 答疑 → 问一道数学题 → 检查 AI 是否正常回复

✅ 全部通过 = 部署完成！把链接发给任何人都能用了。

---

## 🔁 以后怎么更新线上版本？

```bash
# 本地改完代码后
git add -A
git commit -m "feat: xxx"
git push origin master
```

推送后 Vercel 和 Render 会**自动重新构建部署**（各需 1~3 分钟），无需任何手动操作。

---

## ⚠️ 免费版限制（必读）

| 限制 | 影响 | 应对 |
| --- | --- | --- |
| Render 免费实例 **15 分钟无访问会休眠** | 下次访问需等待 30~60 秒唤醒 | 分享链接时提醒对方稍等；或每天访问一次保活 |
| 后端是**内存数据库** | 服务重启/重新部署后，用户注册的账号和错题会重置（demo 账号和数据自动恢复） | 后续可接入免费 PostgreSQL（如 Neon）做持久化 |
| 国内直连 vercel.app / onrender.com **速度不稳定** | 部分网络环境访问慢 | 可后续绑定自定义域名优化；校园网/热点一般可访问 |
| Vercel 免费带宽 100GB/月 | 个人项目远用不完 | 无需担心 |

---

## 🩺 常见问题排查

| 症状 | 原因 | 解决 |
| --- | --- | --- |
| 打开网站白屏 | Root Directory 没设对 | Vercel 项目 Settings → Root Directory 改为 `web` 后 Redeploy |
| 登录提示网络错误 | 后端休眠中，或 CORS_ORIGIN 没配 | 等 1 分钟重试；检查 Render 环境变量 CORS_ORIGIN |
| AI 答疑回复很"机械" | LLM_API_KEY 没配置，走了 Mock 降级 | Render → Environment 检查三个 LLM_ 变量 |
| 后端部署失败 | Node 版本/依赖问题 | 看 Render 的 Deploy Logs，把报错发给助手 |
| 401 未授权 | JWT_SECRET 在前后端重启间变更 | 保持 Render 上 JWT_SECRET 固定不变 |

---

## 📌 验收清单

- [ ] `https://recall-ai-api.onrender.com/api/v1/health` 返回 healthy
- [ ] `https://recall-ai.vercel.app` 能打开登录页
- [ ] 计算验证码显示正常、验证通过后可登录
- [ ] demo / 123456 能进入首页
- [ ] 数据看板有图表、15 秒自动刷新正常
- [ ] AI 答疑是真实大模型回复（不是 Mock）
- [ ] 手机浏览器打开同样正常（响应式）
