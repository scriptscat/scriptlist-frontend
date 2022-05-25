import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  InfoCircleTwoTone,
} from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Card, Space, Table, Tag } from 'antd';
import Column from 'antd/lib/table/Column';
import { Link } from 'react-router-dom';
import { formatDate } from 'utils/utils';
import { IssueList } from '~/services/scripts/issues/api';
import type {
  Issue as IssueItem,
  IssueStatusType,
} from '~/services/scripts/issues/types';

type LoaderData = {
  list: IssueItem[];
  total: number;
};

export const IssueTagMap: { [key: string]: string[] } = {
  feature: ['新功能', 'geekblue'],
  question: ['问题', 'cyan'],
  bug: ['BUG', 'red'],
};

export const loader: LoaderFunction = async ({ params }) => {
  const data = await IssueList(parseInt(params.id as string), {});
  return json({ list: data.list, total: data.total } as LoaderData);
};

export default function Issue() {
  const data = useLoaderData<LoaderData>();
  return (
    <Card>
      <Space className="mb-2">
        <Button type="primary">创建反馈</Button>
      </Space>
      <Table
        rowKey={(record) => record.id}
        dataSource={data.list}
        pagination={{ hideOnSinglePage: true, pageSize: 20, total: data.total }}
        onChange={(pagination) => {
          console.log(pagination);
        }}
        size="small"
      >
        <Column
          title="标题"
          dataIndex="title"
          key="title"
          render={(title, record: IssueItem) => {
            return (
              <div className="flex flex-col">
                <Link
                  to={'./' + record.id + '/comment'}
                  className="text-base text-gray-500"
                >
                  {title}
                </Link>
                <span className="text-xs">
                  {formatDate(record.createtime)} {record.username}
                </span>
              </div>
            );
          }}
        />
        <Column
          title="标签"
          dataIndex="labels"
          key="labels"
          width={200}
          render={(labels: string[]) => {
            return (
              <div className="flex flex-row">
                {labels.map(
                  (label) =>
                    IssueTagMap[label] && (
                      <Tag key={label} color={IssueTagMap[label][1]}>
                        {IssueTagMap[label][0]}
                      </Tag>
                    )
                )}
              </div>
            );
          }}
        />
        <Column
          title="状态"
          dataIndex="status"
          key="status"
          width={120}
          render={(status: IssueStatusType) => {
            switch (status) {
              case 1:
                return (
                  <Tag
                    icon={<InfoCircleTwoTone className="!align-baseline" />}
                    color="blue"
                  >
                    待处理
                  </Tag>
                );
              default:
                return (
                  <Tag
                    icon={
                      <CheckCircleTwoTone
                        className="!align-baseline"
                        twoToneColor="#52c41a"
                      />
                    }
                    color="green"
                  >
                    已处理
                  </Tag>
                );
            }
          }}
        />
      </Table>
    </Card>
  );
}
