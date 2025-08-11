'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, message, Typography } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import {
  scriptFavoriteService,
  type FavoriteFolderItem,
  type UpdateFolderRequest,
} from '@/lib/api/services/scripts/favorites';

const { TextArea } = Input;
const { Text } = Typography;

interface FavoriteEditModalProps {
  visible: boolean;
  folder: FavoriteFolderItem;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function FavoriteEditModal({
  visible,
  folder,
  onCancel,
  onSuccess,
}: FavoriteEditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: folder.name,
        description: folder.description || '',
        private: folder.private === 1, // 1私密，2公开，Switch组件使用boolean
      });
    }
  }, [visible, folder, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const updateData: UpdateFolderRequest = {
        name: values.name,
        description: values.description || '',
        private: values.private ? 1 : 2, // boolean转换为1或2
      };

      await scriptFavoriteService.updateFolder(folder.id, updateData);

      message.success('收藏夹更新成功！');
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('更新收藏夹失败:', error);
      message.error(error.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <FolderOutlined className="mr-2" />
          编辑收藏夹
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="收藏夹名称"
          name="name"
          rules={[
            { required: true, message: '请输入收藏夹名称' },
            { min: 1, max: 50, message: '收藏夹名称长度应在1-50个字符之间' },
          ]}
        >
          <Input placeholder="请输入收藏夹名称" />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          rules={[{ max: 500, message: '描述不能超过500个字符' }]}
        >
          <TextArea
            placeholder="请输入收藏夹描述（可选）"
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item label="私有收藏夹" name="private" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div className="text-sm text-gray-500 -mt-2 mb-4">
          <Text type="secondary">开启后，只有您可以看到此收藏夹</Text>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
