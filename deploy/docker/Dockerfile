# 使用 Node.js 20 Alpine 作为基础镜像
ARG BASEIMAGE=node:20-alpine3.16
FROM ${BASEIMAGE} AS base

# 设置 pnpm 环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 启用 corepack 来使用 pnpm
RUN corepack enable

# 构建阶段
FROM base AS prod

# 设置工作目录
WORKDIR /app

# 只复制 pnpm-lock.yaml 用于 fetch
COPY pnpm-lock.yaml ./

# 使用 pnpm fetch 预先获取依赖
RUN pnpm fetch

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 运行时阶段
FROM base

# 设置工作目录
WORKDIR /app

# 从构建阶段复制 node_modules 和构建产物
COPY --from=prod /app/node_modules ./node_modules
COPY --from=prod /app/build ./build
COPY --from=prod /app/public ./public

# 复制必要文件
COPY package.json remix.config.cjs ./

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]