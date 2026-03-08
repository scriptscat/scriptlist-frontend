'use client';

import {
  KeyOutlined,
  LinkOutlined,
  LockOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Collapse, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import PasswordSettings from './PasswordSettings';
import PasskeySettings from './PasskeySettings';
import OAuthBindSettings from './OAuthBindSettings';
import DeactivationSettings from './DeactivationSettings';

const { Text } = Typography;

interface AccountSettingsProps {
  userStatus?: number;
  deactivateAt?: number;
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  iconCls: string;
  iconBgCls: string;
  title: string;
}

function SectionHeader({
  icon,
  iconCls,
  iconBgCls,
  title,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${iconCls} ${iconBgCls}`}
      >
        {icon}
      </div>
      <h3 className="m-0 text-base font-semibold">{title}</h3>
    </div>
  );
}

export default function AccountSettings({
  userStatus,
  deactivateAt,
}: AccountSettingsProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      {/* Password Section */}
      <section>
        <SectionHeader
          icon={<LockOutlined />}
          iconCls="text-emerald-500"
          iconBgCls="bg-emerald-500/10"
          title={t('user.password.title')}
        />
        <div className="mt-4">
          <PasswordSettings embedded />
        </div>
      </section>

      <div className="h-px bg-neutral-200 dark:bg-neutral-700" />

      {/* Passkey Section */}
      <section>
        <SectionHeader
          icon={<KeyOutlined />}
          iconCls="text-cyan-500"
          iconBgCls="bg-cyan-500/10"
          title={t('user.passkey.title')}
        />
        <div className="mt-4">
          <PasskeySettings embedded />
        </div>
      </section>

      <div className="h-px bg-neutral-200 dark:bg-neutral-700" />

      {/* OAuth Bind Section */}
      <section>
        <SectionHeader
          icon={<LinkOutlined />}
          iconCls="text-violet-500"
          iconBgCls="bg-violet-500/10"
          title={t('user.oauth_bind.title')}
        />
        <div className="mt-4">
          <OAuthBindSettings embedded />
        </div>
      </section>

      <div className="h-px bg-neutral-200 dark:bg-neutral-700" />

      {/* Deactivation Section — collapsed by default */}
      <section>
        <Collapse
          ghost
          items={[
            {
              key: 'deactivate',
              label: (
                <SectionHeader
                  icon={<StopOutlined />}
                  iconCls="text-red-500"
                  iconBgCls="bg-red-500/10"
                  title={t('user.deactivate.title')}
                />
              ),
              children: (
                <div className="mt-2">
                  <Text type="secondary" className="mb-4 block">
                    {t('user.deactivate.description')}
                  </Text>
                  <DeactivationSettings
                    userStatus={userStatus}
                    deactivateAt={deactivateAt}
                    embedded
                  />
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
