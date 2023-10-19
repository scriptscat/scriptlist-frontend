import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Card, message } from 'antd';
import { getScript, UpdateCode } from '~/services/scripts/api';
import type { LoaderData } from '../$id';
import UpdateScript from '~/components/UpdateScript';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'remix-i18next';

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string), request, true);
  return json({ script: script.data.data } as LoaderData, {
    headers: script.headers,
  });
};

export default function Update() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const locale = '/' + useLocale();

  return (
    <Card>
      <UpdateScript
        script={data.script}
        onSubmit={async (params) => {
          let resp = await UpdateCode(data.script.id, params);
          if (resp.code === 0) {
            message.success(t('update_success'));
            navigate({
              pathname: locale + '/script-show-page/' + data.script.id,
            });
            return true;
          }
          message.error(resp.msg);
          return false;
        }}
      ></UpdateScript>
    </Card>
  );
}
