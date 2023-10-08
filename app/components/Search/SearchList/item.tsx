import {
  CalendarOutlined,
  CarryOutOutlined,
  CopyOutlined,
  DownloadOutlined,
  DownOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  EyeFilled,
  MoneyCollectOutlined,
  QuestionCircleOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from '@remix-run/react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Dropdown,
  Input,
  Menu,
  message,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { RiMessage2Line } from 'react-icons/ri';
import {
  formatDate,
  scriptDescription,
  scriptName,
  splitNumber,
} from '~/utils/utils';
import type { Script, WatchLevel } from '~/services/scripts/types';
import ActionMenu from '~/components/ActionMenu';
import { DeleteScript, WatchScript } from '~/services/scripts/api';
import { useEffect, useState } from 'react';
import GoogleAd from '~/components/GoogleAd';
import { useLocale } from 'remix-i18next';

export const WatchLevelMap = ['不关注', '版本更新', '新建反馈', '任何'];

// 不推荐的内容标签与描述
const antifeatures: {
  [key: string]: { color: string; title: string; description: string };
} = {
  'referral-link': {
    color: '#9254de',
    title: '推荐链接',
    description: '该脚本会修改或重定向到作者的返佣链接',
  },
  ads: {
    color: '#faad14',
    title: '附带广告',
    description: '该脚本会在你访问的页面上插入广告',
  },
  payment: {
    color: '#eb2f96',
    title: '付费脚本',
    description: '该脚本需要你付费才能够正常使用',
  },
  miner: {
    color: '#fa541c',
    title: '挖矿',
    description: '该脚本存在挖坑行为',
  },
  membership: {
    color: '#1890ff',
    title: '会员功能',
    description: '该脚本需要注册会员才能正常使用',
  },
  tracking: {
    color: '#722ed1',
    title: '信息追踪',
    description: '该脚本会追踪你的用户信息',
  },
};

function checkVersem(str: string) {
  const reg = /^(\d+)\.(\d+)\.(\d+)$/;
  return reg.test(str);
}

function genRequire(scriptId: number, name: string, version: string) {
  return (
    '// @require https://scriptcat.org/lib/' +
    scriptId +
    '/' +
    version +
    '/' +
    encodeURIComponent(name) +
    '.js'
  );
}

const SearchItem: React.FC<{
  script: Script;
  watch?: WatchLevel;
  onWatch?: (level: WatchLevel) => void;
  action?: boolean;
  onDelete?: () => void;
}> = ({ script, watch, action, onWatch, onDelete }) => {
  const locale = '/' + useLocale();
  const gridStyle = {
    width: '100%',
    padding: '2px 8px',
  };
  const iconStyle = {
    height: '14px',
  };
  const navigate = useNavigate();
  const [installTitle, setInstallTitle] = useState('安装脚本');
  // 判断是否为语义化版本
  const [requireSelect, setRequireSelect] = useState(1);
  useEffect(() => {
    if (action) {
      const api =
        window &&
        window.external &&
        (((window.external as any).Scriptcat ||
          (window.external as any).Tampermonkey) as {
          isInstalled: (
            name: string,
            namespace: string,
            callback: (res: any, rej: any) => void
          ) => void;
        });
      if (api) {
        api.isInstalled(
          script.name,
          (script.script.meta_json['namespace'] &&
            script.script.meta_json['namespace'][0]) ||
            '',
          (res: { installed: boolean; version: string }) => {
            if (res.installed === true) {
              if (res.version == script.script.version) {
                setInstallTitle('重新安装此脚本（版本' + res.version + '）');
              } else {
                setInstallTitle('更新到' + script.script.version + '版本');
              }
            }
          }
        );
      }
    }
  });
  return (
    <>
      <Card
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card.Grid hoverable={false} className="!p-2" style={gridStyle}>
          <div className="flex flex-row items-center gap-1">
            <div>
              <Avatar size="large" src={script.avatar} />
            </div>
            <div className="flex flex-col flex-auto">
              <Link
                className="text-sm"
                to={locale + '/users/' + script.user_id}
                target="_blank"
              >
                {script.username}
              </Link>
              <Link
                className="text-lg text-black dark:text-white"
                to={locale + '/script-show-page/' + script.id}
                target="_blank"
              >
                {scriptName(script)}
              </Link>
            </div>
            <div>
              {action ? (
                <Space>
                  <Dropdown
                    overlay={
                      <Menu
                        selectedKeys={[watch?.toString() || '0']}
                        items={[
                          {
                            key: '0',
                            label: '不关注',
                          },
                          {
                            key: '1',
                            label: '版本更新',
                          },
                          {
                            key: '2',
                            label: '新建issue',
                          },
                          {
                            key: '3',
                            label: '任何',
                          },
                        ]}
                        onClick={(item) => {
                          let resp;
                          resp = WatchScript(script.id, parseInt(item.key));
                          resp.then((resp) => {
                            if (resp.code !== 0) {
                              message.error(resp.msg);
                            } else {
                              onWatch &&
                                onWatch(parseInt(item.key) as WatchLevel);
                            }
                          });
                        }}
                      ></Menu>
                    }
                    trigger={['click']}
                  >
                    <Button size="small">
                      <Space className="anticon-middle">
                        <EyeFilled />
                        {WatchLevelMap[watch || 0]}
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                  <ActionMenu
                    uid={script.user_id}
                    deleteLevel="super_moderator"
                    allowSelfDelete
                    punish
                    onDeleteClick={async () => {
                      const resp = await DeleteScript(script.id);
                      if (resp.code == 0) {
                        message.success('删除成功');
                        navigate('/');
                      } else {
                        message.error(resp.msg);
                      }
                    }}
                  >
                    <Button
                      type="default"
                      size="small"
                      className="!p-0"
                      icon={<EllipsisOutlined />}
                    ></Button>
                  </ActionMenu>
                </Space>
              ) : (
                <ActionMenu
                  uid={script.user_id}
                  deleteLevel="super_moderator"
                  allowSelfDelete
                  punish
                  onDeleteClick={async () => {
                    const resp = await DeleteScript(script.id);
                    if (resp.code == 0) {
                      message.success('删除成功');
                      onDelete && onDelete();
                    } else {
                      message.error(resp.msg);
                    }
                  }}
                >
                  <Button type="link" className="!p-0">
                    操作
                  </Button>
                </ActionMenu>
              )}
            </div>
          </div>
        </Card.Grid>
        <Card.Grid hoverable={false} className="!py-2 !px-3" style={gridStyle}>
          {scriptDescription(script)}
        </Card.Grid>
        <Card.Grid hoverable={false} style={gridStyle}>
          <div className="flex flex-row gap-4 py-2">
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">今日安装</span>
              <div className="text-xs font-semibold">
                <DownloadOutlined className="!align-middle" style={iconStyle} />
                <span>{splitNumber(script.today_install.toString())}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">总安装量</span>
              <div className="text-xs font-semibold">
                <DownloadOutlined className="!align-middle" style={iconStyle} />
                <span>{splitNumber(script.total_install.toString())}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">创建日期</span>
              <div className="text-xs font-semibold">
                <CalendarOutlined className="!align-middle" style={iconStyle} />
                <span>{formatDate(script.createtime)}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">更新日期</span>
              <div className="text-xs font-semibold">
                <CarryOutOutlined className="!align-middle" style={iconStyle} />
                <span>{formatDate(script.updatetime)}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">用户评分</span>
              <div className="text-xs font-semibold">
                <StarOutlined className="!align-middle" style={iconStyle} />
                <span>
                  {script.score
                    ? (((script.score / script.score_num) * 2) / 10).toFixed(1)
                    : '暂无评分'}
                </span>
              </div>
            </div>
          </div>
        </Card.Grid>
        {action && (
          <>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="flex flex-row script-info-item px-2 py-1 gap-2">
                {(script.type == 1 || script.type == 2) && (
                  <Button.Group>
                    <Button
                      className="!rounded-none"
                      type="primary"
                      href={
                        '/scripts/code/' +
                        script.id +
                        '/' +
                        encodeURIComponent(script.name) +
                        '.user.js'
                      }
                      icon={<DownloadOutlined />}
                    >
                      {installTitle}
                    </Button>
                    <Tooltip placement="bottom" title="如何安装?">
                      <Button
                        className="!rounded-none"
                        type="primary"
                        href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
                        target="_blank"
                        icon={<QuestionCircleOutlined />}
                        color="#3874cb"
                      ></Button>
                    </Tooltip>
                    {script.enable_pre_release === 1 && (
                      <Tooltip
                        placement="bottom"
                        title="安装预发布版本,这不是一个稳定的版本,请谨慎安装"
                        color="orange"
                      >
                        <Button
                          className="!rounded-none"
                          type="primary"
                          href={
                            '/scripts/pre/' +
                            script.id +
                            '/' +
                            encodeURIComponent(script.name) +
                            '.user.js'
                          }
                          icon={<ExperimentOutlined />}
                          style={{
                            background: '#f98116',
                            borderColor: '#f98116',
                          }}
                        ></Button>
                      </Tooltip>
                    )}
                  </Button.Group>
                )}
                {script.type == 3 && (
                  <>
                    <Input.Group compact>
                      <Select
                        style={{ width: '500px' }}
                        value={requireSelect}
                        onChange={(value) => {
                          setRequireSelect(value);
                        }}
                      >
                        <Select.Option value={1}>
                          {genRequire(
                            script.id,
                            script.name,
                            script.script.version
                          )}
                        </Select.Option>
                        <Select.Option value={2}>
                          {genRequire(
                            script.id,
                            script.name,
                            '^' + script.script.version
                          ) + ' (最新兼容版本)'}
                        </Select.Option>
                        <Select.Option value={3}>
                          {genRequire(
                            script.id,
                            script.name,
                            '~' + script.script.version
                          ) + ' (最新修复版本)'}
                        </Select.Option>
                      </Select>
                      <Tooltip placement="bottom" title="复制链接">
                        <Button
                          type="default"
                          icon={<CopyOutlined />}
                          className="copy-require-link"
                          require-link={
                            requireSelect == 1
                              ? genRequire(
                                  script.id,
                                  script.name,
                                  script.script.version
                                )
                              : requireSelect == 2
                              ? genRequire(
                                  script.id,
                                  script.name,
                                  '%5E' + script.script.version
                                )
                              : genRequire(
                                  script.id,
                                  script.name,
                                  '~' + script.script.version
                                )
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
                    </Input.Group>
                  </>
                )}
                {(script.post_id !== 0 ||
                  script.script.meta_json['contributionurl']) && (
                  <Divider type="vertical" className="!h-auto" />
                )}
                {script.script.meta_json['contributionurl'] && (
                  <Button
                    className="!rounded-none !bg-transparent !border-orange-400 !text-orange-400"
                    href={script.script.meta_json['contributionurl'][0]}
                    target="_blank"
                    icon={<MoneyCollectOutlined />}
                  >
                    捐赠脚本
                  </Button>
                )}
                {script.post_id !== 0 && (
                  <Button
                    className="!rounded-none !bg-transparent !border-blue-400 !text-blue-400"
                    icon={
                      <RiMessage2Line className="!inline-block !m-0 !mr-2" />
                    }
                    href={`https://bbs.tampermonkey.net.cn/thread-${script.post_id}-1-1.html`}
                    target="_blank"
                  >
                    论坛帖子
                  </Button>
                )}
              </div>
            </Card.Grid>
            <GoogleAd width="970px" height="100px" />
          </>
        )}
        <Card.Grid hoverable={false} style={gridStyle}>
          <div className="flex flex-row justify-between py-[2px]">
            <div className="flex flex-row items-center text-sm">
              <Tooltip title="评分" placement="bottom">
                <Button
                  icon={<StarFilled className="!text-yellow-300" />}
                  type="text"
                  size="small"
                  className="anticon-middle"
                  href={locale + '/script-show-page/' + script.id + '/comment'}
                  target={action ? '_self' : '_blank'}
                ></Button>
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title="反馈问题" placement="bottom">
                <Button
                  icon={
                    <ExclamationCircleOutlined className="!text-cyan-500" />
                  }
                  type="text"
                  size="small"
                  className="anticon-middle"
                  href={locale + '/script-show-page/' + script.id + '/issue'}
                  target={action ? '_self' : '_blank'}
                ></Button>
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title="分享链接" placement="bottom">
                <Button
                  icon={<ShareAltOutlined className="!text-blue-500" />}
                  type="text"
                  size="small"
                  className="anticon-middle copy-script-link"
                  script-name={script.name}
                  script-id={script.id}
                ></Button>
              </Tooltip>
            </div>
            <div className="flex flex-row items-center">
              <Tooltip
                title={'脚本最新版本为:v' + script.script.version}
                color="red"
                placement="bottom"
              >
                <Tag color="red">{'v' + script.script.version}</Tag>
              </Tooltip>
              {script.category?.map((category) => (
                <Tooltip
                  title={'该脚本属于' + category.name + '分类'}
                  color="green"
                  placement="bottom"
                  key={category.id}
                >
                  <Tag color="green">{category.name}</Tag>
                </Tooltip>
              ))}
              {script.type === 3 && (
                <Tooltip
                  title={'这是一个库,你可以使用@require引用它'}
                  color="blue"
                  placement="bottom"
                >
                  <Tag color="blue">@require库</Tag>
                </Tooltip>
              )}
              {action &&
                script.script.meta_json['antifeature'] &&
                script.script.meta_json['antifeature'].map((item) => {
                  const antifeature = item.split(' ')[0];
                  return antifeatures[antifeature] ? (
                    <Tooltip
                      title={antifeatures[antifeature].description}
                      color={antifeatures[antifeature].color}
                      placement="bottom"
                      key={antifeature}
                    >
                      <Tag color={antifeatures[antifeature].color}>
                        {antifeatures[antifeature].title}
                      </Tag>
                    </Tooltip>
                  ) : (
                    <></>
                  );
                })}
            </div>
          </div>
        </Card.Grid>
      </Card>
    </>
  );
};
export default SearchItem;
