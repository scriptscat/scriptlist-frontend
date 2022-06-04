import { CheckCircleTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useLocation } from '@remix-run/react';
import { Button, Card, Space, Table, Tag, Tooltip } from 'antd';
import Column from 'antd/lib/table/Column';
import { formatDate } from '~/utils/utils';
import { IssueList } from '~/services/scripts/issues/api';
import type {
  Issue as IssueItem,
  IssueStatusType,
} from '~/services/scripts/issues/types';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';
import { replaceSearchParam } from '~/services/utils';

type LoaderData = {
  list: IssueItem[];
  total: number;
  page: number;
};

export const IssueTagMap: { [key: string]: string[] } = {
  feature: ['新功能', 'geekblue'],
  question: ['问题', 'cyan'],
  bug: ['BUG', 'red'],
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const data = await IssueList(parseInt(params.id as string), {
    page: page,
  });
  return json({ list: data.list, total: data.total, page: page } as LoaderData);
};

export default function Issue() {
  const data = useLoaderData<LoaderData>();
  const user = useContext(UserContext);
  const location = useLocation();
  return (
    <Card>
      <Space className="mb-2">
        <Tooltip
          title={
            user.user
              ? '创建反馈时记得描述清楚问题哦,否则可能会被作者直接关闭'
              : '请先登录后再创建反馈'
          }
        >
          <Button type="primary" disabled={user.user ? false : true}>
            <Link to={'./create'}>创建反馈</Link>
          </Button>
        </Tooltip>
      </Space>
      <Table
        rowKey={(record) => record.id}
        dataSource={data.list}
        pagination={{
          hideOnSinglePage: true,
          showSizeChanger: false,
          pageSize: 20,
          total: data.total,
          current: data.page,
          itemRender: (current, type, originalElement) => {
            if (type !== 'page') {
              return (
                <Link
                  to={{
                    search: replaceSearchParam(location.search, {
                      page: current,
                    }),
                  }}
                >
                  {originalElement}
                </Link>
              );
            }
            return (
              <Link
                to={{
                  search: replaceSearchParam(location.search, {
                    page: current,
                  }),
                }}
              >
                {current}
              </Link>
            );
          },
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
                {labels &&
                  labels.map(
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
