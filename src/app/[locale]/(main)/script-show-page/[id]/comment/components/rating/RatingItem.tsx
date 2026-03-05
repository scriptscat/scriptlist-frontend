'use client';

import { Card, Rate, Button, Input, Avatar, Divider } from 'antd';
import {
  StarFilled,
  UserOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import ActionMenu from '@/components/ActionMenu';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import ReplyItem from './ReplyItem';
import type { RatingItemProps } from './types';
import { useSemDateTime } from '@/lib/utils/semdate';
import { useScript } from '../../../components/ScriptContext';

const { TextArea } = Input;

export default function RatingItem({
  rating,
  onReply,
  onDeleteRating,
  onDeleteReply,
}: RatingItemProps) {
  const { user } = useUser();
  const { script } = useScript();
  const t = useTranslations();
  const [replyContent, setReplyContent] = useState<string>('');
  const [showReplyBox, setShowReplyBox] = useState<boolean>(false);
  const semDateTime = useSemDateTime();

  const handleReply = async () => {
    if (!replyContent?.trim()) {
      return;
    }

    try {
      await onReply(rating.id, replyContent.trim());
      setReplyContent('');
      setShowReplyBox(false);
    } catch {
      // 错误处理由父组件处理
    }
  };

  return (
    <Card
      size="small"
      className="shadow-sm border-0 rounded-xl hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-6">
        {/* 评价头部 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Link href={`/users/${rating.user_id}`} target="_blank">
              <Avatar
                src={rating.avatar}
                size="large"
                className="ring-2 ring-gray-100 dark:ring-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <UserOutlined />
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href={`/users/${rating.user_id}`}
                  className="hover:opacity-80 transition-opacity"
                  target="_blank"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {rating.username}
                  </h4>
                </Link>
                <Rate
                  disabled
                  value={rating.score / 10}
                  className="text-sm"
                  character={<StarFilled />}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ClockCircleOutlined />
                <span>{semDateTime(rating.createtime)}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center">
            {user && (
              <Button
                type="text"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {t('script.rating.reply')}
              </Button>
            )}
            <ActionMenu
              uid={rating.user_id}
              deleteLevel="super_moderator"
              allowSelfDelete={false}
              onDeleteClick={async () => {
                await onDeleteRating(rating.id);
              }}
            >
              <Button type="text" size="small" icon={<MoreOutlined />}></Button>
            </ActionMenu>
          </div>
        </div>

        {/* 评价内容 */}
        {rating.message && (
          <div className="mb-4 pl-16">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {rating.message}
            </p>
          </div>
        )}

        {/* 回复列表 */}
        {rating.author_message && (
          <div className="pl-16 space-y-3">
            <Divider className="my-4" />
            <div className="space-y-4">
              <ReplyItem
                key={rating.id}
                reply={{
                  user_id: script.user_id,
                  username: script.username,
                  avatar: script.avatar,
                  content: rating.author_message,
                  is_author: 1,
                  is_admin: 0,
                  createtime: rating.author_message_createtime,
                }}
                ratingId={rating.id}
                onDelete={onDeleteReply}
              />
            </div>
          </div>
        )}

        {/* 回复输入框 */}
        {showReplyBox && user && (
          <div className="pl-16 mt-4">
            <Divider className="my-4" />
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar size="small" src={user.avatar}>
                  <UserOutlined />
                </Avatar>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.username}
                </span>
              </div>
              <TextArea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t('script.rating.reply_placeholder')}
                rows={3}
                className="mb-3 resize-none"
                maxLength={300}
              />
              <div className="flex gap-2">
                <Button
                  type="primary"
                  size="small"
                  onClick={handleReply}
                  disabled={!replyContent?.trim()}
                  className="rounded-md"
                >
                  {t('script.rating.send_reply')}
                </Button>
                <Button
                  size="small"
                  onClick={() => setShowReplyBox(false)}
                  className="rounded-md"
                >
                  {t('script.rating.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
