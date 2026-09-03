'use client';

import {
  Button,
  Input,
  Form,
  Space,
  Radio,
  Checkbox,
  Modal,
  Select,
  message,
  Card,
  Divider,
  Typography,
} from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useScript } from '../../components/ScriptContext';
import { scriptService } from '@/lib/api/services/scripts';
import { useUser } from '@/contexts/UserContext';
import { APIError } from '@/types/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function SettingsPage() {
  const script = useScript();
  const router = useRouter();
  const { user } = useUser();
  const [modal, contextHolder] = Modal.useModal();
  // 五个互不相干的动作各自持有 pending：共用一个 loading 会让「切换可见性」
  // 顺带把归档、删除按钮也转起来。
  const [savingBasicInfo, setSavingBasicInfo] = useState(false);
  const [updatingPublic, setUpdatingPublic] = useState(false);
  const [updatingUnwell, setUpdatingUnwell] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const t = useTranslations('script.manage.settings');

  // 管理员删除对话框状态
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [deleteReasonType, setDeleteReasonType] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 判断是否是管理员删除他人脚本（is_admin === 1 为超级管理员）
  const isAdminDelete =
    user && user.is_admin === 1 && user.user_id !== script.script.user_id;

  // 脚本基本信息状态
  const [name, setName] = useState(script.script.name || '');
  const [description, setDescription] = useState(
    script.script.description || '',
  );

  // 当脚本数据变化时更新状态
  useEffect(() => {
    setName(script.script.name || '');
    setDescription(script.script.description || '');
    setIsPublic((script.script.public as 1 | 2 | 3) || 1);
    setUnwell((script.script.unwell as 1 | 2) || 2);
    setArchive((script.script.archive as 1 | 2) || 2);
  }, [
    script.script.name,
    script.script.description,
    script.script.public,
    script.script.unwell,
    script.script.archive,
  ]);

  // 脚本管理状态
  const [isPublic, setIsPublic] = useState<1 | 2 | 3>(
    (script.script.public as 1 | 2 | 3) || 1,
  ); // 1: 公开, 2: 未公开, 3: 私有
  const [unwell, setUnwell] = useState<1 | 2>(
    (script.script.unwell as 1 | 2) || 2,
  ); // 1: 不当内容, 2: 正常
  const [archive, setArchive] = useState<1 | 2>(
    (script.script.archive as 1 | 2) || 2,
  ); // 1: 已归档, 2: 正常

  const handleSaveBasicInfo = async () => {
    if (!name.trim()) {
      message.error(t('library_info.name_required'));
      return;
    }

    setSavingBasicInfo(true);
    try {
      await scriptService.updateLibInfo(script.script.id.toString(), {
        name: name.trim(),
        description: description.trim(),
      });
      message.success(t('library_info.save_success'));
    } catch (error) {
      console.error('Save library info failed:', error);
      if (error instanceof APIError) {
        message.error(error.msg || t('library_info.save_failed'));
      } else {
        message.error(t('library_info.save_failed'));
      }
    } finally {
      setSavingBasicInfo(false);
    }
  };

  const handlePublicChange = async (value: 1 | 2 | 3) => {
    setUpdatingPublic(true);
    try {
      await scriptService.updatePublic(script.script.id, value);
      setIsPublic(value);
      message.success(t('public_settings.public_update_success'));
    } catch (error) {
      console.error('Update public status failed:', error);
      if (error instanceof APIError) {
        message.error(error.msg || t('public_settings.update_failed'));
      } else {
        message.error(t('public_settings.update_failed'));
      }
    } finally {
      setUpdatingPublic(false);
    }
  };

  const handleUnwellChange = async (checked: boolean) => {
    setUpdatingUnwell(true);
    try {
      const unwellValue = checked ? 1 : 2;
      await scriptService.updateUnwell(script.script.id, unwellValue);
      setUnwell(unwellValue);
      message.success(t('public_settings.unwell_update_success'));
    } catch (error) {
      console.error('Update unwell status failed:', error);
      if (error instanceof APIError) {
        message.error(error.msg || t('public_settings.update_failed'));
      } else {
        message.error(t('public_settings.update_failed'));
      }
    } finally {
      setUpdatingUnwell(false);
    }
  };

  const handleArchive = () => {
    const isArchiving = archive === 2;
    modal.confirm({
      title: isArchiving
        ? t('confirmations.archive_confirm_title')
        : t('confirmations.unarchive_confirm_title'),
      content: isArchiving
        ? t('confirmations.archive_confirm_content')
        : t('confirmations.unarchive_confirm_content'),
      icon: <ExclamationCircleOutlined />,
      okText: t('confirmations.confirm_button'),
      cancelText: t('confirmations.cancel_button'),
      maskClosable: true,
      onOk: async () => {
        setArchiving(true);
        try {
          await scriptService.archiveScript(script.script.id, isArchiving);
          setArchive(isArchiving ? 1 : 2);
          message.success(
            isArchiving
              ? t('messages.archive_success')
              : t('messages.unarchive_success'),
          );
        } catch (error) {
          console.error('Archive operation failed:', error);
          if (error instanceof APIError) {
            message.error(error.msg || t('messages.operation_failed'));
          } else {
            message.error(t('messages.operation_failed'));
          }
        } finally {
          setArchiving(false);
        }
      },
    });
  };

  const doDelete = async (reason?: string) => {
    setDeleteLoading(true);
    try {
      await scriptService.deleteScript(script.script.id, reason || undefined);
      message.success(t('messages.delete_success'));
      setDeleteModalOpen(false);
      // 跳转前不收起 loading，避免删除按钮先复原、用户以为没删掉又点一次
      router.push('/');
      return;
    } catch (error) {
      console.error('Delete script failed:', error);
      if (error instanceof APIError) {
        message.error(error.msg || t('messages.delete_failed'));
      } else {
        message.error(t('messages.delete_failed'));
      }
      setDeleteLoading(false);
    }
  };

  const handleDelete = () => {
    if (isAdminDelete) {
      setDeleteReason('');
      setDeleteReasonType('');
      setDeleteModalOpen(true);
    } else {
      modal.confirm({
        title: t('confirmations.delete_confirm_title'),
        content: t('confirmations.delete_confirm_content'),
        icon: <ExclamationCircleOutlined />,
        okText: t('confirmations.confirm_delete_button'),
        cancelText: t('confirmations.cancel_button'),
        okType: 'danger',
        maskClosable: true,
        onOk: () => doDelete(),
      });
    }
  };

  const DELETE_REASON_LABELS: Record<string, string> = {
    violation: t('confirmations.reason_violation'),
    malicious: t('confirmations.reason_malicious'),
    copyright: t('confirmations.reason_copyright'),
    spam: t('confirmations.reason_spam'),
  };

  const handleAdminDeleteConfirm = () => {
    const reason =
      deleteReasonType === 'custom'
        ? deleteReason
        : DELETE_REASON_LABELS[deleteReasonType] || '';
    doDelete(reason);
  };

  return (
    <Space direction="vertical" className="w-full" size={24}>
      {contextHolder}

      {/* 库信息设置 */}
      {script.script.type == 3 && (
        <Card className="shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={3} className="!mb-1">
                {t('library_info.title')}
              </Title>
              <Text type="secondary">{t('library_info.description')}</Text>
            </div>
          </div>
          <Form layout="vertical">
            <Form.Item label={t('library_info.name_label')} required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('library_info.name_placeholder')}
              />
            </Form.Item>
            <Form.Item label={t('library_info.description_label')}>
              <TextArea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('library_info.description_placeholder')}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                loading={savingBasicInfo}
                onClick={handleSaveBasicInfo}
              >
                {t('library_info.save_button')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 脚本公开设置 */}
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} className="!mb-1">
              {t('public_settings.title')}
            </Title>
            <Text type="secondary">{t('public_settings.description')}</Text>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Title level={5}>{t('public_settings.visibility_title')}</Title>
            <Text type="secondary" className="block mb-3">
              {isPublic === 3
                ? t('public_settings.visibility_private')
                : isPublic === 2
                  ? t('public_settings.visibility_unlisted')
                  : t('public_settings.visibility_public')}
            </Text>
            <Radio.Group
              value={isPublic}
              // 请求在途时不锁住的话，连点会打出并发的 updatePublic，
              // 而 setIsPublic 只在成功后执行，单选按钮会来回跳。
              disabled={updatingPublic}
              onChange={(e) => handlePublicChange(e.target.value)}
              options={[
                { value: 1, label: t('public_settings.public_option') },
                { value: 2, label: t('public_settings.unlisted_option') },
                { value: 3, label: t('public_settings.private_option') },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </div>

          <Divider />

          <div>
            <Title level={5}>
              {t('public_settings.content_marking_title')}
            </Title>
            <Checkbox
              checked={unwell === 1}
              disabled={updatingUnwell}
              onChange={(e) => handleUnwellChange(e.target.checked)}
            >
              {t('public_settings.unwell_checkbox')}
            </Checkbox>
            <Text type="secondary" className="block mt-2">
              {t('public_settings.unwell_description')}
            </Text>
          </div>
        </div>
      </Card>

      {/* 脚本管理操作 */}
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} className="!mb-1">
              {t('script_management.title')}
            </Title>
            <Text type="secondary">{t('script_management.description')}</Text>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Title level={5}>
              {t('script_management.status_management_title')}
            </Title>
            <Space className="w-full" direction="vertical">
              <Button
                type={archive === 2 ? 'default' : 'primary'}
                className={
                  archive === 2
                    ? '!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300 !text-white'
                    : '!bg-green-500 !border-green-500 hover:!bg-green-400 hover:!border-green-400'
                }
                loading={archiving}
                onClick={handleArchive}
                size="large"
              >
                {archive === 2
                  ? t('script_management.archive_button')
                  : t('script_management.unarchive_button')}
              </Button>
              <Text type="secondary">
                {archive === 2
                  ? t('script_management.archive_description')
                  : t('script_management.unarchive_description')}
              </Text>
            </Space>
          </div>

          <Divider />

          <div>
            <Title level={5} type="danger">
              {t('script_management.dangerous_operations_title')}
            </Title>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading}
              onClick={handleDelete}
              size="large"
            >
              {t('script_management.delete_button')}
            </Button>
            <Text type="danger" className="block mt-2">
              {t('script_management.delete_warning')}
            </Text>
          </div>
        </div>
      </Card>

      {/* 管理员删除理由对话框 */}
      <Modal
        title={t('confirmations.delete_confirm_title')}
        open={deleteModalOpen}
        onOk={handleAdminDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        okText={t('confirmations.confirm_delete_button')}
        cancelText={t('confirmations.cancel_button')}
        okType="danger"
        confirmLoading={deleteLoading}
        maskClosable={true}
      >
        <p>{t('confirmations.delete_confirm_content')}</p>
        <div className="mt-4">
          <Text className="block mb-2">
            {t('confirmations.delete_reason_label')}
          </Text>
          <Select
            className="w-full"
            value={deleteReasonType}
            onChange={(value) => {
              setDeleteReasonType(value);
              if (value !== 'custom') {
                setDeleteReason('');
              }
            }}
            options={[
              { value: '', label: t('confirmations.reason_none') },
              {
                value: 'violation',
                label: t('confirmations.reason_violation'),
              },
              {
                value: 'malicious',
                label: t('confirmations.reason_malicious'),
              },
              {
                value: 'copyright',
                label: t('confirmations.reason_copyright'),
              },
              {
                value: 'spam',
                label: t('confirmations.reason_spam'),
              },
              {
                value: 'custom',
                label: t('confirmations.reason_custom'),
              },
            ]}
          />
          {deleteReasonType === 'custom' && (
            <TextArea
              className="mt-2"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder={t('confirmations.reason_custom_placeholder')}
              maxLength={1024}
            />
          )}
        </div>
      </Modal>
    </Space>
  );
}
