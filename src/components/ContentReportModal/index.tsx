'use client';

import { useEffect, useState } from 'react';
import { Input, Modal, Radio, message } from 'antd';
import { useTranslations } from 'next-intl';
import { ErrorCodes } from '@/lib/api/errorCodes';
import { scriptReportService } from '@/lib/api/services/scripts/report';
import type { ContentReportReason, ContentReportTargetType } from '@/types/api';
import {
  CONTENT_REPORT_REASONS,
  NOTE_MAX_LENGTH,
  countChars,
  validateContentReport,
} from './validate';

export interface ContentReportModalProps {
  open: boolean;
  onClose: () => void;
  scriptId: number;
  targetType: ContentReportTargetType;
  targetId: number;
  /** targetType 为 issue_comment 时必填：回复所属反馈 */
  issueId?: number;
  /** 被举报内容的作者名 */
  authorName: string;
  /** 被举报内容的正文（引用块最多显示两行） */
  quote?: string;
  /** targetType 为 issue / issue_comment 时的反馈标题 */
  issueTitle?: string;
}

export default function ContentReportModal({
  open,
  onClose,
  scriptId,
  targetType,
  targetId,
  issueId,
  authorName,
  quote,
  issueTitle,
}: ContentReportModalProps) {
  const t = useTranslations('components.contentReport');
  const [reason, setReason] = useState<ContentReportReason>();
  const [note, setNote] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 重新打开时从空白开始；失败时弹窗不关闭，输入因此得以保留
  useEffect(() => {
    if (open) {
      setReason(undefined);
      setNote('');
      setAttempted(false);
    }
  }, [open]);

  const validation = validateContentReport({ reason, note });
  const errorKey =
    validation.error === 'note_too_long' || attempted
      ? validation.error
      : undefined;

  const handleSubmit = async () => {
    if (submitting || !reason) return;
    setAttempted(true);
    if (!validation.canSubmit) return;
    setSubmitting(true);
    try {
      await scriptReportService.createContentReport(scriptId, {
        target_type: targetType,
        target_id: targetId,
        ...(targetType === 'issue_comment' ? { issue_id: issueId } : {}),
        reason,
        content: note.trim() || undefined,
      });
      message.success(t('success'));
      onClose();
    } catch (error: any) {
      if (error?.code === ErrorCodes.ReportDuplicatePending) {
        message.warning(t('duplicate'));
      } else if (error?.code === ErrorCodes.ReportTargetNotFound) {
        message.error(t('not_found'));
      } else {
        message.error(error?.message || t('submit_failed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t(`title_${targetType}`)}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={t('submit')}
      cancelText={t('cancel')}
      okButtonProps={{ disabled: !reason }}
      confirmLoading={submitting}
      maskClosable={false}
      width={560}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-md border-l-4 border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t(`quote_${targetType}`, {
              name: authorName,
              title: issueTitle ?? '',
            })}
          </div>
          {quote && (
            <p className="mt-1 mb-0 line-clamp-2 break-words text-sm text-gray-700 dark:text-gray-300">
              {quote}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 font-medium">{t('reason_label')}</div>
          <Radio.Group
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="!grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {CONTENT_REPORT_REASONS.map((key) => (
              <Radio
                key={key}
                value={key}
                className="!m-0 !flex !items-start rounded-md border border-solid border-gray-200 !p-2 dark:border-gray-700"
              >
                <span className="block font-medium">
                  {t(`reasons.${key}.name`)}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {t(`reasons.${key}.desc`)}
                </span>
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <div>
          <div className="mb-2 font-medium">
            {t('note_label')}
            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
              {reason === 'other'
                ? t('note_required_mark')
                : t('note_optional')}
            </span>
          </div>
          <Input.TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t('note_placeholder')}
            status={errorKey ? 'error' : undefined}
            count={{
              show: true,
              max: NOTE_MAX_LENGTH,
              strategy: countChars,
            }}
          />
          {errorKey && (
            <div role="alert" className="mt-1 text-xs text-red-500">
              {t(`${errorKey}_error`)}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('privacy')}
        </div>
      </div>
    </Modal>
  );
}
