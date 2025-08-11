'use client';

import {
  Card,
  Button,
  Space,
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
} from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link } from '@/i18n/routing';
import { formatNumber, useSemDateTime } from '@/lib/utils/semdate';
import { useLocale, useTranslations } from 'next-intl';
import { ScriptListItem } from '@/app/[locale]/script-show-page/[id]/types';
import { ScriptUtils } from '@/app/[locale]/script-show-page/[id]/utils';
import { hashColor } from '@/lib/utils/utils';
import { ReactNode } from 'react';

const { Text, Title } = Typography;

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
}

export default function ScriptCard({ script, actions }: ScriptCardProps) {
  const t = useTranslations();
  const semDataTime = useSemDateTime();
  const locale = useLocale();
  const [messageApi, contextHolder] = message.useMessage();

  const score = ScriptUtils.score(script.score, script.score_num);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/script-show-page/${script.id}`;

  const handleCopySuccess = () => {
    messageApi.success(t('copy_success'));
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
          body: { padding: '24px' },
        }}
      >
        {contextHolder}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={'/script-show-page/' + script.id}
                className="text-lg !text-black dark:!text-white hover:!text-[#1677ff] line-clamp-2 leading-tight"
                target="_blank"
                title={script.name}
                onClick={(e) => e.stopPropagation()}
              >
                {script.name}
              </Link>
              <Tooltip
                title={t('latest_script_version', {
                  version: script.script.version,
                })}
                color="red"
                placement="bottom"
              >
                <Tag color="red" className="text-xs" bordered={false}>
                  v{script.script.version}
                </Tag>
              </Tooltip>
            </div>

            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm mb-2">
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
                  <Text type="secondary" className="hover:!text-[#1677ff]">
                    {script.username}
                  </Text>
                </Space>
              </Link>
              {script.category && (
                <Tooltip title={script.category.name} placement="bottom">
                  <Tag color={hashColor(script.category.name)} bordered>
                    {script.category.name}
                  </Tag>
                </Tooltip>
              )}
              <span className="text-green-600 dark:text-green-400 font-medium">
                今日 +{script.today_install}
              </span>
            </div>

            <div
              className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4 overflow-hidden"
              title={script.description}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {script.description}
            </div>
          </div>

          <div className="ml-6 flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              <StarOutlined />
              <Text className="text-sm font-medium !text-yellow-500">
                {score || '-'}
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/script-show-page/${script.id}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <Button type="primary">查看详情</Button>
              </Link>
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
                      <Tooltip key={action.key} title={action.tooltip} placement="left">
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

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <Space size="small">
              <DownloadOutlined />
              <Text type="secondary">
                {formatNumber(script.total_install)} 下载
              </Text>
            </Space>
            <Space size="small">
              <CalendarOutlined />
              <Text type="secondary">
                更新于 {semDataTime(script.updatetime)}
              </Text>
            </Space>
            <Space size="small">
              <Tooltip title={t('share_link')} placement="bottom">
                <CopyToClipboard
                  text={script.name + '\n' + shareUrl}
                  onCopy={handleCopySuccess}
                >
                  <Button
                    icon={
                      <Text type="secondary">
                        <ShareAltOutlined />
                      </Text>
                    }
                    type="text"
                    size="small"
                    className="anticon-middle copy-script-link"
                    onClick={(e) => e.stopPropagation()}
                  />
                </CopyToClipboard>
              </Tooltip>
            </Space>
          </div>

          <div className="flex items-center space-x-2">
            {script.tags.map((tag) => (
              <Tooltip
                title={'标签：' + tag.name}
                placement="bottom"
                key={tag.id}
              >
                <Tag key={tag.id} color={hashColor(tag.name)}>
                  #{tag.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        </div>
      </Card>
    </Badge.Ribbon>
  );
}
