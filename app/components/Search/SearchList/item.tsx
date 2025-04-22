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
import { ReactNode, useEffect, useState } from 'react';
import GoogleAd from '~/components/GoogleAd';
import { useLocale } from 'remix-i18next';
import { useTranslation } from 'react-i18next';

const licenseMap: { [key: string]: string } = {
  MIT: 'https://opensource.org/licenses/mit',
  'APACHE-2.0': 'https://www.apache.org/licenses/LICENSE-2.0',
  'BSD-2': 'https://opensource.org/license/BSD-2-Clause',
  'BSD-3': 'https://opensource.org/licenses/BSD-3-Clause',
  'MPL-2.0': 'http://opensource.org/licenses/MPL-2.0',
  'GPL-2.0': 'http://opensource.org/licenses/GPL-2.0',
  'GPL-3.0': 'http://opensource.org/licenses/GPL-3.0',
  'AGPL-3.0': 'http://opensource.org/licenses/AGPL-3.0',
  'LGPL-3.0': 'http://opensource.org/licenses/LGPL-3.0',
  'LGPL-2.1': 'http://opensource.org/licenses/LGPL-2.1',
};

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
  const { t } = useTranslation();
  const [installTitle, setInstallTitle] = useState(t('install_script'));
  // 判断是否为语义化版本
  const [requireSelect, setRequireSelect] = useState(1);
  const WatchLevelMap = [
    t('not_follow'),
    t('version_update'),
    t('create_issue'),
    t('any'),
  ];
  // 不推荐的内容标签与描述
  const antifeatures: {
    [key: string]: { color: string; title: string; description: string };
  } = {
    'referral-link': {
      color: '#9254de',
      title: t('referral_link'),
      description: t('referral_link_description'),
    },
    ads: {
      color: '#faad14',
      title: t('ads'),
      description: t('ads_description'),
    },
    payment: {
      color: '#eb2f96',
      title: t('payment_script'),
      description: t('payment_script_description'),
    },
    miner: {
      color: '#fa541c',
      title: t('mining'),
      description: t('mining_description'),
    },
    membership: {
      color: '#1890ff',
      title: t('membership_features'),
      description: t('membership_features_description'),
    },
    tracking: {
      color: '#722ed1',
      title: t('tracking'),
      description: t('tracking_description'),
    },
  };
  const labels = [
    {
      label: 'today_install',
      icon: DownloadOutlined,
      value: splitNumber(script.today_install.toString()),
    },
    {
      label: 'total_install',
      icon: DownloadOutlined,
      value: splitNumber(script.total_install.toString()),
    },
    {
      label: 'create_date',
      icon: CalendarOutlined,
      value: formatDate(script.createtime),
    },
    {
      label: 'update_date',
      icon: CarryOutOutlined,
      value: formatDate(script.updatetime),
    },
    {
      label: 'user_rating',
      icon: StarOutlined,
      value: script.score
        ? (((script.score / script.score_num) * 2) / 10).toFixed(1)
        : t('no_rating'),
    },
  ];
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
                setInstallTitle(
                  t('reinstall_script_version', { version: res.version })
                );
              } else {
                setInstallTitle(
                  t('update_script_version', { version: script.script.version })
                );
              }
            }
          }
        );
      }
    }
  });
  const tag: ReactNode[] = [];
  if (action) {
    if (script.script.meta_json['license']) {
      tag.push(
        <Tooltip
          title={
            <>
              {t('script_license')}:{' '}
              {licenseMap[script.script.meta_json['license'][0]] ? (
                <a
                  href={
                    licenseMap[
                      script.script.meta_json['license'][0].toUpperCase()
                    ]
                  }
                  target="_blank"
                >
                  {script.script.meta_json['license'][0]}
                </a>
              ) : (
                script.script.meta_json['license'][0]
              )}
            </>
          }
          color="pink"
          placement="bottom"
          key={script.script.meta_json['license'][0]}
        >
          <Tag color="pink">{script.script.meta_json['license'][0]}</Tag>
        </Tooltip>
      );
    }
    if (script.script.meta_json['antifeature']) {
      script.script.meta_json['antifeature'].forEach((item) => {
        const antifeature = item.split(' ');
        if (antifeatures[antifeature[0]]) {
          tag.push(
            <Tooltip
              title={
                antifeatures[antifeature[0]].description +
                (antifeature.length > 1
                  ? ': ' + antifeature.slice(1).join(' ')
                  : '')
              }
              color={antifeatures[antifeature[0]].color}
              placement="bottom"
              key={antifeature[0]}
            >
              <Tag color={antifeatures[antifeature[0]].color}>
                {antifeatures[antifeature[0]].title}
              </Tag>
            </Tooltip>
          );
        }
      });
    }
  }
  return (
    <Card className="overflow-hidden border-[1.5px]">
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
              className="text-lg !text-black dark:!text-white dark:hover:!text-[#1677ff] hover:!text-[#1677ff]"
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
                  menu={{
                    selectedKeys: [watch?.toString() || '0'],
                    items: [
                      {
                        key: '0',
                        label: t('not_follow'),
                      },
                      {
                        key: '1',
                        label: t('version_update'),
                      },
                      {
                        key: '2',
                        label: t('create_issue'),
                      },
                      {
                        key: '3',
                        label: t('any'),
                      },
                    ],
                    onClick(item) {
                      let resp;
                      resp = WatchScript(script.id, parseInt(item.key));
                      resp.then((resp) => {
                        if (resp.code !== 0) {
                          message.error(resp.msg);
                        } else {
                          onWatch && onWatch(parseInt(item.key) as WatchLevel);
                        }
                      });
                    },
                  }}
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
                      message.success(t('delete_success'));
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
                    message.success(t('delete_success'));
                    onDelete && onDelete();
                  } else {
                    message.error(resp.msg);
                  }
                }}
              >
                <Button type="link" className="!p-0">
                  {t('action')}
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
        <div className="flex flex-col sm:flex-row gap-4 py-2 justify-evenly">
          {labels.map((info) => (
            <div
              className="flex flex-col text-center px-5"
              key={JSON.stringify(info)}
            >
              <span className="text-gray-500 text-sm">{t(info.label)}</span>
              <div className="text-xs font-semibold">
                <info.icon style={iconStyle} className="pr-1" />
                <span>{info.value}</span>
              </div>
            </div>
          ))}
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
                  <Tooltip placement="bottom" title={t('how_to_install')}>
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
                      title={t('install_pre_release_version')}
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
                  <Input.Group compact className="!w-auto">
                    <Select
                      style={{
                        width: '500px',
                      }}
                      className="border-start-radius-0"
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
                        ) + ' (latest compatible version)'}
                      </Select.Option>
                      <Select.Option value={3}>
                        {genRequire(
                          script.id,
                          script.name,
                          '~' + script.script.version
                        ) + ' (latest bugfix version)'}
                      </Select.Option>
                    </Select>
                    <Tooltip placement="bottom" title={t('copy_link')}>
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
                    <Tooltip placement="bottom" title={t('how_to_install')}>
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
                  {t('donate_script')}
                </Button>
              )}
              {script.post_id !== 0 && (
                <Button
                  className="!rounded-none !bg-transparent !border-blue-400 !text-blue-400"
                  icon={<RiMessage2Line className="!inline-block !m-0 !mr-2" />}
                  href={`https://bbs.tampermonkey.net.cn/thread-${script.post_id}-1-1.html`}
                  target="_blank"
                >
                  {t('forum_post')}
                </Button>
              )}
            </div>
          </Card.Grid>
          <GoogleAd width="970px" height="100px" />
        </>
      )}
      <Card.Grid hoverable={false} style={gridStyle}>
        <div className="flex flex-row justify-between py-0.5">
          <div className="flex flex-row items-center text-sm">
            <Tooltip title={t('rating')} placement="bottom">
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
            <Tooltip title={t('report_issue')} placement="bottom">
              <Button
                icon={<ExclamationCircleOutlined className="!text-cyan-500" />}
                type="text"
                size="small"
                className="anticon-middle"
                href={locale + '/script-show-page/' + script.id + '/issue'}
                target={action ? '_self' : '_blank'}
              ></Button>
            </Tooltip>
            <Divider type="vertical" />
            <Tooltip title={t('share_link')} placement="bottom">
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
              title={t('latest_script_version', {
                version: script.script.version,
              })}
              color="red"
              placement="bottom"
            >
              <Tag color="red">
                {t('v', { version: script.script.version })}
              </Tag>
            </Tooltip>
            {script.category?.map((category) => (
              <Tooltip
                title={t('script_category', { category: category.name })}
                color="green"
                placement="bottom"
                key={category.id}
              >
                <Tag color="green">{category.name}</Tag>
              </Tooltip>
            ))}
            {script.type === 3 && (
              <Tooltip
                title={t('library_script')}
                color="blue"
                placement="bottom"
              >
                <Tag color="blue">@require库</Tag>
              </Tooltip>
            )}
            {tag.map((item) => item)}
          </div>
        </div>
      </Card.Grid>
    </Card>
  );
};
export default SearchItem;
