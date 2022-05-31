import type { TagProps } from 'antd';
import { Tag } from 'antd';

export const IssueTagMap: { [key: string]: string[] } = {
  feature: ['新功能', 'geekblue'],
  question: ['问题', 'cyan'],
  bug: ['BUG', 'red'],
};

const IssueLabel: React.FC<TagProps & { label: string }> = (props) => {
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
