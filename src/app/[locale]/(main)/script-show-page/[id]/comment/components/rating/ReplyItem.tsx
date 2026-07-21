'use client';

import { Avatar, Tag } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { ReplyItemProps } from './types';
import { useSemDateTime } from '@/lib/utils/semdate';

export default function ReplyItem({ reply }: ReplyItemProps) {
  const t = useTranslations('script.rating');
  const semDateTime = useSemDateTime();
  const isAuthor = reply.is_author === 1;

  const statusTags = (
    <>
      {isAuthor && (
        <Tag
          icon={<CheckCircleFilled />}
          variant="filled"
          className="!m-0 !rounded-[5px] !border-transparent !bg-[rgb(var(--primary-500))] !px-[7px] !py-[2px] !text-[11px] !font-semibold !leading-[14px] !text-[rgb(var(--text-inverse))]"
        >
          {t('author_tag')}
        </Tag>
      )}
      {reply.is_admin === 1 && (
        <Tag className="border-red-200 bg-red-100 px-2 py-0 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
          {t('admin_tag')}
        </Tag>
      )}
    </>
  );

  if (isAuthor) {
    return (
      <div className="flex flex-col gap-2 rounded-[10px] border-l-[3px] border-l-[rgb(var(--primary-500))] bg-[rgb(var(--primary-100))] p-[14px] dark:bg-[#152846]">
        <div className="flex w-full min-w-0 items-center gap-2">
          <Link href={`/users/${reply.user_id}`} target="_blank">
            <Avatar
              size={26}
              src={reply.avatar}
              className="!bg-[rgb(var(--primary-500))] !text-[rgb(var(--text-inverse))] cursor-pointer transition-opacity hover:opacity-80"
            >
              <UserOutlined />
            </Avatar>
          </Link>
          <Link
            href={`/users/${reply.user_id}`}
            className="min-w-0 transition-opacity hover:opacity-80"
            target="_blank"
          >
            <span className="block truncate text-[13px] font-semibold text-[rgb(var(--text-primary))] transition-colors hover:text-[rgb(var(--primary-500))]">
              {reply.username}
            </span>
          </Link>
          {statusTags}
          <div className="ml-auto flex shrink-0 items-center gap-1 font-mono text-xs text-[rgb(var(--text-secondary))]">
            <ClockCircleOutlined />
            <span>{semDateTime(reply.createtime)}</span>
          </div>
        </div>
        <p className="text-sm leading-[1.6] text-[rgb(var(--text-primary))]">
          {reply.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-2.5 px-0.5 py-0.5">
      <Link href={`/users/${reply.user_id}`} target="_blank">
        <Avatar
          size={26}
          src={reply.avatar}
          className="cursor-pointer transition-opacity hover:opacity-80"
        >
          <UserOutlined />
        </Avatar>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`/users/${reply.user_id}`}
            className="min-w-0 transition-opacity hover:opacity-80"
            target="_blank"
          >
            <span className="block truncate text-[13px] font-semibold text-[rgb(var(--text-primary))] transition-colors hover:text-[rgb(var(--primary-500))]">
              {reply.username}
            </span>
          </Link>
          {statusTags}
          <div className="flex shrink-0 items-center gap-1 font-mono text-xs text-[rgb(var(--text-secondary))]">
            <ClockCircleOutlined />
            <span>{semDateTime(reply.createtime)}</span>
          </div>
        </div>
        <p className="text-sm leading-[1.6] text-[rgb(var(--text-secondary))]">
          {reply.content}
        </p>
      </div>
    </div>
  );
}
