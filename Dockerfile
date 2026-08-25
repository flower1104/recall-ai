# Hugging Face Spaces Docker 部署配置（后端 API）
FROM node:20-slim

# HF Spaces 要求：以非 root 用户（UID 1000）运行
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# 先复制 package 文件，利用 Docker 缓存加速构建
COPY --chown=user api/package*.json ./
RUN npm install --omit=dev

# 复制后端代码
COPY --chown=user api/ ./

# HF Spaces 固定使用 7860 端口
ENV PORT=7860
EXPOSE 7860

CMD ["npm", "start"]
