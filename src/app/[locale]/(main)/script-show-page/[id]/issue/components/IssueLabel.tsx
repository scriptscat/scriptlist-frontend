import type { TagProps } from 'antd';
import { Tag } from 'antd';
import { useTranslations } from 'next-intl';

const IssueLabel: React.FC<TagProps & { label: string }> = ({
  label,
  className = '',
  ...props
}) => {
  const t = useTranslations('script.issue.labels');

  const IssueTagMap: { [key: string]: string[] } = {
    feature: [t('feature'), 'geekblue'],
    question: [t('question'), 'cyan'],
    bug: [t('bug'), 'red'],
  };

  // GitHub 式胶囊标签
  const cls = `anticon-middle !rounded-full ${className}`;

  return IssueTagMap[label] ? (
    <Tag {...props} className={cls} color={IssueTagMap[label][1]}>
      {IssueTagMap[label][0]}
    </Tag>
  ) : (
    <Tag {...props} className={cls}>
      {label || 'null'}
    </Tag>
  );
};

export default IssueLabel;
