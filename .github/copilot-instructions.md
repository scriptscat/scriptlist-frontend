# 脚本猫脚本站

这是一个油猴用户脚本管理平台，旨在提供一个友好的用户界面来管理和分享用户脚本。

## 技术架构

本项目使用next.js作为SSR框架与BFF层，使用Tailwind CSS和Ant Design作为UI框架，使用TypeScript作为主要编程语言。后端使用Golang开发，储存在另外的仓库中。

## 目录结构

```plaintext
src/
├── app/                     # Next.js应用目录
├── components/              # 组件目录
├── lib/                     # 库目录
├── api/services/            # API目录
├── types/                   # 类型定义目录

```

## 国际化

主要使用语言为zh-CN，使用`next-i18next`进行国际化处理。语言文件存放在`public/locales/`目录下，只需要设置`public/locales/zh-CN/translations.json`文件即可，其它语言文件另外设置。

# 主题

本项目支持深色模式和浅色模式，可以通过 `useTheme` hook进行切换和获取。

## API定义

API定义在`src/lib/api/services/`目录下，使用TypeScript定义请求和响应类型。API客户端使用`apiClient`进行请求。前端数据获取使用`swr`获取数据，hook放在`api/hooks`目录下。

### API定义示例

```ts
export class ScriptService {
  private readonly basePath = '/scripts';
  
  async search(params: ScriptSearchRequest = {}) {
    const requestParams = { page: 1, size: 20, ...params };
    // 自动处理服务器端cookie，客户端请求时回退到常规请求
    return apiClient.getWithCookie<ListData<ScriptListItem>>(
      this.basePath, requestParams
    );
  }
}

// 自定义Hook示例
export function useInviteList(
  id: number,
  page: number = 1,
  groupID?: number,
  sort?: { field: string; order: string }
) {
  const key = ['invite-list', id, page, groupID, sort];
  
  return useSWR<ListData<InviteListItem>, APIError>(
    key,
    () => scriptService.getInviteList(id, page, groupID, sort),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
}


```

