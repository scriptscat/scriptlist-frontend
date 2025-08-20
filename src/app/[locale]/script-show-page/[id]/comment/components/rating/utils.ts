/**
 * 获取评分对应的文本描述
 * @param rating 评分数值
 * @param t 翻译函数
 * @returns 评分描述文本
 */
export function getRatingText(rating: number, t: (key: string) => string): string {
  switch (rating) {
    case 5:
      return t('excellent');
    case 4:
      return t('good');
    case 3:
      return t('average');
    case 2:
      return t('fair');
    case 1:
      return t('poor');
    default:
      return '';
  }
}
