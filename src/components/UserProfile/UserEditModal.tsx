'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Avatar,
  Upload,
  Button,
  message,
  Space,
  Typography,
  Divider,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  EditOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import type { GetUserDetailResponse } from '@/lib/api/services/user';
import { userService } from '@/lib/api/services/user';

const { TextArea } = Input;
const { Text } = Typography;

interface UserEditModalProps {
  visible: boolean;
  user: GetUserDetailResponse;
  onCancel: () => void;
  onSuccess: (updatedUser: GetUserDetailResponse) => void;
}

export default function UserEditModal({
  visible,
  user,
  onCancel,
  onSuccess,
}: UserEditModalProps) {
  const t = useTranslations('user');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        username: user.username,
        description: user.description || '',
        email: (user as any).email || '',
        location: user.location || '',
        website: user.website || '',
      });
      setAvatarUrl(user.avatar || '');
    }
  }, [visible, user, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // 仅提交 userService 定义的字段
      await userService.updateUserDetail({
        description: values.description || '',
        location: values.location || '',
        website: values.website || '',
        email: values.email || '',
      });

      // 更新成功后拉取最新详情
      const freshUser = await userService.getUserDetail((user as any).user_id);

      message.success(t('update_success'));
      onSuccess(freshUser as GetUserDetailResponse);
      onCancel();
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error(t('update_failed'));
    } finally {
      setLoading(false);
    }
  };

  // 使用自定义上传以对接 userService
  const customUpload = async (options: any) => {
    const { file, onError, onSuccess } = options || {};
    try {
      const res = await userService.uploadAvatar(file as File);
      setAvatarUrl(res.url);
      message.success(t('avatar_upload_success'));
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (e) {
      console.error('头像上传失败:', e);
      message.error(t('avatar_upload_failed'));
      if (onError) {
        onError(e);
      }
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error(t('avatar_format_error'));
      return false;
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error(t('avatar_size_error'));
      return false;
    }
    return true;
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          {t('edit_profile_title')}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* 头像上传 */}
        <Form.Item label={t('avatar')}>
          <div className="flex items-center gap-4">
            <Avatar
              size={80}
              src={avatarUrl}
              icon={<UserOutlined />}
              className="shadow-lg border-2 border-gray-200"
            />
            <Upload
              name="avatar"
              listType="text"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={customUpload}
              accept=".jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />}>{t('change_avatar')}</Button>
            </Upload>
          </div>
          <Text type="secondary" className="text-xs">
            {t('avatar_help_text')}
          </Text>
        </Form.Item>

        <Divider />

        {/* 基本信息 */}
        <Form.Item label={t('username')} name="username">
          <Input
            disabled
            prefix={<UserOutlined />}
            placeholder={t('username_placeholder')}
            maxLength={20}
          />
        </Form.Item>

        <Form.Item
          label={t('description')}
          name="description"
          rules={[{ max: 200, message: t('description_max_length') }]}
        >
          <TextArea
            placeholder={t('description_placeholder')}
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: 'email', message: t('email_validation') },
            { max: 50, message: t('email_max_length') },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder={t('email_placeholder')}
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          label={t('location')}
          name="location"
          rules={[{ max: 50, message: t('location_max_length') }]}
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder={t('location_placeholder')}
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          label={t('website')}
          name="website"
          rules={[
            { type: 'url', message: t('website_validation') },
            { max: 100, message: t('website_max_length') },
          ]}
        >
          <Input
            prefix={<GlobalOutlined />}
            placeholder={t('website_placeholder')}
            maxLength={100}
          />
        </Form.Item>

        <Divider />

        {/* 操作按钮 */}
        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={onCancel}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('save')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
