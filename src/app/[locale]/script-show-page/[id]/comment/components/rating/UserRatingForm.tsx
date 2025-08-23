'use client';

import {
  Card,
  Rate,
  Button,
  Input,
  Avatar,
  message,
  Space,
  Typography,
} from 'antd';
import { StarFilled, UserOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { UserRatingFormProps } from './types';
import { getRatingText } from './utils';
import { useSemDateTime } from '@/lib/utils/semdate';
import { useTranslations } from 'next-intl';

const { TextArea } = Input;
const { Text } = Typography;

export default function UserRatingForm({
  onSubmitRating,
  submitting,
  existingRating,
  onUpdateRating,
}: UserRatingFormProps) {
  const { user } = useUser();
  const t = useTranslations('script.rating.user_form');
  const tRating = useTranslations('script.rating');
  const tRatingText = useTranslations('script.rating.text');
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const semDateTime = useSemDateTime();

  // 当存在已有评分时，初始化表单数据
  useEffect(() => {
    if (existingRating && !isEditing) {
      setUserRating(existingRating.score / 10);
      setUserComment(existingRating.message);
    }
  }, [existingRating, isEditing]);

  const handleSubmit = async () => {
    if (!user) {
      message.warning(tRating('login_required'));
      return;
    }

    if (userRating === 0) {
      message.warning(t('please_select_rating'));
      return;
    }

    try {
      if (existingRating && onUpdateRating) {
        // 更新已有评分
        await onUpdateRating(existingRating.id, userRating * 10, userComment);
        setIsEditing(false);
      } else {
        // 创建新评分
        await onSubmitRating(userRating * 10, userComment);
        setUserRating(0);
        setUserComment('');
      }
    } catch {
      // 错误处理由父组件处理
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (existingRating) {
      setUserRating(existingRating.score);
      setUserComment(existingRating.message);
      setIsEditing(false);
    } else {
      setUserRating(0);
      setUserComment('');
    }
  };

  const getRatingDescription = (rating: number) => {
    return getRatingText(rating, tRatingText);
  };

  // 如果用户未登录，显示登录提示
  if (!user) {
    return (
      <Card className="shadow-sm border-0 rounded-xl overflow-hidden">
        <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-2xl text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('login_prompt_title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {t('login_prompt_description')}
          </p>
          <Button
            type="primary"
            size="large"
            className="px-8 rounded-lg"
            onClick={() => {
              message.info(t('login_redirect_message'));
            }}
          >
            {t('login_prompt_button')}
          </Button>
        </div>
      </Card>
    );
  }

  // 如果存在已有评分且不在编辑模式，显示已有评分
  if (existingRating && !isEditing) {
    return (
      <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
        <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-950/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar}
                size="large"
                className="ring-2 ring-green-100 dark:ring-green-800"
              >
                <UserOutlined />
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('your_review_title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('published_at', {
                    time: semDateTime(existingRating.createtime),
                  })}
                </p>
              </div>
            </div>
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-700"
              >
                {t('edit_button')}
              </Button>
            </Space>
          </div>

          <div className="space-y-4">
            <div>
              <Text strong className="text-gray-700 dark:text-gray-300">
                {t('rating_label')}
              </Text>
              <div className="mt-2">
                <Rate
                  value={existingRating.score}
                  disabled
                  className="text-xl"
                  character={<StarFilled />}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {getRatingDescription(existingRating.score)}
                </span>
              </div>
            </div>

            {existingRating.message && (
              <div>
                <Text strong className="text-gray-700 dark:text-gray-300">
                  {t('review_content_label')}
                </Text>
                <div className="mt-2 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Text className="text-gray-800 dark:text-gray-200">
                    {existingRating.message}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // 显示评分表单（新建或编辑模式）
  return (
    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar
            src={user.avatar}
            size="large"
            className="ring-2 ring-blue-100 dark:ring-blue-800"
          >
            <UserOutlined />
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {existingRating ? t('edit_review_title') : t('new_review_title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('review_help_text')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('rating_field_label')}
            </label>
            <Rate
              value={userRating}
              onChange={setUserRating}
              className="text-2xl"
              character={<StarFilled />}
            />
            {userRating > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {getRatingDescription(userRating)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('review_field_label')}
            </label>
            <TextArea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder={t('review_placeholder')}
              rows={4}
              maxLength={500}
              showCount
              className="resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={submitting}
              disabled={userRating === 0}
              className="px-8 rounded-lg"
            >
              {existingRating ? t('update_button') : t('submit_button')}
            </Button>
            <Button size="large" onClick={handleCancel} className="rounded-lg">
              {existingRating ? t('cancel_button') : t('reset_button')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
