'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, message, Typography } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('user.favorites.edit_modal');
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

      message.success(t('update_success'));
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error(t('update_failed_prefix'), error);
      message.error(error.message || t('update_failed_generic'));
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
          {t('title')}
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
          label={t('name_label')}
          name="name"
          rules={[
            { required: true, message: t('name_required') },
            { min: 1, max: 50, message: t('name_length_error') },
          ]}
        >
          <Input placeholder={t('name_placeholder')} />
        </Form.Item>

        <Form.Item
          label={t('description_label')}
          name="description"
          rules={[{ max: 500, message: t('description_length_error') }]}
        >
          <TextArea
            placeholder={t('description_placeholder')}
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label={t('private_label')}
          name="private"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div className="text-sm text-gray-500 -mt-2 mb-4">
          <Text type="secondary">{t('private_help_text')}</Text>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={handleCancel}>{t('cancel_button')}</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t('save_button')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
