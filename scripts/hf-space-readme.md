---
title: Recall AI API
emoji: 📝
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 3001
pinned: false
---

# Recall AI API — 错题本后端服务

Express 后端（AI 答疑 / 错题管理），源码同步自 GitHub：
https://github.com/flower1104/recall-ai

## 环境变量（Space Settings → Variables and secrets 配置）

| Key | 说明 |
| --- | --- |
| `JWT_SECRET` | 登录令牌密钥（强随机字符串） |
| `LLM_BASE_URL` | 火山引擎 Ark 接口地址 |
| `LLM_API_KEY` | 火山引擎 API Key（务必用 Secret 存储） |
| `LLM_MODEL` | 模型名 |
| `CORS_ORIGIN` | 允许的前端地址，逗号分隔可配多个 |

健康检查：`GET /api/v1/health`
