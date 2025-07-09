# 使用 Node.js 20 Alpine 作为基础镜像
ARG BASEIMAGE=node:20-alpine

# 依赖安装阶段
FROM ${BASEIMAGE} as deps

# 启用 corepack 来使用 pnpm
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml 文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM deps as builder

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产依赖阶段
FROM ${BASEIMAGE} as prod-deps

# 启用 corepack 来使用 pnpm
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml 文件
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 运行时阶段
FROM ${BASEIMAGE} as runtime

# 启用 corepack 来使用 pnpm
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 从生产依赖阶段复制 node_modules
COPY --from=prod-deps /app ./node_modules

# 从构建阶段复制构建产物
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# 复制必要文件
COPY package.json remix.config.cjs ./

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]