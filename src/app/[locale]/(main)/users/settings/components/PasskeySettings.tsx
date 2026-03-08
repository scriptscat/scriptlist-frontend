'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Input,
  message,
  Modal,
  Popconfirm,
  Table,
  Typography,
} from 'antd';
import { KeyOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { startRegistration } from '@simplewebauthn/browser';
import {
  webauthnService,
  type WebAuthnCredentialItem,
} from '@/lib/api/services/webauthn';
import { APIError } from '@/types/api';

const { Paragraph } = Typography;

interface PasskeySettingsProps {
  embedded?: boolean;
}

export default function PasskeySettings({ embedded }: PasskeySettingsProps) {
  const t = useTranslations('user.passkey');

  const [credentials, setCredentials] = useState<WebAuthnCredentialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] =
    useState<WebAuthnCredentialItem | null>(null);
  const [renameName, setRenameName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await webauthnService.listCredentials();
      setCredentials(resp.list || []);
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleAdd = async () => {
    setRegistering(true);
    try {
      // Step 1: Get registration options from server
      const beginResp = await webauthnService.registerBegin();

      // Step 2: Use browser WebAuthn API
      const attResp = await startRegistration({
        optionsJSON: beginResp.options.publicKey,
      });

      // Step 3: Send result to server with a default name
      const name = `Passkey ${credentials.length + 1}`;
      await webauthnService.registerFinish({
        session_id: beginResp.session_id,
        name,
        credential: JSON.stringify(attResp),
      });

      message.success(t('add_success'));
      fetchCredentials();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else if (err instanceof Error) {
        // WebAuthn browser API errors
        if (err.name !== 'NotAllowedError') {
          message.error(t('add_failed'));
        }
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await webauthnService.deleteCredential(id);
      message.success(t('delete_success'));
      fetchCredentials();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('delete_failed'));
      }
    }
  };

  const openRename = (record: WebAuthnCredentialItem) => {
    setRenameTarget(record);
    setRenameName(record.name);
    setRenameModalOpen(true);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameName.trim()) return;
    setRenameLoading(true);
    try {
      await webauthnService.renameCredential(
        renameTarget.id,
        renameName.trim(),
      );
      message.success(t('rename_success'));
      setRenameModalOpen(false);
      fetchCredentials();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('rename_failed'));
      }
    } finally {
      setRenameLoading(false);
    }
  };

  const columns: ColumnsType<WebAuthnCredentialItem> = [
    {
      title: t('col_name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      key: 'createtime',
      render: (val: number) =>
        val ? new Date(val * 1000).toLocaleString() : '-',
    },
    {
      title: t('col_actions'),
      key: 'actions',
      render: (_: unknown, record: WebAuthnCredentialItem) => (
        <div className="flex gap-2">
          <Button type="link" size="small" onClick={() => openRename(record)}>
            {t('rename')}
          </Button>
          <Popconfirm
            title={t('delete_confirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              {t('delete')}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {!embedded ? (
        <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-cyan-500/10 text-xl text-cyan-500">
            <KeyOutlined />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="m-0 mb-1 text-base font-semibold">{t('title')}</h3>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                loading={registering}
                onClick={handleAdd}
              >
                {t('add')}
              </Button>
            </div>
            <Paragraph className="!mb-0" type="secondary">
              {t('description')}
            </Paragraph>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            loading={registering}
            onClick={handleAdd}
          >
            {t('add')}
          </Button>
        </div>
      )}

      <Card bordered>
        <Table
          columns={columns}
          dataSource={credentials}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                description={t('no_passkeys')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Rename Modal */}
      <Modal
        title={t('rename_title')}
        open={renameModalOpen}
        onOk={handleRename}
        onCancel={() => setRenameModalOpen(false)}
        okText={t('rename_ok')}
        confirmLoading={renameLoading}
        okButtonProps={{ disabled: !renameName.trim() }}
      >
        <Input
          value={renameName}
          onChange={(e) => setRenameName(e.target.value)}
          maxLength={128}
          placeholder={t('rename_placeholder')}
        />
      </Modal>
    </div>
  );
}
