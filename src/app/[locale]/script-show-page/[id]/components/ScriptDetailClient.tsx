'use client';

import {
  Button,
  Card,
  Space,
  Avatar,
  Tag,
  Statistic,
  Typography,
  Tooltip,
  Row,
  Col,
  Modal,
  message,
  Dropdown,
  Checkbox,
  Divider,
  Badge,
  Input,
  Select,
} from 'antd';
import {
  DownloadOutlined,
  CodeOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  UserOutlined,
  MoreOutlined,
  PlusOutlined,
  FolderOutlined,
  DownOutlined,
  StarOutlined,
  StarFilled,
  QuestionCircleOutlined,
  EyeFilled,
  EyeOutlined,
  CopyOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useScript, useScriptState } from './ScriptContext';
import { useUser } from '@/contexts/UserContext';
import { useSemDateTime } from '@/lib/utils/semdate';
import { Link, useRouter } from '@/i18n/routing';
import MarkdownView from '@/components/MarkdownView';
import { ScriptUtils } from '../utils';
import { copyToClipboard, hashColor } from '@/lib/utils/utils';
import { checkScriptInstalled } from '@/lib/utils/script-manager';
import { useScriptWatch, useScriptFavorite } from '@/lib/api/hooks';
import { WatchLevel } from '../types';
import { scriptService } from '@/lib/api/services/scripts';
import { useTranslations } from 'next-intl';
import ActionMenu from '@/components/ActionMenu';

const { Title, Text, Paragraph } = Typography;

// 生成@require链接的函数
function genRequire(
  scriptId: number,
  name: string,
  version: string,
  sri?: string,
) {
  return (
    '// @require https://scriptcat.org/lib/' +
    scriptId +
    '/' +
    version +
    '/' +
    encodeURIComponent(name) +
    '.js' +
    (sri ? '?' + sri : '')
  );
}

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

