/**
 * 获取评分对应的文本描述
 * @param rating 评分数值
 * @returns 评分描述文本
 */
export function getRatingText(rating: number): string {
  switch (rating) {
    case 5:
      return '太棒了！';
    case 4:
      return '很好';
    case 3:
      return '还不错';
    case 2:
      return '一般';
    case 1:
      return '需要改进';
    default:
      return '';
  }
}
