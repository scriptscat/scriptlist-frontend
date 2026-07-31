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
  Tabs,
} from 'antd';
import {
  DownloadOutlined,
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
import React, { useState, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useScript, useScriptState } from './ScriptContext';
import { useUser } from '@/contexts/UserContext';
import { useSemDateTime, formatCompactNumber } from '@/lib/utils/semdate';
import { Link, useRouter } from '@/i18n/routing';
import dynamic from 'next/dynamic';
const MarkdownView = dynamic(() => import('@/components/MarkdownView'));
import { ScriptUtils } from '../utils';
import { getLicenseDisplay } from '@/lib/license';
import { copyToClipboard, hashColor } from '@/lib/utils/utils';
import { checkScriptInstalled } from '@/lib/utils/script-manager';
import { folderDisplayName } from '@/lib/utils/favorite-folder';
import { useScriptInstallGuide } from '@/components/ScriptInstallGuide';
import { SCRIPTCAT_INSTALL_GUIDE_URL } from '@/lib/constants/browserStores';
import { useScriptWatch, useScriptFavorite } from '@/lib/api/hooks';
import { WatchLevel } from '../types';
import { scriptService } from '@/lib/api/services/scripts';
import { aiReviewService } from '@/lib/api/services/aiReview';
import { useTranslations } from 'next-intl';
import ActionMenu from '@/components/ActionMenu';
import AdSlot from '@/components/AdSlot';
import ScriptIcon from '@/components/ScriptIcon';
import type { AdSlotItem } from '@/lib/api/services/advertise';
import ScriptVersionsClient from '../version/components/ScriptVersionsClient';
import ScriptRatingClient from '../comment/components/ScriptRatingClient';
import ScriptMetadataExplainer from './ScriptMetadataExplainer';
import ScriptPermissionsCard from './overview/ScriptPermissionsCard';
import type {
  ScoreListItem,
  VersionListResponse,
  VersionStatResponse,
} from '@/lib/api/services/scripts/scripts';
import { APIError } from '@/types/api';
import type { ListData } from '@/types/api';
import type { RatingStats } from '../comment/components/rating';

const { Title, Text, Paragraph } = Typography;

interface ScriptDetailClientProps {
  content: string;
  /** 说明同步自远端 README 时，其中相对路径的解析基准（文档目录 / 仓库根）。 */
  contentBaseUrl?: string;
  contentRootUrl?: string;
  initialVersionData: VersionListResponse | null;
  versionStat: VersionStatResponse | null;
  versionError?: string;
  initialScoreList: ListData<ScoreListItem> | null;
  initialRatingStats: RatingStats;
  /** 服务端预取的 script-detail-sidebar 广告数据（SSR）。 */
  sidebarAd?: { ad: AdSlotItem | null };
  /** 服务端预取的 script-detail-banner 广告数据（SSR）。 */
  bannerAd?: { ad: AdSlotItem | null };
}

function CountChip({ value }: { value: number }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
      {value}
    </span>
  );
}

function AISummary({ summary }: { summary: string }) {
  const t = useTranslations('script.detail');
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="mb-4 rounded-md border-l-[3px] border-indigo-500 bg-indigo-50 px-3.5 py-2.5 dark:border-indigo-400 dark:bg-indigo-950/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5"
        aria-expanded={expanded}
      >
        <Icon
          icon="mdi:auto-awesome"
          className="flex-shrink-0 text-base text-indigo-600 dark:text-indigo-400"
        />
        <span className="text-xs font-semibold tracking-wide text-indigo-700 dark:text-indigo-300">
          {t('summary.label')}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={`ml-auto flex-shrink-0 text-base text-indigo-400 transition-transform dark:text-indigo-500 ${
            expanded ? '' : '-rotate-90'
          }`}
        />
      </button>
      {expanded && (
        <div className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {summary}
        </div>
      )}
    </div>
  );
}

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

