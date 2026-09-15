/**
 * proxy.ts（Next.js middleware）把请求路径放进这个请求头，供服务端组件读取。
 *
 * 服务端 layout 本身拿不到 pathname，而脚本详情 layout 需要按子路由区分脚本 404
 * 的处理方式。常量单独放一个模块，避免服务端组件为了拿它而 import 整个中间件。
 */
export const PATHNAME_HEADER = 'x-pathname';
