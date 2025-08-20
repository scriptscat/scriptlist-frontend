'use client';

import { Avatar, Tag } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { ReplyItemProps } from './types';
import { useSemDateTime } from '@/lib/utils/semdate';

export default function ReplyItem({
  reply,
  ratingId,
  onDelete,
}: ReplyItemProps) {
  const t = useTranslations('script.rating');
  const semDateTime = useSemDateTime();

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-200 dark:border-blue-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Link href={`/users/${reply.user_id}`} target="_blank">
            <Avatar
              size="small"
              src={reply.avatar}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <UserOutlined />
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/users/${reply.user_id}`}
                className="hover:opacity-80 transition-opacity"
                target="_blank"
              >
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {reply.username}
                </span>
              </Link>
              {reply.is_author === 1 && (
                <Tag className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 text-xs px-2 py-0">
                  {t('author_tag')}
                </Tag>
              )}
              {reply.is_admin === 1 && (
                <Tag className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 text-xs px-2 py-0">
                  {t('admin_tag')}
                </Tag>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ClockCircleOutlined />
                <span>{semDateTime(reply.createtime)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {reply.content}
            </p>
          </div>
        </div>

        {/* <ActionMenu
          uid={reply.user_id}
          deleteLevel="super_moderator"
          allowSelfDelete={false}
          onDeleteClick={async () => {
            await onDelete(ratingId, reply.id);
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            className="text-gray-400 hover:text-red-500"
          />
        </ActionMenu> */}
      </div>
    </div>
  );
}
