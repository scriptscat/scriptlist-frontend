'use client';

import {
  Card,
  Rate,
  Button,
  Input,
  Avatar,
  message,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import {
  StarFilled,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserRatingFormProps } from './types';
import { getRatingText } from './utils';
import { useSemDateTime } from '@/lib/utils/semdate';

const { TextArea } = Input;
const { Text } = Typography;

export default function UserRatingForm({
  onSubmitRating,
  submitting,
  existingRating,
  onUpdateRating,
  onDeleteRating,
}: UserRatingFormProps) {
  const { user } = useUser();
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const semDateTime = useSemDateTime();

  // 当存在已有评分时，初始化表单数据
  useEffect(() => {
    if (existingRating && !isEditing) {
      setUserRating(existingRating.score);
      setUserComment(existingRating.message);
    }
  }, [existingRating, isEditing]);

  const handleSubmit = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }

    if (userRating === 0) {
      message.warning('请选择评分');
      return;
    }

    try {
      if (existingRating && onUpdateRating) {
        // 更新已有评分
        await onUpdateRating(existingRating.id, userRating, userComment);
        setIsEditing(false);
      } else {
        // 创建新评分
        await onSubmitRating(userRating, userComment);
        setUserRating(0);
        setUserComment('');
      }
    } catch (error) {
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

  const handleDelete = async () => {
    if (existingRating && onDeleteRating) {
      try {
        await onDeleteRating(existingRating.id);
        setUserRating(0);
        setUserComment('');
        setIsEditing(false);
      } catch (error) {
        // 错误处理由父组件处理
      }
    }
  };

  const getRatingDescription = (rating: number) => {
    return getRatingText(rating);
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
            登录后评价脚本
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            登录后您可以对脚本进行评分和评价，帮助其他用户做出选择
          </p>
          <Button
            type="primary"
            size="large"
            className="px-8 rounded-lg"
            onClick={() => {
              message.info('请前往登录页面进行登录');
            }}
          >
            立即登录
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
                  您的评价
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  发布于 {semDateTime(existingRating.createtime)}
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
                编辑
              </Button>
            </Space>
          </div>

          <div className="space-y-4">
            <div>
              <Text strong className="text-gray-700 dark:text-gray-300">
                评分：
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
                  评价内容：
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
              {existingRating ? '编辑评价' : '分享您的体验'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              您的评价将帮助其他用户
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              您的评分
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
              评价内容（可选）
            </label>
            <TextArea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="分享您的使用体验，帮助其他用户了解这个脚本..."
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
              {existingRating ? '更新评价' : '发布评价'}
            </Button>
            <Button size="large" onClick={handleCancel} className="rounded-lg">
              {existingRating ? '取消' : '重置'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
