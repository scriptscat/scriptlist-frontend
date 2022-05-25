import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Card, List, Space, Tag } from 'antd';
import { formatDate } from 'utils/utils';
import MarkdownView from '~/components/MarkdownView';
import { ScriptVersionList } from '~/services/scripts/api';
import { Script } from '~/services/scripts/types';

type LoaderData = {
  list: Script[];
  total: number;
};

export const loader: LoaderFunction = async ({ params }) => {
  const resp = await ScriptVersionList(parseInt(params.id as string));
  return json({
    list: resp.list,
    total: resp.total,
  } as LoaderData);
};

export default function Version() {
  const data = useLoaderData<LoaderData>();
  console.log(data);
  return (
    <Card>
      <List
        dataSource={data.list}
        renderItem={(item, index) => (
          <Card className={index != 0 ? '!mt-3' : ''}>
            <Card.Grid
              hoverable={false}
              style={{
                padding: '8px 8px',
                width: '100%',
              }}
              className="script-info-item"
            >
              <div className="flex flex-col">
                <div className="flex flex-row justify-between">
                  <Space>
                    <span className="text-2xl">{item.version}</span>
                    {index == 0 && <Tag color="green">最新</Tag>}
                  </Space>
                  <span className="text-xs">
                    {formatDate(item.createtime)}
                  </span>
                </div>
                <MarkdownView
                  id={'version-' + item.id}
                  content={item.changelog || '作者偷懒没有写更新日志'}
                />
              </div>
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              style={{
                padding: '8px 8px',
                width: '100%',
                textAlign: 'right',
              }}
              className="script-info-item"
            >
              <div>
                <Button.Group size="small">
                  <Button
                    className="!rounded-none"
                    type="primary"
                    icon={<DownloadOutlined />}
                  >
                    安装{item.version}
                  </Button>
                  <Button
                    className="!rounded-none"
                    type="primary"
                    icon={<QuestionCircleOutlined />}
                    color="#3874cb"
                  ></Button>
                </Button.Group>
              </div>
            </Card.Grid>
          </Card>
        )}
      ></List>
    </Card>
  );
}
