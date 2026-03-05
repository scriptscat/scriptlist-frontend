import type { TagProps } from 'antd';
import { Tag } from 'antd';
import { useTranslations } from 'next-intl';

const IssueLabel: React.FC<TagProps & { label: string }> = (props) => {
  const t = useTranslations('script.issue.labels');

  const IssueTagMap: { [key: string]: string[] } = {
    feature: [t('feature'), 'geekblue'],
    question: [t('question'), 'cyan'],
    bug: [t('bug'), 'red'],
  };

  return IssueTagMap[props.label] ? (
    <Tag
      {...props}
      className="anticon-middle"
      color={IssueTagMap[props.label][1]}
    >
      {IssueTagMap[props.label][0]}
    </Tag>
  ) : (
    <Tag {...props} className="anticon-middle">
      {props.label || 'null'}
    </Tag>
  );
};

export default IssueLabel;
