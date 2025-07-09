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

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括开发依赖，构建时需要）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 运行时阶段
FROM base

# 设置工作目录
WORKDIR /app

# 复制必要文件
COPY . .

# 从构建阶段复制 node_modules 和构建产物
COPY --from=prod /app/node_modules ./node_modules
COPY --from=prod /app/build ./build
COPY --from=prod /app/public ./public

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]