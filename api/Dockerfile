# ===== API Dockerfile =====
# 兼容 Hugging Face Spaces / Render / 任意容器平台
FROM node:20-alpine
WORKDIR /app

# HF Spaces 强制要求以非 root 用户运行容器
RUN adduser -D -u 1000 user
ENV HOME=/home/user

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

USER user
EXPOSE 3001
CMD ["node", "src/index.js"]
