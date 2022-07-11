import {
  CopyOutlined,
  DiffOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Button, Card, Input, List, Space, Tag, Tooltip } from 'antd';
import { useContext, useState } from 'react';
import { formatDate } from '~/utils/utils';
import MarkdownView from '~/components/MarkdownView';
import { ScriptContext } from '~/context-manager';
import { ScriptVersionList } from '~/services/scripts/api';
import type { ScriptCode } from '~/services/scripts/types';

type LoaderData = {
  list: ScriptCode[];
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
  const navigate = useNavigate();
  const [diff, setDiff] = useState(-1);
  const script = useContext(ScriptContext);
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
                  <span className="text-xs">{formatDate(item.createtime)}</span>
                </div>
                <div className="py-2">
                  <MarkdownView
                    id={'version-' + item.id}
                    content={item.changelog || '作者偷懒没有写更新日志'}
                  />
                </div>
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
                {(script.script?.type == 1 || script.script?.type == 2) && (
                  <Button.Group size="small">
                    <Button
                      className="!rounded-none"
                      type="primary"
                      href={
                        '/scripts/code/' +
                        script.script?.id +
                        '/' +
                        script.script?.name +
                        '.user.js?version=' +
                        item.version
                      }
                      icon={<DownloadOutlined />}
                    >
                      安装{item.version}
                    </Button>
                    <Tooltip placement="bottom" title="如何安装?">
                      <Button
                        className="!rounded-none"
                        type="primary"
                        icon={<QuestionCircleOutlined />}
                        color="#3874cb"
                        href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
                        target="_blank"
                      ></Button>
                    </Tooltip>
                    <Tooltip
                      placement="bottom"
                      title="选择两个版本,对比代码变化"
                    >
                      <Button
                        className="!rounded-none"
                        icon={<DiffOutlined />}
                        danger={diff == index}
                        onClick={() => {
                          if (diff == index) {
                            setDiff(-1);
                          }
                          if (diff != -1) {
                            navigate({
                              pathname:
                                '/script-show-page/' +
                                script.script?.id +
                                '/diff',
                              search:
                                '?version1=' +
                                data.list[diff].version +
                                '&version2=' +
                                item.version,
                            });
                            return;
                          }
                          setDiff(index);
                        }}
                      ></Button>
                    </Tooltip>
                  </Button.Group>
                )}
                {script.script?.type == 3 && (
                  <>
                    <Input.Group compact>
                      <Input
                        style={{ width: '200px' }}
                        defaultValue={
                          '// @require https://scriptcat.org/lib/' +
                          script.script.id +
                          '/' +
                          item.version +
                          '/' +
                          encodeURIComponent(script.script.name) +
                          '.js'
                        }
                        readOnly
                      />
                      <Tooltip placement="bottom" title="复制链接">
                        <Button
                          type="default"
                          icon={<CopyOutlined />}
                          className="copy-require-link"
                          require-link={
                            '// @require https://scriptcat.org/lib/' +
                            script.script.id +
                            '/' +
                            item.version +
                            '/' +
                            encodeURIComponent(script.script.name) +
                            '.js'
                          }
                        ></Button>
                      </Tooltip>
                      <Tooltip placement="bottom" title="如何安装?">
                        <Button
                          className="!rounded-none"
                          type="primary"
                          href="https://bbs.tampermonkey.net.cn/thread-249-1-1.html"
                          target="_blank"
                          icon={<QuestionCircleOutlined />}
                          color="#3874cb"
                        ></Button>
                      </Tooltip>
                      <Tooltip
                        placement="bottom"
                        title="选择两个版本,对比代码变化"
                      >
                        <Button
                          className="!rounded-none"
                          icon={<DiffOutlined />}
                          danger={diff == index}
                          onClick={() => {
                            if (diff == index) {
                              setDiff(-1);
                            }
                            if (diff != -1) {
                              navigate({
                                pathname:
                                  '/script-show-page/' +
                                  script.script?.id +
                                  '/diff',
                                search:
                                  '?version1=' +
                                  data.list[diff].version +
                                  '&version2=' +
                                  item.version,
                              });
                              return;
                            }
                            setDiff(index);
                          }}
                        ></Button>
                      </Tooltip>
                    </Input.Group>
                  </>
                )}
              </div>
            </Card.Grid>
          </Card>
        )}
      ></List>
    </Card>
  );
}
