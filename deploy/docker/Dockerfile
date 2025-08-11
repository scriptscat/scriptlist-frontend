# 使用 Node.js 20 Alpine 作为基础镜像
ARG BASEIMAGE=node:20-alpine3.16
ARG APP_API_PROXY=https://scriptcato.org/api/v2

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

ENV APP_API_PROXY=${APP_API_PROXY}

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

# 复制package.json（为了运行时信息）
COPY package.json ./

# 对于 standalone 输出模式，复制 standalone 文件
COPY --from=prod /app/.next/standalone ./
COPY --from=prod /app/.next/static ./.next/static
COPY --from=prod /app/public ./public

# 暴露端口
EXPOSE 3000

# 启动应用（standalone 模式使用 server.js）
CMD ["node", "server.js"]