export default function ScriptDetailClient({
  content,
  contentBaseUrl,
  contentRootUrl,
  initialVersionData,
  versionStat,
  versionError,
  initialScoreList,
  initialRatingStats,
  sidebarAd,
  bannerAd,
}: ScriptDetailClientProps) {
  const { script } = useScript();
  const scriptState = useScriptState();
  const { user } = useUser();
  const [showAllSites, setShowAllSites] = useState(false);
  const [requireSelect, setRequireSelect] = useState<number>(1); // 库模式的选择状态
  const [reviewing, setReviewing] = useState(false);
  const semDateTime = useSemDateTime();
  const [modal, contextHolder] = Modal.useModal();
  const t = useTranslations('script.detail');
  const commonT = useTranslations('common');
  const adminScriptsT = useTranslations('admin.scripts');
  const router = useRouter();
  const isAdmin = !!user && user.is_admin >= 1;

  const [installTitle, setInstallTitle] = useState(t('install.install_script')); // 安装按钮文案
  const { handleInstallClick, guideModal } = useScriptInstallGuide(); // 未检测到脚本管理器时的二次引导
  const installUrl = useMemo(
    () =>
      `/scripts/code/${script.id}/${encodeURIComponent(script.name)}.user.js`,
    [script.id, script.name],
  );
  const preReleaseUrl = useMemo(
    () =>
      `/scripts/pre/${script.id}/${encodeURIComponent(script.name)}.user.js`,
    [script.id, script.name],
  );

  // 解析crontab表达式为更友好的描述
  const parseCrontabDescription = useCallback(
    (cron: string): string => {
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
          return t('crontab.daily_at_hours', {
            hours: hour.replace(/,/g, '、'),
          });
        }
        return t('crontab.daily_at_hours', { hours: hour });
      }

      if (minute.includes('/')) {
        const interval = minute.split('/')[1];
        return t('crontab.every_n_minutes', { interval });
      }

      return cron; // 返回原始表达式
    },
    [t],
  );

  const scriptName = useMemo(
    () => ScriptUtils.i18nName(script, router.locale),
    [script, router.locale],
  );
  const scriptDescription = useMemo(
    () => ScriptUtils.i18nDescription(script, router.locale),
    [script, router.locale],
  );

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
            setInstallTitle(t('install.reinstall_script'));
          } else {
            setInstallTitle(t('install.update_script'));
          }
        }
      })
      .catch((error) => {
        console.warn(t('install.install_check_failed'), error);
      });
  }, [script]);

  // AntiFeatures 配置
  const antifeatures = useMemo<{
    [key: string]: { color: string; title: string; description: string };
  }>(
    () => ({
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
    }),
    [t],
  );

  // 计算是否已收藏（有选中的收藏夹）
  const isFavorited = useMemo(
    () => selectedFolders.length > 0,
    [selectedFolders],
  );

  // 处理适用网站显示
  const supportSites = useMemo(() => {
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
  }, [script.script.meta_json]);

  // 优化的渲染适用网站组件
  const renderSupportSites = useMemo(() => {
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
  }, [supportSites, showAllSites, t]);

  // 复制库链接到剪贴板
  const handleCopyRequire = useCallback(
    async (requireLink: string) => {
      try {
        copyToClipboard(requireLink);
        message.success(t('copy.copied_to_clipboard'));
      } catch (_error) {
        message.error(t('copy.copy_failed'));
      }
    },
    [t],
  );

  // 分享脚本 - 复制脚本名称和链接
  const handleShare = useMemo(() => {
    const currentUrl =
      process.env.NEXT_PUBLIC_APP_URL +
      `/${router.locale}/script-show-page/${script.id}`;
    const shareText = `${scriptName}\n${currentUrl}`;
    return shareText;
  }, [scriptName, router.locale, script.id]);

  // 移动端：将分享收进“更多”菜单，复制分享内容到剪贴板
  const handleShareCopy = useCallback(() => {
    copyToClipboard(handleShare);
    message.success(t('copy.share_copied'));
  }, [handleShare, t]);

  const handleFollowChange = useCallback(
    async (value: string) => {
      const watchLevelMap: { [key: string]: WatchLevel } = {
        none: WatchLevel.NONE,
        version: WatchLevel.VERSION,
        feedback: WatchLevel.FEEDBACK,
        all: WatchLevel.ALL,
      };

      const newWatchLevel = watchLevelMap[value] ?? WatchLevel.NONE;
      await updateWatch(newWatchLevel);
    },
    [updateWatch],
  );

  // 处理收藏夹变更
  const handleFoldersChange = useCallback(
    async (checkedValues: string[]) => {
      const numberIds = checkedValues.map((id) => parseInt(id, 10));
      setSelectedFolders(numberIds);

      try {
        await updateFavorites(numberIds);
      } catch (error) {
        // updateFavorites 中已经处理了错误消息
        console.error(t('folders.favorite_update_failed'), error);
      }
    },
    [updateFavorites, t],
  );

  // 添加新收藏夹
  const handleAddFolder = useCallback(async () => {
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
  }, [modal, createFolder, t]);

  // 原有的收藏处理函数改为快速收藏到默认收藏夹
  const handleQuickFavorite = useCallback(async () => {
    try {
      await quickFavorite();
    } catch (error) {
      console.error(t('folders.quick_favorite_failed'), error);
    }
  }, [quickFavorite, t]);

  const handleCopyRequireClick = useCallback(() => {
    const requireLink =
      requireSelect == 1
        ? genRequire(script.id, script.name, script.script.version, script.sri)
        : requireSelect == 2
          ? genRequire(script.id, script.name, '^' + script.script.version)
          : genRequire(script.id, script.name, '~' + script.script.version);
    handleCopyRequire(requireLink);
  }, [
    requireSelect,
    script.id,
    script.name,
    script.script.version,
    script.sri,
    handleCopyRequire,
  ]);

  const handleOpenInstallGuide = useCallback(() => {
    window.open(SCRIPTCAT_INSTALL_GUIDE_URL, '_blank', 'noopener,noreferrer');
  }, []);

  const handleDeleteClick = useCallback(
    async (reason?: string) => {
      await scriptService
        .deleteScript(script.id, reason)
        .then(() => {
          message.success(t('delete.success'));
          router.push('/');
        })
        .catch((e) => {
          message.error(e.message || t('delete.failed'));
        });
    },
    [script.id, t, router],
  );

  const handleAIReview = useCallback(async () => {
    setReviewing(true);
    try {
      await aiReviewService.triggerScriptReview(script.id);
      message.success(adminScriptsT('ai_review_success'));
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error(commonT('delete_failed'));
      }
    } finally {
      setReviewing(false);
    }
  }, [adminScriptsT, commonT, script.id]);

  const watchMenuProps = useMemo(
    () => ({
      items: [
        { key: 'none', label: t('actions.watch_options.none') },
        { key: 'version', label: t('actions.watch_options.version') },
        { key: 'feedback', label: t('actions.watch_options.feedback') },
        { key: 'all', label: t('actions.watch_options.all') },
      ],
      onClick: ({ key }: { key: string }) => handleFollowChange(key),
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
    }),
    [t, handleFollowChange, watchLevel],
  );

  // 收藏夹选择弹层（桌面侧栏与移动端操作区共用）
  const renderFolderPopup = useCallback(
    () => (
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
                      <span>
                        {folderDisplayName(
                          folder,
                          commonT('default_favorite_folder_name'),
                        )}
                      </span>
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
    ),
    [
      t,
      commonT,
      selectedFolders,
      handleFoldersChange,
      folders,
      handleAddFolder,
    ],
  );

  const detailTabs = useMemo(
    () => [
      {
        key: 'description',
        label: t('tabs.description'),
        children: (
          <div>
            {script.summary && <AISummary summary={script.summary} />}
            <div className="prose prose-sm max-w-3xl dark:prose-invert">
              <MarkdownView
                id="readme"
                content={content}
                resourceBaseUrl={contentBaseUrl}
                resourceRootUrl={contentRootUrl}
              />
            </div>
          </div>
        ),
      },
      {
        key: 'versions',
        label: (
          <span className="inline-flex items-center">
            {t('tabs.versions')}
            <CountChip value={initialVersionData?.total ?? 0} />
          </span>
        ),
        children: (
          <ScriptVersionsClient
            initialVersionData={initialVersionData}
            versionStat={versionStat}
            initialPage={1}
            initialPageSize={10}
            embedded
            initialError={versionError}
          />
        ),
      },
      {
        key: 'ratings',
        label: (
          <span className="inline-flex items-center">
            {t('tabs.ratings')}
            <CountChip value={initialRatingStats.totalRatings} />
          </span>
        ),
        children: (
          <ScriptRatingClient
            initialData={initialScoreList}
            initialRatingStats={initialRatingStats}
            scriptId={script.id}
            embedded
          />
        ),
      },
      {
        key: 'metadata',
        label: t('tabs.metadata'),
        children: <ScriptMetadataExplainer meta={script.script.meta_json} />,
      },
    ],
    [
      content,
      initialRatingStats,
      initialScoreList,
      initialVersionData,
      script.id,
      script.summary,
      script.script.meta_json,
      t,
      versionError,
      versionStat,
    ],
  );

  // 数据统计卡（桌面侧栏与移动端共用，移动端展示在描述上方）
  const statsCard = (
    <Card
      size="small"
      title={t('stats.title')}
      className="!rounded-xl"
      classNames={{ body: '!p-4' }}
    >
      <Row gutter={16}>
        <Col span={8} className="text-center">
          <Statistic
            title={t('stats.total_installs')}
            value={script.total_install}
            formatter={(v) => formatCompactNumber(Number(v))}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={8} className="text-center">
          <Statistic
            title={t('stats.today_installs')}
            value={script.today_install}
            formatter={(v) => formatCompactNumber(Number(v))}
            valueStyle={{ color: '#52c41a' }}
            prefix="+"
          />
        </Col>
        <Col span={8} className="text-center">
          <Statistic
            title={t('stats.user_rating')}
            value={ScriptUtils.score(script.score, script.score_num) || '-'}
            precision={1}
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
      </Row>
    </Card>
  );

  return (
    <div>
      {contextHolder}
      {guideModal}
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
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_336px]">
          {/* 左·主内容 */}
          <div className="min-w-0">
            <div className="flex flex-col gap-4">
              {/* 头部卡：头像/标题/作者·创建于/简介/标签 */}
              <Card className="shadow-sm">
                <div className="flex items-start space-x-4">
                  <ScriptIcon
                    script={script}
                    name={scriptName}
                    size={64}
                    radius={8}
                    textSize="text-2xl"
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
                            variant="filled"
                          >
                            {'#' + tag.name}
                          </Tag>
                        </Tooltip>
                      ))}
                    </Space>
                  </div>
                </div>
              </Card>

              {/* 移动端操作区：信息卡片下方展示安装/关注/收藏/更多（桌面端在右侧栏） */}
              {script.type !== 3 && (
                <div className="flex flex-col gap-2 lg:hidden">
                  <Space.Compact className="w-full">
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      className="flex-1 bg-gradient-to-r"
                      href={installUrl}
                      target="_blank"
                      onClick={(e) => handleInstallClick(e, installUrl)}
                    >
                      {installTitle + ' · v' + script.script.version}
                    </Button>
                    <Tooltip title={t('actions.install_guide')}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<QuestionCircleOutlined />}
                        onClick={handleOpenInstallGuide}
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
                          href={preReleaseUrl}
                          target="_blank"
                          onClick={(e) => handleInstallClick(e, preReleaseUrl)}
                          icon={<ExperimentOutlined />}
                          style={{
                            background: '#f98116',
                            borderColor: '#f98116',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Space.Compact>

                  <div className="flex gap-2">
                    <Dropdown
                      trigger={['click']}
                      placement="bottomLeft"
                      menu={watchMenuProps}
                    >
                      <Button
                        icon={isWatched ? <EyeFilled /> : <EyeOutlined />}
                        size="large"
                        className="flex-1 min-w-0 flex items-center justify-center"
                        loading={watchLoading}
                      >
                        <span className="min-w-0 truncate">
                          {t('actions.watch')}
                        </span>
                        <span className="ml-1 flex-none">
                          {scriptState.watch_count || 0}
                        </span>
                        <DownOutlined className="ml-1 flex-none" />
                      </Button>
                    </Dropdown>

                    <Space.Compact className="flex-1 min-w-0">
                      <Button
                        icon={isFavorited ? <StarFilled /> : <StarOutlined />}
                        onClick={handleQuickFavorite}
                        size="large"
                        className="flex-1 min-w-0 flex items-center justify-center"
                        loading={favoriteLoading}
                      >
                        <span className="min-w-0 truncate">
                          {t('actions.favorite')}
                        </span>
                        <span className="ml-1 flex-none">
                          {scriptState.favorite_count || 0}
                        </span>
                      </Button>
                      <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        popupRender={renderFolderPopup}
                      >
                        <Button
                          icon={<DownOutlined />}
                          size="large"
                          className="!px-2"
                        />
                      </Dropdown>
                    </Space.Compact>

                    <ActionMenu
                      uid={script.user_id}
                      deleteLevel="super_moderator"
                      allowSelfDelete
                      punish
                      scriptId={script.id}
                      onDeleteClick={handleDeleteClick}
                      allowAIReview={isAdmin}
                      aiReviewLoading={reviewing}
                      onAIReviewClick={handleAIReview}
                      onShareClick={handleShareCopy}
                    >
                      <Button
                        type="default"
                        size="large"
                        className="!px-2"
                        icon={<MoreOutlined />}
                      />
                    </ActionMenu>
                  </div>
                </div>
              )}

              {/* 数据统计卡（移动端展示在描述上方；桌面端在右侧栏） */}
              <div className="lg:hidden">{statsCard}</div>

              {/* 详情页横幅广告：主内容列内，Tab 卡上方；无广告时不渲染、不占位 */}
              <AdSlot
                slot="script-detail-banner"
                variant="banner"
                initialData={bannerAd}
              />

              {/* 内容 Tab 卡 */}
              <Card className="shadow-sm" classNames={{ body: '!p-0' }}>
                <Tabs
                  items={detailTabs}
                  size="middle"
                  classNames={{
                    header: '!mb-0 !px-4 sm:!px-6',
                    content: '!px-4 !py-5 sm:!px-6 sm:!pb-6',
                  }}
                />
              </Card>
            </div>
          </div>

          {/* 右·侧栏（sticky） */}
          <div className="min-w-0">
            <div className="lg:sticky lg:top-4 flex flex-col gap-4">
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
                    onChange={setRequireSelect}
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
                  <Tooltip placement="bottom" title={t('require.copy_tooltip')}>
                    <Button
                      type="default"
                      icon={<CopyOutlined />}
                      onClick={handleCopyRequireClick}
                    ></Button>
                  </Tooltip>
                  <Tooltip placement="bottom" title={t('require.usage_guide')}>
                    <Button
                      type="primary"
                      href="https://bbs.tampermonkey.net.cn/thread-249-1-1.html"
                      target="_blank"
                      icon={<QuestionCircleOutlined />}
                    ></Button>
                  </Tooltip>
                </Space.Compact>
              ) : (
                // 脚本模式 - 桌面端安装按钮（移动端在头部卡片下方展示）
                <div className="hidden w-full lg:block">
                  <Space.Compact className="w-full">
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      className="flex-1 bg-gradient-to-r"
                      href={installUrl}
                      target="_blank"
                      onClick={(e) => handleInstallClick(e, installUrl)}
                    >
                      {installTitle + ' · v' + script.script.version}
                    </Button>
                    <Tooltip title={t('actions.install_guide')}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<QuestionCircleOutlined />}
                        onClick={handleOpenInstallGuide}
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
                          href={preReleaseUrl}
                          target="_blank"
                          onClick={(e) => handleInstallClick(e, preReleaseUrl)}
                          icon={<ExperimentOutlined />}
                          style={{
                            background: '#f98116',
                            borderColor: '#f98116',
                          }}
                        ></Button>
                      </Tooltip>
                    )}
                  </Space.Compact>
                </div>
              )}

              {/* GitHub风格的操作按钮组（移动端隐藏，操作区已上移） */}
              <div
                className={`flex gap-1.5${
                  script.type !== 3 ? ' hidden lg:flex' : ''
                }`}
              >
                {/* 关注按钮组 */}
                <Dropdown
                  trigger={['click']}
                  placement="bottomRight"
                  menu={watchMenuProps}
                >
                  <Button
                    icon={isWatched ? <EyeFilled /> : <EyeOutlined />}
                    size="small"
                    className="flex-1 min-w-0 flex items-center justify-center"
                    loading={watchLoading}
                  >
                    <span className="min-w-0 truncate">
                      {t('actions.watch')}
                    </span>
                    <span className="ml-1 flex-none">
                      {scriptState.watch_count || 0}
                    </span>
                    <DownOutlined className="ml-1 flex-none" />
                  </Button>
                </Dropdown>

                {/* 收藏按钮组 */}
                <Space.Compact className="flex-1 min-w-0">
                  <Button
                    icon={isFavorited ? <StarFilled /> : <StarOutlined />}
                    onClick={handleQuickFavorite}
                    size="small"
                    className="flex-1 min-w-0 flex items-center justify-center"
                    loading={favoriteLoading}
                  >
                    <span className="min-w-0 truncate">
                      {t('actions.favorite')}
                    </span>
                    <span className="ml-1 flex-none">
                      {scriptState.favorite_count || 0}
                    </span>
                  </Button>
                  <Dropdown
                    trigger={['click']}
                    placement="bottomRight"
                    popupRender={renderFolderPopup}
                  >
                    <Button
                      icon={<DownOutlined />}
                      size="small"
                      className="!px-1.5"
                    />
                  </Dropdown>
                </Space.Compact>

                {/* 更多操作 */}
                <ActionMenu
                  uid={script.user_id}
                  deleteLevel="super_moderator"
                  allowSelfDelete
                  punish
                  scriptId={script.id}
                  onDeleteClick={handleDeleteClick}
                  allowAIReview={isAdmin}
                  aiReviewLoading={reviewing}
                  onAIReviewClick={handleAIReview}
                  onShareClick={handleShareCopy}
                >
                  <Button
                    type="default"
                    size="small"
                    className="!px-2"
                    icon={<MoreOutlined />}
                  />
                </ActionMenu>
              </div>

              {/* 数据统计卡（移动端已在描述上方展示，这里仅桌面端） */}
              <div className="hidden lg:block">{statsCard}</div>

              <div className="hidden lg:block">
                <AdSlot
                  slot="script-detail-sidebar"
                  variant="card"
                  initialData={sidebarAd}
                />
              </div>

              {/* 脚本详情 - 推到底部 */}
              <div>
                <Card
                  size="small"
                  className="!rounded-xl"
                  classNames={{ body: '!p-4' }}
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
                          {renderSupportSites}
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

                    {(() => {
                      const licenseRaw = script.script.meta_json.license?.[0];
                      if (licenseRaw) {
                        const ld = getLicenseDisplay(licenseRaw);
                        const label =
                          ld.category === 'proprietary'
                            ? t('info.license_no_derivative')
                            : ld.canonical;
                        const tag = (
                          <Tag color={ld.color} className="font-mono !m-0">
                            {label}
                          </Tag>
                        );
                        return (
                          <div className="flex justify-between items-center">
                            <Text className="text-gray-600 font-medium">
                              {t('info.license')}
                            </Text>
                            {ld.url ? (
                              <a
                                href={ld.url}
                                target="_blank"
                                rel="noreferrer"
                                className="max-w-[160px] text-right"
                              >
                                {tag}
                              </a>
                            ) : (
                              tag
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="flex justify-between items-start">
                          <Text className="text-gray-600 font-medium">
                            {t('info.license')}
                          </Text>
                          <div className="text-right max-w-[180px]">
                            <Tooltip title={t('info.license_none_warning')}>
                              <Tag className="!m-0">
                                {t('info.license_none')}
                              </Tag>
                            </Tooltip>
                            <div className="mt-1">
                              <Text type="warning" className="text-xs">
                                {t('info.license_none_warning')}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

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
                                <Tag
                                  color={config.color}
                                  className="text-xs"
                                  variant="solid"
                                >
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
                      <div className="pt-2 flex justify-end">
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

              <ScriptPermissionsCard meta={script.script.meta_json} />
            </div>
          </div>
        </div>
      </Badge.Ribbon>
    </div>
  );
}
