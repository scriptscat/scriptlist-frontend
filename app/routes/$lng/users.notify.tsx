import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import { Card, Checkbox, message, Space } from 'antd';
import i18next, { t } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SetUsetNotify, UserConfig } from '~/services/users/api';
import type { UserConfig as UserConfigItem } from '~/services/users/types';
import { getLocale } from '~/utils/i18n';

export const meta: V2_MetaFunction = () => {
  const { t } = useTranslation();
  return [{ title: t('user_notification_management') + ' - ScriptCat' }];
};

export type LoaderData = {
  config: UserConfigItem;
};

export const loader: LoaderFunction = async ({ request }) => {
  const lng = getLocale(request, 'en')!;
  let t = await i18next.getFixedT(lng);
  const resp = await UserConfig(request);
  if (resp.code != 0) {
    throw new Response(t('no_permission_access'), {
      status: 403,
      statusText: 'Forbidden',
    });
  }
  return json({
    config: resp.data,
  } as LoaderData);
};

export default function Notify() {
  const data = useLoaderData<LoaderData>();
  const [notifyChecked, setNotifyChecked] = useState(data.config.notify);
  const [loading, setLoading] = useState(false);

  const notifyItem = [
    {
      key: 'at',
      description: t('at_me_send_email_notification'),
    },
    {
      key: 'create_script',
      description: t('notify_when_user_create_script'),
    },
    {
      key: 'score',
      description: t('notify_when_my_script_scored'),
    },
    {
      key: 'script_update',
      description: t('notify_when_followed_script_updated'),
    },
    {
      key: 'script_issue',
      description: t('notify_when_followed_script_created_feedback'),
    },
    {
      key: 'script_issue_comment',
      description: t('notify_when_followed_feedback_has_new_comment'),
    },
  ];

  return (
    <Card>
      <Space direction="vertical">
        <span>{t('system_will_send_email_when_events_occur')}</span>
        {notifyItem.map((item, index) => (
          <Checkbox
            key={item.key}
            onChange={async (checked) => {
              setLoading(true);
              notifyChecked[item.key] = checked.target.checked;
              let resp = await SetUsetNotify(notifyChecked);
              setLoading(false);
              if (resp.code == 0) {
                setLoading(false);
                setNotifyChecked(notifyChecked);
              } else {
                message.error(resp.msg);
              }
            }}
            checked={notifyChecked[item.key]}
          >
            {item.description}
          </Checkbox>
        ))}
      </Space>
    </Card>
  );
}