export default function ScriptDetailClient() {
  const { script } = useScript();
  const scriptState = useScriptState();
  const { user: _user } = useUser();
  const [showAllSites, setShowAllSites] = useState(false);
  const [requireSelect, setRequireSelect] = useState<number>(1); // 库模式的选择状态
  const semDateTime = useSemDateTime();
  const [modal, contextHolder] = Modal.useModal();
  const t = useTranslations('script.detail');
  const router = useRouter();

  const [installTitle, setInstallTitle] = useState(t('install.install_script')); // 安装按钮文案

  // 解析crontab表达式为更友好的描述
  const parseCrontabDescription = (cron: string): string => {
    let oncePos = 0;
    if (cron.includes('once')) {
      const vals = cron.split(' ');
      vals.forEach((val, index) => {
        if (val === 'once') {
          oncePos = index;
        }
      });
      if (vals.length === 5) {
        oncePos++;
      }
    }
    if (oncePos) {
      switch (oncePos) {
        case 1: // 每分钟
          return t('crontab.every_minute');
        case 2: // 每小时
          return t('crontab.every_hour');
        case 3: // 每天
          return t('crontab.every_day');
        case 4: // 每月
          return t('crontab.every_month');
        case 5: // 每星期
          return t('crontab.every_week');
      }
      throw new Error(t('crontab.error_expression'));
    }

    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5) return cron;

    const [minute, hour] = parts;

    // 简单的crontab解析
    if (cron === '* * * * *') return t('crontab.every_minute_execute');
    if (cron === '0 * * * *') return t('crontab.every_hour_execute');
    if (cron === '0 0 * * *') return t('crontab.daily_at_midnight');
    if (cron === '0 0 * * 0') return t('crontab.weekly_sunday_midnight');
    if (cron === '0 0 1 * *') return t('crontab.monthly_first_midnight');

    // 常见模式
    if (minute === '0' && hour !== '*') {
      if (hour.includes('/')) {
        const interval = hour.split('/')[1];
        return t('crontab.every_n_hours', { interval });
      }
      if (hour.includes(',')) {
        return t('crontab.daily_at_hours', { hours: hour.replace(/,/g, '、') });
      }
      return t('crontab.daily_at_hours', { hours: hour });
    }

    if (minute.includes('/')) {
      const interval = minute.split('/')[1];
      return t('crontab.every_n_minutes', { interval });
    }

    return cron; // 返回原始表达式
  };

  const scriptName = ScriptUtils.i18nName(script, router.locale);
  const scriptDescription = ScriptUtils.i18nDescription(script, router.locale);

  // 使用关注功能Hook
  const {
    watchLevel,
    isWatched,
    loading: watchLoading,
    updateWatch,
  } = useScriptWatch(script.id, scriptState.watch as WatchLevel);

  // 使用收藏功能Hook
  const {
    folders,
    favoriteIds,
    loading: favoriteLoading,
    updateFavorites,
    createFolder,
    quickFavorite,
  } = useScriptFavorite(script.id, scriptState.favorite_ids || []);

  // 收藏夹相关状态 - 现在使用真实数据
  const [selectedFolders, setSelectedFolders] = useState<number[]>(favoriteIds);

  // 同步favoriteIds变化到selectedFolders
  React.useEffect(() => {
    setSelectedFolders(favoriteIds);
  }, [favoriteIds]);

  // 检测脚本管理器并检查是否已安装脚本
  React.useEffect(() => {
    // 只检测脚本模式，库模式不需要检测
    if (script.type === 3) return;

    const namespace =
      (script.script.meta_json['namespace'] &&
        script.script.meta_json['namespace'][0]) ||
      '';

    checkScriptInstalled(script.name, namespace)
      .then((status) => {
        if (status.installed) {
          if (status.version === script.script.version) {
            setInstallTitle(
              t('install.reinstall_script', { version: status.version }),
            );
          } else {
            setInstallTitle(
              t('install.update_script', { version: script.script.version }),
            );
          }
        }
      })
      .catch((error) => {
        console.warn(t('install.install_check_failed'), error);
      });
  }, [script]);

  // AntiFeatures 配置
  const antifeatures: {
    [key: string]: { color: string; title: string; description: string };
  } = {
    'referral-link': {
      color: '#9254de',
      title: t('antifeatures.referral_link.title'),
      description: t('antifeatures.referral_link.description'),
    },
    ads: {
      color: '#faad14',
      title: t('antifeatures.ads.title'),
      description: t('antifeatures.ads.description'),
    },
    payment: {
      color: '#eb2f96',
      title: t('antifeatures.payment.title'),
      description: t('antifeatures.payment.description'),
    },
    miner: {
      color: '#fa541c',
      title: t('antifeatures.miner.title'),
      description: t('antifeatures.miner.description'),
    },
    membership: {
      color: '#1890ff',
      title: t('antifeatures.membership.title'),
      description: t('antifeatures.membership.description'),
    },
    tracking: {
      color: '#722ed1',
      title: t('antifeatures.tracking.title'),
      description: t('antifeatures.tracking.description'),
    },
  };

  // 计算是否已收藏（有选中的收藏夹）
  const isFavorited = selectedFolders.length > 0;

  // 处理适用网站显示
  const getSupportSites = () => {
    // 从脚本的match和include字段获取支持的网站
    const supportUrls = new Set<string>();
    if (script.script.meta_json.match) {
      script.script.meta_json.match.forEach((url: string) => {
        supportUrls.add(url);
      });
    }
    if (script.script.meta_json.include) {
      script.script.meta_json.include.forEach((url: string) => {
        supportUrls.add(url);
      });
    }
    return Array.from(supportUrls).filter((site) => site.length > 0);
  };

  const supportSites = getSupportSites();

  // 优化的渲染适用网站组件
  const renderSupportSites = () => {
    const maxDisplay = 6; // 最多显示4个网站
    const sitesToShow = showAllSites
      ? supportSites
      : supportSites.slice(0, maxDisplay);
    const hasMore = supportSites.length > maxDisplay;

    return (
      <div className="space-y-2 text-right">
        <div className={`${showAllSites ? 'max-h-32 overflow-y-auto' : ''}`}>
          <ul className="inline-flex flex-wrap justify-end items-start gap-x-1 gap-y-1 list-none m-0 p-0 text-xs">
            {sitesToShow.map((site, index) => (
              <li
                key={index}
                className="inline-flex items-center whitespace-nowrap"
              >
                <a
                  // href={`https://${site}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center transition-colors"
                >
                  <span className="truncate max-w-[120px]">
                    {site.length > 15 ? `${site.substring(0, 12)}...` : site}
                  </span>
                </a>
                {index < sitesToShow.length - 1 && (
                  <span className="text-gray-400 ml-1">{','}</span>
                )}
              </li>
            ))}
            {hasMore && !showAllSites && (
              <li className="inline-flex items-center whitespace-nowrap">
                <span className="text-gray-400">{','}</span>
                <a
                  onClick={() => setShowAllSites(true)}
                  className="ml-1 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  {t('sites.more', { count: supportSites.length - maxDisplay })}
                </a>
              </li>
            )}
          </ul>
        </div>
        {showAllSites && hasMore && (
          <div className="text-right">
            <Button
              type="link"
              size="small"
              onClick={() => setShowAllSites(false)}
              className="!p-0 !h-auto text-xs text-gray-500 hover:text-blue-600"
            >
              {t('sites.collapse')}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // 复制库链接到剪贴板
  const handleCopyRequire = async (requireLink: string) => {
    try {
      copyToClipboard(requireLink);
      message.success(t('copy.copied_to_clipboard'));
    } catch (_error) {
      message.error(t('copy.copy_failed'));
    }
  };

  // 分享脚本 - 复制脚本名称和链接
  const handleShare = () => {
    const currentUrl =
      process.env.NEXT_PUBLIC_APP_URL +
      `/${router.locale}/script-show-page/${script.id}`;
    const shareText = `${scriptName}\n${currentUrl}`;
    return shareText;
  };

  const handleFollowChange = async (value: string) => {
    const watchLevelMap: { [key: string]: WatchLevel } = {
      none: WatchLevel.NONE,
      version: WatchLevel.VERSION,
      feedback: WatchLevel.FEEDBACK,
      all: WatchLevel.ALL,
    };

    const newWatchLevel = watchLevelMap[value] ?? WatchLevel.NONE;
    await updateWatch(newWatchLevel);
  };

  // 处理收藏夹变更
  const handleFoldersChange = async (checkedValues: string[]) => {
    const numberIds = checkedValues.map((id) => parseInt(id, 10));
    setSelectedFolders(numberIds);

    try {
      await updateFavorites(numberIds);
    } catch (error) {
      // updateFavorites 中已经处理了错误消息
      console.error(t('folders.favorite_update_failed'), error);
    }
  };

  // 添加新收藏夹
  const handleAddFolder = async () => {
    modal.confirm({
      title: t('folders.create_new_folder'),
      maskClosable: true,
      content: (
        <Space direction="vertical" className="w-full">
          <Input
            placeholder={t('folders.folder_name_placeholder')}
            id="folder-name-input"
            autoFocus
          />
          <Input.TextArea
            placeholder={t('folders.folder_desc_placeholder')}
            className="mt-2"
            rows={2}
            id="folder-desc-input"
          />
        </Space>
      ),
      onOk: async () => {
        const nameInput = document.getElementById(
          'folder-name-input',
        ) as HTMLInputElement;
        const descInput = document.getElementById(
          'folder-desc-input',
        ) as HTMLTextAreaElement;

        const name = nameInput?.value?.trim();
        const description = descInput?.value?.trim();

        if (!name) {
          message.error(t('folders.folder_name_required'));
          return Promise.reject();
        }

        try {
          await createFolder({
            name,
            description,
            private: 2, // 公开
          });
        } catch (error) {
          return Promise.reject(error);
        }
      },
    });
  };

  // 原有的收藏处理函数改为快速收藏到默认收藏夹
  const handleQuickFavorite = async () => {
    try {
      await quickFavorite();
    } catch (error) {
      console.error(t('folders.quick_favorite_failed'), error);
    }
  };

  const icon = ScriptUtils.icon(script.script.meta_json);

  return (
    <div>
      {contextHolder}
      {/* 脚本头部信息 */}
      <Badge.Ribbon
        text={ScriptUtils.getRibbonText(script.public)}
        color={'orange'}
        style={{
          display: script.public > 1 ? 'block' : 'none',
          height: '20px',
          fontSize: '10px',
          top: '-4px',
        }}
      >
        <Card className="shadow-sm !mb-2">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <div className="flex flex-col h-full">
                {/* 脚本基本信息 */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar
                      shape="square"
                      size={64}
                      src={icon}
                      icon={<CodeOutlined />}
                      className="bg-gradient-to-br from-blue-500 to-purple-600"
                    />
                    <div className="flex-1 ml-2">
                      <Title level={2} className="mb-2">
                        {scriptName}
                      </Title>
                      <Space wrap className="mb-3">
                        <Link
                          href={`/users/${script.user_id}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Space size="small">
                            <Avatar
                              size={20}
                              src={script.avatar}
                              icon={<UserOutlined />}
                              className="flex-shrink-0"
                            />
                            <Text
                              type="secondary"
                              className="hover:!text-[#1677ff]"
                            >
                              {script.username}
                            </Text>
                          </Space>
                        </Link>
                        <Text type="secondary" className="my-2">
                          {'•'}
                        </Text>
                        <Text type="secondary">
                          <CalendarOutlined className="mr-1" />
                          {t('info.created_at', {
                            time: semDateTime(script.createtime),
                          })}
                        </Text>
                        <Text type="secondary" className="my-2">
                          {'•'}
                        </Text>
                        <Text type="secondary">
                          <CalendarOutlined className="mr-1" />
                          {t('info.updated_at', {
                            time: semDateTime(script.updatetime),
                          })}
                        </Text>
                      </Space>
                      <Paragraph className="text-gray-600 mb-3">
                        {scriptDescription}
                      </Paragraph>
                      <Space wrap>
                        {script.category && (
                          <Tooltip
                            title={script.category.name}
                            placement="bottom"
                          >
                            <Tag
                              key={script.category.id}
                              color={hashColor(script.category.name)}
                            >
                              {script.category.name}
                            </Tag>
                          </Tooltip>
                        )}
                        {script.tags.map((tag) => (
                          <Tooltip
                            title={t('info.tag_label', { name: tag.name })}
                            placement="bottom"
                            key={tag.id}
                          >
                            <Tag
                              key={tag.id}
                              color={hashColor(tag.name)}
                              bordered
                            >
                              {'#' + tag.name}
                            </Tag>
                          </Tooltip>
                        ))}
                      </Space>
                    </div>
                  </div>
                </div>

                {/* 统计数据 - 移动到底部 */}
                <div className="mt-auto">
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <Statistic
                          title={t('stats.total_installs')}
                          value={script.total_install}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <Statistic
                          title={t('stats.today_installs')}
                          value={script.today_install}
                          valueStyle={{ color: '#52c41a' }}
                          prefix="+"
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <Statistic
                          title={t('stats.user_rating')}
                          value={
                            ScriptUtils.score(script.score, script.score_num) ||
                            '-'
                          }
                          precision={1}
                          valueStyle={{ color: '#faad14' }}
                          suffix={
                            <span className="text-sm text-gray-500">
                              {' / 5.0 (' + script.score_num + ')'}
                            </span>
                          }
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <Statistic
                          title={t('stats.current_version')}
                          value={script.script.version}
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div className="flex flex-col gap-4">
                {/* 根据脚本类型显示不同的安装组件 */}
                {script.type === 3 ? (
                  // 库模式 - 显示@require组件
                  <Space.Compact className="flex w-full">
                    <Select
                      className="flex-1"
                      style={{
                        overflow: 'hidden',
                      }}
                      value={requireSelect}
                      onChange={(value) => {
                        setRequireSelect(value);
                      }}
                    >
                      <Select.Option value={1}>
                        {genRequire(
                          script.id,
                          script.name,
                          script.script.version,
                          script.sri,
                        )}
                      </Select.Option>
                      <Select.Option value={2}>
                        {t('require.compatible_version') +
                          genRequire(
                            script.id,
                            script.name,
                            '^' + script.script.version,
                          )}
                      </Select.Option>
                      <Select.Option value={3}>
                        {t('require.patch_version') +
                          genRequire(
                            script.id,
                            script.name,
                            '~' + script.script.version,
                          )}
                      </Select.Option>
                    </Select>
                    <Tooltip
                      placement="bottom"
                      title={t('require.copy_tooltip')}
                    >
                      <Button
                        type="default"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          const requireLink =
                            requireSelect == 1
                              ? genRequire(
                                  script.id,
                                  script.name,
                                  script.script.version,
                                  script.sri,
                                )
                              : requireSelect == 2
                                ? genRequire(
                                    script.id,
                                    script.name,
                                    '^' + script.script.version,
                                  )
                                : genRequire(
                                    script.id,
                                    script.name,
                                    '~' + script.script.version,
                                  );
                          handleCopyRequire(requireLink);
                        }}
                      ></Button>
                    </Tooltip>
                    <Tooltip
                      placement="bottom"
                      title={t('require.usage_guide')}
                    >
                      <Button
                        type="primary"
                        href="https://bbs.tampermonkey.net.cn/thread-249-1-1.html"
                        target="_blank"
                        icon={<QuestionCircleOutlined />}
                      ></Button>
                    </Tooltip>
                  </Space.Compact>
                ) : (
                  // 脚本模式 - 显示原来的安装按钮
                  <Space.Compact className="w-full">
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      className="flex-1 bg-gradient-to-r"
                      href={
                        '/scripts/code/' +
                        script.id +
                        '/' +
                        encodeURIComponent(script.name) +
                        '.user.js'
                      }
                    >
                      {installTitle}
                    </Button>
                    <Tooltip title={t('actions.install_guide')}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<QuestionCircleOutlined />}
                        onClick={() =>
                          window.open(
                            'https://bbs.tampermonkey.net.cn/thread-57-1-1.html',
                            '_blank',
                          )
                        }
                        className="bg-gradient-to-r !px-3"
                      />
                    </Tooltip>
                    {script.enable_pre_release === 1 && (
                      <Tooltip
                        title={t('actions.prerelease_tooltip')}
                        color="orange"
                      >
                        <Button
                          type="primary"
                          size="large"
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
                  </Space.Compact>
                )}

                {/* GitHub风格的操作按钮组 */}
                <div className="flex flex-wrap gap-2 justify-end">
                  <CopyToClipboard
                    text={handleShare()}
                    onCopy={() => message.success(t('copy.share_copied'))}
                  >
                    <Button icon={<ShareAltOutlined />} size="small">
                      <span className="hidden sm:inline">
                        {t('actions.share')}
                      </span>
                    </Button>
                  </CopyToClipboard>

                  {/* 关注按钮组 */}
                  <Dropdown
                    trigger={['click']}
                    placement="bottomRight"
                    menu={{
                      items: [
                        { key: 'none', label: t('actions.watch_options.none') },
                        {
                          key: 'version',
                          label: t('actions.watch_options.version'),
                        },
                        {
                          key: 'feedback',
                          label: t('actions.watch_options.feedback'),
                        },
                        { key: 'all', label: t('actions.watch_options.all') },
                      ],
                      onClick: ({ key }) => handleFollowChange(key),
                      selectedKeys: [
                        watchLevel === WatchLevel.NONE
                          ? 'none'
                          : watchLevel === WatchLevel.VERSION
                            ? 'version'
                            : watchLevel === WatchLevel.FEEDBACK
                              ? 'feedback'
                              : watchLevel === WatchLevel.ALL
                                ? 'all'
                                : 'none',
                      ],
                    }}
                  >
                    <Button
                      icon={isWatched ? <EyeFilled /> : <EyeOutlined />}
                      className="flex items-center"
                      size="small"
                      loading={watchLoading}
                    >
                      <span className="hidden sm:inline">
                        {t('actions.watch')}
                      </span>
                      <span className="ml-1">
                        {scriptState.watch_count || 0}
                      </span>
                      <DownOutlined className="ml-1" />
                    </Button>
                  </Dropdown>

                  {/* 收藏按钮组 */}
                  <Space.Compact>
                    <Button
                      icon={isFavorited ? <StarFilled /> : <StarOutlined />}
                      onClick={handleQuickFavorite}
                      className="flex items-center"
                      size="small"
                      loading={favoriteLoading}
                    >
                      <span className="hidden sm:inline">
                        {t('actions.favorite')}
                      </span>
                      <span className="ml-1">
                        {scriptState.favorite_count || 0}
                      </span>
                    </Button>
                    <Dropdown
                      trigger={['click']}
                      placement="bottomRight"
                      popupRender={() => (
                        <Card
                          size="small"
                          className="shadow-lg border-0 min-w-[220px]"
                          title={
                            <div className="flex items-center space-x-2">
                              <FolderOutlined />
                              <span>{t('folders.select_folders')}</span>
                            </div>
                          }
                        >
                          <div className="space-y-2">
                            <Checkbox.Group
                              value={selectedFolders.map(String)} // 转换为字符串数组用于 Checkbox.Group
                              onChange={handleFoldersChange}
                              className="w-full"
                            >
                              <div className="space-y-2">
                                {folders.map((folder) => (
                                  <div
                                    key={folder.id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded hover:dark:bg-gray-700"
                                  >
                                    <Checkbox
                                      value={String(folder.id)} // 转换为字符串用于 Checkbox
                                      className="flex-1"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span>{folder.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">
                                          {folder.count}
                                        </span>
                                      </div>
                                    </Checkbox>
                                  </div>
                                ))}
                              </div>
                            </Checkbox.Group>
                            <Divider className="my-2" />
                            <Button
                              type="dashed"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={handleAddFolder}
                              className="w-full"
                            >
                              {t('folders.new_folder')}
                            </Button>
                          </div>
                        </Card>
                      )}
                    >
                      <Button
                        icon={<DownOutlined />}
                        size="small"
                        className="!px-2"
                      />
                    </Dropdown>
                  </Space.Compact>

                  {/* 更多操作 */}
                  <ActionMenu
                    uid={script.user_id}
                    deleteLevel="super_moderator"
                    allowSelfDelete
                    punish
                    onDeleteClick={async () => {
                      await scriptService
                        .deleteScript(script.id)
                        .then(() => {
                          message.success(t('delete.success'));
                          router.push('/');
                        })
                        .catch((e) => {
                          message.error(e.message || t('delete.failed'));
                        });
                    }}
                  >
                    <Button
                      type="default"
                      size="small"
                      className="!p-0"
                      icon={<MoreOutlined />}
                    ></Button>
                  </ActionMenu>
                </div>

                {/* 脚本详情 - 推到底部 */}
                <div>
                  <Card
                    size="small"
                    title={
                      <div className="flex items-center space-x-2">
                        <span>
                          {script.type === 3
                            ? t('info.library_details')
                            : t('info.script_details')}
                        </span>
                      </div>
                    }
                  >
                    <div className="space-y-3">
                      {/* 库模式特殊信息 */}
                      {script.type === 3 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span>{t('info.library_description')}</span>
                          </div>
                        </>
                      )}

                      {/* 通用信息 */}
                      {supportSites.length > 0 && (
                        <div className="flex justify-between items-start">
                          <Text className="text-gray-600 font-medium">
                            {t('info.applicable_sites')}
                          </Text>
                          <div className="text-right max-w-[200px] min-w-[120px]">
                            {renderSupportSites()}
                          </div>
                        </div>
                      )}

                      {(script.script.meta_json.background ||
                        script.script.meta_json.crontab) && (
                        <div className="flex justify-between items-start">
                          <Text className="text-gray-600 font-medium">
                            {t('info.background_script')}
                          </Text>
                          <div className="text-right max-w-[200px] min-w-[120px]">
                            {t('info.background_script_desc')}
                          </div>
                        </div>
                      )}

                      {script.script.meta_json.crontab && (
                        <div className="flex justify-between items-start">
                          <Text className="text-gray-600 font-medium">
                            {t('info.scheduled_script')}
                          </Text>
                          <div className="text-right max-w-[200px] min-w-[120px]">
                            <Tooltip
                              title={t('info.scheduled_script_tooltip', {
                                cron: script.script.meta_json.crontab[0],
                              })}
                            >
                              <Tag
                                color="blue"
                                icon={<ClockCircleOutlined />}
                                className="text-xs"
                              >
                                {parseCrontabDescription(
                                  script.script.meta_json.crontab[0],
                                )}
                              </Tag>
                            </Tooltip>
                          </div>
                        </div>
                      )}

                      {script.script.meta_json.license && (
                        <div className="flex justify-between items-start">
                          <Text className="text-gray-600 font-medium">
                            {t('info.license')}
                          </Text>
                          <Button
                            type="link"
                            href={
                              licenseMap[script.script.meta_json.license[0]] ||
                              '#'
                            }
                            className="text-right max-w-[120px] font-mono"
                          >
                            {script.script.meta_json.license[0]}
                          </Button>
                        </div>
                      )}

                      {script.script.meta_json.compatible && (
                        <div className="flex justify-between items-start">
                          <Text className="text-gray-600 font-medium">
                            {t('info.browser_compatibility')}
                          </Text>
                          <div className="flex space-x-2">
                            {ScriptUtils.browserCompatible(
                              script.script.meta_json,
                            ).map((browser) => (
                              <Tooltip
                                key={browser.name}
                                title={t('info.browser_support', {
                                  browser: browser.name,
                                })}
                              >
                                <Icon
                                  icon={`logos:${browser.logo}`}
                                  className="w-4 h-4"
                                />
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      )}

                      {script.script.meta_json.antifeature && (
                        <div className="flex justify-between items-start">
                          <Text className="text-gray-600 font-medium">
                            {t('info.feature_notice')}
                          </Text>
                          <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                            {ScriptUtils.antiFeatures(
                              script.script.meta_json,
                            ).map((feature) => {
                              const config = antifeatures[feature.key];
                              if (!config) return null;

                              return (
                                <Tooltip
                                  key={feature.key}
                                  title={
                                    config.description +
                                    (feature.description
                                      ? ` - ${feature.description}`
                                      : '')
                                  }
                                  color={config.color}
                                >
                                  <Tag color={config.color} className="text-xs">
                                    {config.title}
                                  </Tag>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 社区与支持 - 统一放在底部 */}
                      {script.post_id !== 0 && (
                        <div className="pt-2 float-end">
                          <Button
                            type="link"
                            icon={<MessageOutlined />}
                            href={`https://bbs.tampermonkey.net.cn/thread-${script.post_id}-1-1.html`}
                            target="_blank"
                            className="!p-0 !h-auto flex items-center"
                          >
                            <span className="text-xs">
                              {t('info.forum_post')}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Badge.Ribbon>

      {/* 功能介绍 */}
      <Card className="shadow-sm">
        <div className="prose max-w-none">
          <MarkdownView id="readme" content={script.content} />
        </div>
      </Card>
    </div>
  );
}
