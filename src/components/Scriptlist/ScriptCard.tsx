'use client';

import {
  Card,
  Button,
  Typography,
  Avatar,
  Tag,
  Tooltip,
  message,
  Badge,
} from 'antd';
import {
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  ShareAltOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link } from '@/i18n/routing';
import { formatNumber, useSemDateTime } from '@/lib/utils/semdate';
import { useLocale, useTranslations } from 'next-intl';
import type { ScriptListItem } from '@/app/[locale]/script-show-page/[id]/types';
import { ScriptUtils } from '@/app/[locale]/script-show-page/[id]/utils';
import { hashColor } from '@/lib/utils/utils';
import type { ReactNode } from 'react';
import { useState } from 'react';
import ActionMenu from '@/components/ActionMenu';
import { scriptService } from '@/lib/api/services/scripts';

const { Text } = Typography;

interface ScriptIconProps {
  script: ScriptListItem;
  size?: number;
}

function ScriptIcon({ script, size = 20 }: ScriptIconProps) {
  const [hasError, setHasError] = useState(false);
  const iconUrl = ScriptUtils.icon(script.script.meta_json);

  if (!iconUrl || hasError) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      src={iconUrl}
      width={size}
      height={size}
      className="flex-shrink-0 rounded"
      onError={() => setHasError(true)}
      onLoad={() => setHasError(false)}
    />
  );
}

interface ActionButton {
  key: string;
  label: ReactNode;
  onClick: (script: ScriptListItem) => void;
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  danger?: boolean;
  icon?: ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

interface ScriptCardProps {
  script: ScriptListItem;
  actions?: ActionButton[];
  onDelete?: (script: ScriptListItem) => void;
}

export default function ScriptCard({
  script,
  actions,
  onDelete,
}: ScriptCardProps) {
  const t = useTranslations('script.card');
  const tCommon = useTranslations('common');
  const semDataTime = useSemDateTime();
  const locale = useLocale();

  const scriptName = ScriptUtils.i18nName(script, locale);
  const scriptDescription = ScriptUtils.i18nDescription(script, locale);

  const score = ScriptUtils.score(script.score, script.score_num);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/script-show-page/${script.id}`;

  const handleCopySuccess = () => {
    message.success(tCommon('copy_success'));
  };

  const handleDeleteScript = async () => {
    try {
      await scriptService.deleteScript(script.id);
      message.success(tCommon('delete_success'));
      onDelete?.(script);
    } catch (error) {
      message.error(tCommon('delete_failed'));
      console.error('Delete script error:', error);
    }
  };

  return (
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
      <Card
        hoverable
        onClick={() => {
          // 在新页面中打开脚本详情页面，保持国际化路由
          const url = `/${locale}/script-show-page/${script.id}`;
          window.open(url, '_blank');
        }}
        styles={{
          body: { padding: '20px' },
        }}
        className="transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* 主标题区域 - 脚本图标 + 标题 + 版本 */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 mt-1">
                <ScriptIcon script={script} size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link
                    href={'/script-show-page/' + script.id}
                    className="text-lg font-semibold !text-gray-900 dark:!text-white hover:!text-[#1677ff] line-clamp-1 leading-tight"
                    target="_blank"
                    title={scriptName}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {scriptName}
                  </Link>
                  <Tooltip
                    title={t('latest_script_version', {
                      version: script.script.version,
                    })}
                    color="red"
                    placement="bottom"
                  >
                    <Tag
                      color="red"
                      bordered={false}
                      className="text-xs px-1 py-0"
                    >
                      {'v' + script.script.version}
                    </Tag>
                  </Tooltip>
                </div>

                {/* 作者信息区域 - 更紧凑的布局 */}
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/users/${script.user_id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 hover:text-[#1677ff] transition-colors"
                  >
                    <Avatar
                      size={16}
                      src={script.avatar}
                      icon={<UserOutlined />}
                      className="flex-shrink-0"
                    />
                    <Text
                      type="secondary"
                      className="hover:!text-[#1677ff] text-xs"
                    >
                      {script.username}
                    </Text>
                  </Link>

                  {script.category && (
                    <Tooltip title={script.category.name} placement="bottom">
                      <Tag
                        color={hashColor(script.category.name)}
                        bordered
                        className="text-xs px-1 py-0"
                      >
                        {script.category.name}
                      </Tag>
                    </Tooltip>
                  )}

                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-600 dark:text-green-400 font-medium text-xs">
                      {t('today_installs', {
                        count: script.today_install,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4 overflow-hidden"
              title={scriptDescription}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {scriptDescription}
            </div>
          </div>

          <div className="ml-6 flex flex-col items-end gap-2">
            <div className="flex items-center w-full justify-end gap-2">
              <div className="flex items-center gap-1">
                <StarOutlined />
                <Text className="text-sm font-medium !text-yellow-500">
                  {score || '-'}
                </Text>
              </div>
              <ActionMenu
                uid={script.user_id}
                deleteLevel="admin"
                allowSelfDelete={true}
                onDeleteClick={handleDeleteScript}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  className="!text-gray-500 hover:!text-gray-700 dark:!text-gray-400 dark:hover:!text-gray-200"
                  onClick={(e) => e.stopPropagation()}
                />
              </ActionMenu>
            </div>
            <div className="flex flex-col gap-2">
              {actions && actions.length > 0 && (
                <div className="flex flex-col gap-1">
                  {actions.map((action) => {
                    const buttonElement = (
                      <Button
                        key={action.key}
                        type={action.type || 'default'}
                        danger={action.danger}
                        size="small"
                        icon={action.icon}
                        disabled={action.disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(script);
                        }}
                        className="w-full"
                      >
                        {action.label}
                      </Button>
                    );

                    return action.tooltip ? (
                      <Tooltip
                        key={action.key}
                        title={action.tooltip}
                        placement="left"
                      >
                        {buttonElement}
                      </Tooltip>
                    ) : (
                      buttonElement
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          {/* 统计信息 */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <DownloadOutlined className="text-blue-500" />
              <Text type="secondary" className="font-medium">
                {formatNumber(script.total_install)}
              </Text>
              <Text type="secondary" className="text-xs">
                {t('downloads')}
              </Text>
            </div>

            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <CalendarOutlined className="text-green-500" />
              <Text type="secondary" className="text-xs">
                {semDataTime(script.updatetime)}
              </Text>
            </div>

            <Tooltip title={t('share_link')} placement="bottom">
              <CopyToClipboard
                text={scriptName + '\n' + shareUrl}
                onCopy={handleCopySuccess}
              >
                <Button
                  icon={<ShareAltOutlined />}
                  type="text"
                  size="small"
                  className="!text-gray-500 hover:!text-blue-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </CopyToClipboard>
            </Tooltip>
          </div>

          {/* 标签区域 */}
          <div className="flex items-center gap-1.5 flex-wrap max-w-[40%]">
            {script.type === 3 && (
              <Tooltip title={t('library_tooltip')} color="blue">
                <Tag color="blue" className="text-xs px-1 py-0 border-blue-300">
                  {t('library_tag')}
                </Tag>
              </Tooltip>
            )}
            {script.tags.map((tag) => (
              <Tooltip
                title={t('tag_label', { name: tag.name })}
                placement="bottom"
                key={tag.id}
              >
                <Tag
                  color={hashColor(tag.name)}
                  className="text-xs px-1 py-0 max-w-[80px] truncate"
                >
                  {'#' + tag.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        </div>
      </Card>
    </Badge.Ribbon>
  );
}
