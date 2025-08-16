'use client';

import { Card, List, Avatar, Tag, Typography, Space } from 'antd';
import { Link } from '@/i18n/routing';
import { ScriptUtils } from '@/app/[locale]/script-show-page/[id]/utils';
import { hashColor } from '@/lib/utils/utils';
import { ReactNode } from 'react';
import type { ScriptItem } from '@/types/script';
import type { ScriptListItem } from '@/app/[locale]/script-show-page/[id]/types';

const { Text } = Typography;

interface ScriptListCardProps {
  title: ReactNode;
  data: ScriptItem[] | ScriptListItem[];
  maxItems?: number;
  icon?: ReactNode;
  className?: string;
}

// 类型守卫函数
function isScriptListItem(item: ScriptItem | ScriptListItem): item is ScriptListItem {
  return 'script' in item && 'name' in item;
}

export default function ScriptListCard({
  title,
  data,
  maxItems = 5,
  icon,
  className = '',
}: ScriptListCardProps) {
  const displayData = data.slice(0, maxItems);

  return (
    <Card
      size="small"
      title={
        <Space>
          {icon}
          <Text strong>{title}</Text>
        </Space>
      }
      className={`border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800 ${className}`}
      bodyStyle={{ padding: '8px 12px' }}
    >
      <List
        dataSource={displayData as any[]}
        renderItem={(item, index) => {
          let scriptIcon: string | null = null;
          let itemTitle: string;
          let itemId: number;

          if (isScriptListItem(item)) {
            // ScriptListItem 类型
            scriptIcon = item.script?.meta_json
              ? ScriptUtils.icon(item.script.meta_json)
              : null;
            itemTitle = item.name;
            itemId = item.id;
          } else {
            // ScriptItem 类型
            scriptIcon = item.meta_json
              ? ScriptUtils.icon(item.meta_json)
              : null;
            itemTitle = item.title;
            itemId = item.id;
          }

          return (
            <List.Item className="!px-0 !py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200">
              <Link href={`/script-show-page/${itemId}`}>
                <div className="flex items-center gap-3 w-full px-2">
                  {scriptIcon ? (
                    <Avatar size={24} src={scriptIcon} shape="square" />
                  ) : (
                    <Tag
                      className="!m-0"
                      color={hashColor((index + 1).toString())}
                      style={index === 9 ? { padding: '0 3px' } : {}}
                    >
                      {index + 1}
                    </Tag>
                  )}
                  <div className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block">
                      {itemTitle}
                    </Text>
                  </div>
                </div>
              </Link>
            </List.Item>
          );
        }}
      />
    </Card>
  );
}
