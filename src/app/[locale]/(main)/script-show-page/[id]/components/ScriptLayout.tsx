'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
} from 'antd';
import type { ScriptInfoMeta } from '../types';
import ScriptNavigation from './ScriptNavigation';
import { useTranslations } from 'next-intl';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from '@/i18n/routing';
import { adminService } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';

const STATUS_DELETED = 2;
const STATUS_AUDIT = 3;
const AUDIT_STATUS_PENDING = 1;
const AUDIT_FALLBACK_PAGE_SIZE = 100;

interface ScriptLayoutProps {
  script: ScriptInfoMeta;
  activeTab: string;
  children: React.ReactNode;
}

export default function ScriptLayout({
  script,
  activeTab,
  children,
}: ScriptLayoutProps) {
  const t = useTranslations('script');
  const { user } = useUser();
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);
  const [auditId, setAuditId] = useState<number | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [auditSubmitting, setAuditSubmitting] = useState<
    'approve' | 'reject' | null
  >(null);
  const [approveForm] = Form.useForm<{ reason?: string }>();
  const [rejectForm] = Form.useForm<{ reason: string }>();

  const isDeleted = script.status === STATUS_DELETED;
  const isAudit = script.status === STATUS_AUDIT;
  const isAdmin = !!user && user.is_admin >= 1;
  const isOwner = !!user && user.user_id === script.user_id;
  const showDeletedAlert = isDeleted && (isAdmin || isOwner);
  const showAuditAlert = isAudit;

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await adminService.restoreScript(script.id);
      message.success(t('alerts.deleted_restore_success'));
      router.refresh();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('alerts.deleted_restore_failed'));
      }
    } finally {
      setRestoring(false);
    }
  };

  useEffect(() => {
    if (!isAudit || !isAdmin) {
      setAuditId(null);
      return;
    }

    let ignore = false;
    setAuditLoading(true);
    const loadAuditId = async () => {
      const filteredResp = await adminService.listScriptAudits(
        1,
        1,
        AUDIT_STATUS_PENDING,
        undefined,
        script.id,
      );
      const filteredAudit = filteredResp.list?.find(
        (item) => item.script_id === script.id,
      );
      if (filteredAudit) {
        return filteredAudit.id;
      }

      const fallbackResp = await adminService.listScriptAudits(
        1,
        AUDIT_FALLBACK_PAGE_SIZE,
        AUDIT_STATUS_PENDING,
      );
      return fallbackResp.list?.find((item) => item.script_id === script.id)
        ?.id;
    };

    loadAuditId()
      .then((id) => {
        if (ignore) return;
        setAuditId(id ?? null);
      })
      .catch((err) => {
        if (ignore) return;
        setAuditId(null);
        if (err instanceof APIError) {
          message.error(err.msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setAuditLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isAudit, isAdmin, script.id]);

  const openApprove = useCallback(() => {
    approveForm.resetFields();
    setApproveOpen(true);
  }, [approveForm]);

  const openReject = useCallback(() => {
    rejectForm.resetFields();
    setRejectOpen(true);
  }, [rejectForm]);

  const handleApproveAudit = async () => {
    if (!auditId) return;
    const values = await approveForm.validateFields();
    setAuditSubmitting('approve');
    try {
      await adminService.approveScriptAudit(auditId, values.reason?.trim());
      message.success(t('alerts.audit_approve_success'));
      setApproveOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('alerts.audit_approve_failed'));
      }
    } finally {
      setAuditSubmitting(null);
    }
  };

  const handleRejectAudit = async () => {
    if (!auditId) return;
    const values = await rejectForm.validateFields();
    setAuditSubmitting('reject');
    try {
      await adminService.rejectScriptAudit(auditId, values.reason.trim());
      message.success(t('alerts.audit_reject_success'));
      setRejectOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('alerts.audit_reject_failed'));
      }
    } finally {
      setAuditSubmitting(null);
    }
  };

  return (
    <div>
      {showDeletedAlert && (
        <Alert
          message={t('alerts.deleted_title')}
          description={t(
            isAdmin
              ? 'alerts.deleted_description'
              : 'alerts.deleted_owner_description',
          )}
          type="error"
          className="!mb-3"
          showIcon
          action={
            isAdmin ? (
              <Popconfirm
                title={t('alerts.deleted_restore_confirm')}
                onConfirm={handleRestore}
              >
                <Button size="small" type="primary" loading={restoring}>
                  {t('alerts.deleted_restore_button')}
                </Button>
              </Popconfirm>
            ) : undefined
          }
        />
      )}

      {showAuditAlert && (
        <Alert
          message={t('alerts.audit_title')}
          description={t(
            isAdmin && !auditLoading && !auditId
              ? 'alerts.audit_description_no_record'
              : 'alerts.audit_description',
          )}
          type="warning"
          className="!mb-3"
          showIcon
          action={
            isAdmin ? (
              <Space>
                <Button
                  size="small"
                  danger
                  disabled={!auditId}
                  loading={auditLoading || auditSubmitting === 'reject'}
                  onClick={openReject}
                >
                  {t('alerts.audit_reject_button')}
                </Button>
                <Button
                  size="small"
                  type="primary"
                  disabled={!auditId}
                  loading={auditLoading || auditSubmitting === 'approve'}
                  onClick={openApprove}
                >
                  {t('alerts.audit_approve_button')}
                </Button>
              </Space>
            ) : undefined
          }
        />
      )}

      {script.archive == 1 && (
        <Alert
          message={t('alerts.archived_title')}
          description={t('alerts.archived_description')}
          type="warning"
          className="!mb-3"
          showIcon
          closable
        />
      )}

      {script.danger == 1 && (
        <Alert
          message={t('alerts.obfuscated_title')}
          description={t('alerts.obfuscated_description')}
          type="error"
          showIcon
          closable
        />
      )}

      {/* 脚本导航 */}
      <div className="mb-3">
        <ScriptNavigation activeKey={activeTab} />
      </div>

      {/* 页面内容 */}
      {children}

      <Modal
        title={t('alerts.audit_approve_modal_title')}
        open={approveOpen}
        onCancel={() => setApproveOpen(false)}
        onOk={handleApproveAudit}
        confirmLoading={auditSubmitting === 'approve'}
        okText={t('alerts.audit_approve_button')}
      >
        <Form form={approveForm} layout="vertical">
          <Form.Item
            name="reason"
            label={t('alerts.audit_approve_reason_label')}
          >
            <Input.TextArea
              rows={4}
              maxLength={1024}
              showCount
              placeholder={t('alerts.audit_approve_reason_placeholder')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('alerts.audit_reject_modal_title')}
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={handleRejectAudit}
        confirmLoading={auditSubmitting === 'reject'}
        okText={t('alerts.audit_reject_button')}
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label={t('alerts.audit_reject_reason_label')}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('alerts.audit_reject_reason_required'),
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={1024}
              showCount
              placeholder={t('alerts.audit_reject_reason_placeholder')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
