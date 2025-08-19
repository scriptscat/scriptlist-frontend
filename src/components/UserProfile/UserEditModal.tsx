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

      message.success('用户信息更新成功！');
      onSuccess(freshUser as GetUserDetailResponse);
      onCancel();
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error('更新失败，请重试');
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
      message.success('头像上传成功！');
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (e) {
      console.error('头像上传失败:', e);
      message.error('头像上传失败！');
      if (onError) {
        onError(e);
      }
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！');
      return false;
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('图片大小不能超过 1MB！');
      return false;
    }
    return true;
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          编辑个人信息
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
        <Form.Item label="头像">
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
              <Button icon={<UploadOutlined />}>更换头像</Button>
            </Upload>
          </div>
          <Text type="secondary" className="text-xs">
            支持 JPG、PNG 格式，文件大小不超过 1MB
          </Text>
        </Form.Item>

        <Divider />

        {/* 基本信息 */}
        <Form.Item label="用户名" name="username">
          <Input
            disabled
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
            maxLength={20}
          />
        </Form.Item>

        <Form.Item
          label="个人简介"
          name="description"
          rules={[{ max: 200, message: '个人简介不能超过200个字符' }]}
        >
          <TextArea
            placeholder="介绍一下自己吧..."
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: 'email', message: '请输入有效的邮箱地址' },
            { max: 50, message: '邮箱地址不能超过50个字符' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="联系邮箱"
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          label="所在地"
          name="location"
          rules={[{ max: 50, message: '所在地不能超过50个字符' }]}
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="如：北京市海淀区"
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          label="个人网站"
          name="website"
          rules={[
            { type: 'url', message: '请输入有效的网址' },
            { max: 100, message: '网址不能超过100个字符' },
          ]}
        >
          <Input
            prefix={<GlobalOutlined />}
            placeholder="https://example.com"
            maxLength={100}
          />
        </Form.Item>

        <Divider />

        {/* 操作按钮 */}
        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
