import { LinksFunction, LoaderFunction } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { useNavigate } from '@remix-run/react';
import { Card, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'remix-i18next';
import { markdownEditorLinks } from '~/components/MarkdownEditor';
import UpdateScript from '~/components/UpdateScript';
import i18next from '~/i18next.server';
import { CreateScript } from '~/services/scripts/api';
import { getLocale } from '~/utils/i18n';

export const links: LinksFunction = () => [...markdownEditorLinks()];

export const meta: V2_MetaFunction = ({
  data,
}: {
  data: { title: string; description: string };
}) => {
  return [{ title: data.title }, { description: data.description }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const t = await i18next.getFixedT(getLocale(request, 'en') ?? 'en');
  return {
    title: t('submit_new_script') + ' - ScriptCat',
    description: t('home_page_description'),
  };
};

export default function PostScript() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const locale = '/' + useLocale();
  return (
    <>
      <Card>
        <UpdateScript
          onSubmit={async (params) => {
            const resp = await CreateScript(params);
            if (resp.code !== 0) {
              message.error(resp.msg);
              return false;
            }
            message.success(t('submit_success'));
            navigate({
              pathname: locale + '/script-show-page/' + resp.data.id,
            });
            return true;
          }}
        />
      </Card>
    </>
  );
}
