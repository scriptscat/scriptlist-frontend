# 脚本猫脚本站

一个类似 GreasyFork 的用户脚本分享平台，支持脚本发布、浏览、下载和管理

## 功能特性

- 脚本发布与管理：支持脚本上传、编辑、版本管理
- 在线编辑器：Monaco Editor 支持语法高亮
- 多语言支持：国际化界面
- 响应式设计：支持桌面端和移动端

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **UI**: Ant Design + Tailwind CSS
- **状态管理**: SWR + React Context
- **国际化**: next-intl
- **后端**: [Golang 脚本猫后端](https://github.com/scriptscat/scriptlist)

## 开发环境

### 环境要求

- Node.js 18+
- pnpm 8+

### 快速开始

```bash
# 克隆项目
git clone https://github.com/scriptscat/scriptlist-frontend.git
cd scriptlist-frontend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

### 环境变量

```env
# API 调用地址
NEXT_PUBLIC_APP_API_URL = 'http://localhost:3000/api/v2'
# API 代理地址
APP_API_PROXY = 'https://scriptcat.org/api/v2'
# OAuth 配置
NEXT_PUBLIC_APP_BBS_OAUTH_CLIENT = 'dC37Fgznr5aAFZU'
```

### 构建部署

```bash
pnpm build
pnpm start
```

