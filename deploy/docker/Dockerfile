# 使用 Node.js 22 Alpine 作为基础镜像
ARG BASEIMAGE=node:22-alpine

FROM ${BASEIMAGE} AS base

# 设置 pnpm 环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 启用 corepack 来使用 pnpm
RUN corepack enable

# 构建阶段
FROM base AS deps

ARG NPM_REGISTRY=""

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml（仅依赖相关文件）
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括开发依赖，构建时需要）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    if [ -n "$NPM_REGISTRY" ]; then pnpm config set registry "$NPM_REGISTRY"; fi && \
    pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder

ARG NEXT_PUBLIC_APP_URL=https://scriptcat.org
ARG APP_API_PROXY=https://scriptcat.org/api/v2
ARG APP_API_URL=https://scriptcat.org/api/v2

# 设置工作目录
WORKDIR /app

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    APP_API_URL=${APP_API_URL} \
    APP_API_PROXY=${APP_API_PROXY}

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 运行时阶段
FROM base

# 设置工作目录
WORKDIR /app

# 复制package.json（为了运行时信息）
COPY package.json ./

# 对于 standalone 输出模式，复制 standalone 文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 复制启动脚本
COPY deploy/docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# 暴露端口
EXPOSE 3000

# 启动应用（包含预热）
CMD ["./entrypoint.sh"]