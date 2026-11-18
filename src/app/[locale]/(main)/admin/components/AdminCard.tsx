'use client';

import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Dropdown, Popconfirm } from 'antd';
import type { MenuProps, ModalFuncProps } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Link } from '@/i18n/routing';
import { useSemDateTime } from '@/lib/utils/semdate';

/** 卡片上的一个操作，对应表格操作列里的一个按钮。 */
export interface AdminCardAction {
  key: string;
  label: ReactNode;
  onClick?: () => unknown;
  /** 站内路径（不带语言前缀），渲染为链接 */
  href?: string;
  target?: string;
  /** 删除、封禁、移除等危险操作：永不作主位，⋯ 菜单里排在最底部 */
  danger?: boolean;
  /** 需要确认时的标题，与表格里的确认文案相同 */
  confirm?: { title: ReactNode };
  loading?: boolean;
  disabled?: boolean;
}

export interface AdminCardField {
  label: ReactNode;
  value: ReactNode;
}

/** 一行数据映射到卡片各位置的声明。 */
export interface AdminCardSpec {
  title: ReactNode;
  /** 标题前的图标（如 OIDC 提供商） */
  icon?: ReactNode;
  /** 标题最多显示的行数，默认 2 */
  titleLines?: 1 | 2 | 3;
  /** 「#ID · 副信息」，各段用「 · 」连接，单行截断；空段（''、null、undefined、false）跳过 */
  subtitle?: ReactNode[];
  /** 状态 / 类型标签，位于标题右侧 */
  badges?: ReactNode;
  /** 正文，最多 3 行 */
  body?: ReactNode;
  /** 次要字段（两列键值），值可以是单元格里原有的控件 */
  fields?: AdminCardField[];
  /** unix 秒；底栏显示相对时间，点按显示完整时间 */
  time?: number;
  actions?: AdminCardAction[];
}

export type AdminCardConfirm = (config: ModalFuncProps) => unknown;

type Variant = 'primary' | 'default' | 'danger';

const TITLE_CLAMP = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
} as const;

const SEPARATOR = ' · ';

/**
 * 操作规则（spec 决定 #5 / #6）：
 * - 主位 = 现有顺序里的第一个安全操作，放在最右；
 * - 不超过 2 个：全部显示；
 * - 超过 2 个：只显示主位，其余进 ⋯，危险操作排在菜单最底部；
 * - 没有安全操作：全部显示为红色描边按钮。
 */
export function layoutActions(actions: AdminCardAction[]): {
  shown: { action: AdminCardAction; variant: Variant }[];
  menu: AdminCardAction[];
} {
  const primary = actions.find((a) => !a.danger);
  if (!primary) {
    return {
      shown: actions.map((action) => ({ action, variant: 'danger' })),
      menu: [],
    };
  }
  const rest = actions.filter((a) => a !== primary);
  const primaryShown = { action: primary, variant: 'primary' as const };
  if (actions.length <= 2) {
    return {
      shown: [
        ...rest.map((action) => ({
          action,
          variant: action.danger ? ('danger' as const) : ('default' as const),
        })),
        primaryShown,
      ],
      menu: [],
    };
  }
  return {
    shown: [primaryShown],
    menu: [...rest.filter((a) => !a.danger), ...rest.filter((a) => a.danger)],
  };
}

const VARIANT_PROPS = {
  // 主位用描边主色，不用实心，避免与页面主按钮抢视觉
  primary: { color: 'primary', variant: 'outlined' },
  default: {},
  // 危险操作永远是红色描边，不用实心
  danger: { danger: true },
} as const;

function ShownAction({
  action,
  variant,
}: {
  action: AdminCardAction;
  variant: Variant;
}) {
  const button = (
    <Button
      {...VARIANT_PROPS[variant]}
      loading={action.loading}
      disabled={action.disabled}
      onClick={action.confirm || action.href ? undefined : action.onClick}
      data-admin-card-action={action.key}
      data-variant={variant}
    >
      {action.label}
    </Button>
  );
  if (action.href) {
    return (
      <Link href={action.href} target={action.target}>
        {button}
      </Link>
    );
  }
  if (action.confirm) {
    return (
      <Popconfirm
        title={action.confirm.title}
        onConfirm={() => action.onClick?.()}
        disabled={action.disabled}
      >
        {button}
      </Popconfirm>
    );
  }
  return button;
}

