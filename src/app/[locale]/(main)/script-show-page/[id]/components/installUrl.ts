/** ScriptInfo.public 的私有取值，与后端 script_entity.PrivateScript 对齐。 */
export const SCRIPT_PUBLIC_PRIVATE = 3;

/**
 * 给安装链接挂上安装令牌。
 *
 * 版本页的链接本来就带 `?version=`，所以分隔符必须按是否已有查询串来选，
 * 否则会把整条链接拼坏。没有令牌时原样返回——公开脚本不带令牌。
 */
export function withInstallToken(url: string, token?: string): string {
  if (!token) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}