function MoreActions({
  actions,
  confirm,
}: {
  actions: AdminCardAction[];
  confirm: AdminCardConfirm;
}) {
  const t = useTranslations('admin.card');
  const byKey = new Map(actions.map((a) => [a.key, a]));
  const firstDanger = actions.findIndex((a) => a.danger);

  const items: MenuProps['items'] = [];
  actions.forEach((action, index) => {
    if (index === firstDanger && index > 0) {
      items.push({ type: 'divider', key: '__danger-divider' });
    }
    const label = (
      <span
        data-admin-card-action={action.key}
        data-variant={action.danger ? 'danger' : 'default'}
      >
        {action.label}
      </span>
    );
    items.push({
      key: action.key,
      danger: action.danger,
      disabled: action.disabled || action.loading,
      label: action.href ? (
        <Link href={action.href} target={action.target}>
          {label}
        </Link>
      ) : (
        label
      ),
    });
  });

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const action = byKey.get(key);
    if (!action || action.href) return;
    if (action.confirm) {
      // 气泡确认挂在菜单项上会随菜单关闭失去锚点，菜单内统一用确认对话框
      confirm({
        title: action.confirm.title,
        onOk: () => action.onClick?.(),
      });
      return;
    }
    action.onClick?.();
  };

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{ items, onClick: onMenuClick }}
    >
      <Button
        icon={<EllipsisOutlined />}
        aria-label={t('more_actions')}
        data-admin-card-more=""
      />
    </Dropdown>
  );
}

function CardTime({ time }: { time: number }) {
  const t = useTranslations('admin.card');
  const semDateTime = useSemDateTime();
  const [full, setFull] = useState(false);
  return (
    <button
      type="button"
      className="min-h-8 min-w-0 cursor-pointer truncate text-left text-xs text-app-tertiary"
      aria-expanded={full}
      title={t('show_full_time')}
      onClick={() => setFull((v) => !v)}
    >
      {full
        ? dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss')
        : semDateTime(time)}
    </button>
  );
}

export default function AdminCard({
  spec,
  confirm,
}: {
  spec: AdminCardSpec;
  confirm: AdminCardConfirm;
}) {
  const { shown, menu } = layoutActions(spec.actions ?? []);
  const subtitle = (spec.subtitle ?? []).filter(
    (part) =>
      part !== '' && part !== null && part !== undefined && part !== false,
  );
  const hasFooter = spec.time !== undefined || shown.length > 0;

  return (
    <article
      data-admin-card=""
      className="rounded-lg border border-app-secondary bg-app-elevated p-3"
    >
      <div className="flex items-start gap-2">
        {spec.icon && <span className="mt-0.5 shrink-0">{spec.icon}</span>}
        <div
          data-admin-card-title=""
          className={`min-w-0 flex-1 break-words font-medium ${TITLE_CLAMP[spec.titleLines ?? 2]}`}
        >
          {spec.title}
        </div>
        {spec.badges && (
          <div
            data-admin-card-badges=""
            className="flex max-w-[45%] shrink-0 flex-wrap justify-end gap-1 [&_.ant-tag]:me-0"
          >
            {spec.badges}
          </div>
        )}
      </div>

      {subtitle.length > 0 && (
        <div
          data-admin-card-subtitle=""
          className="mt-1 truncate text-xs text-app-secondary"
        >
          {subtitle.map((part, i) => (
            <Fragment key={i}>
              {i > 0 && SEPARATOR}
              {part}
            </Fragment>
          ))}
        </div>
      )}

      {spec.body && (
        <div className="mt-2 line-clamp-3 break-words text-sm">{spec.body}</div>
      )}

      {spec.fields && spec.fields.length > 0 && (
        <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
          {spec.fields.map((field, i) => (
            <Fragment key={i}>
              <dt className="text-app-tertiary">{field.label}</dt>
              <dd className="min-w-0 break-words">{field.value}</dd>
            </Fragment>
          ))}
        </dl>
      )}

      {hasFooter && (
        <div className="mt-3 flex items-center gap-2 border-t border-app-secondary pt-2">
          {spec.time !== undefined && <CardTime time={spec.time} />}
          {shown.length > 0 && (
            <div className="ml-auto flex flex-wrap justify-end gap-2">
              {shown.map(({ action, variant }) => (
                <ShownAction
                  key={action.key}
                  action={action}
                  variant={variant}
                />
              ))}
              {menu.length > 0 && (
                <MoreActions actions={menu} confirm={confirm} />
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
