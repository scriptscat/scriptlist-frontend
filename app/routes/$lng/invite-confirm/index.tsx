import type { LinksFunction } from '@remix-run/node';
import { useTranslation } from 'react-i18next';

import pageStylesHref from './page.css';
import { Badge, Button, Card, Divider } from 'antd';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: pageStylesHref },
];
export default function inviteConfirm() {
    const { t } = useTranslation();
  return (
    <div className="h-full flex justify-center items-center">
      <div className="flex w-[40%] flex-col max-w-[500px] bg-white rounded-md p-5">
        <div className="flex justify-center text-xl w-full">{t('invite_confirm')}</div>
        <Divider />
        <div>{t('invite_you_join_group',{inviter:'aaa',holder:'bbb',property:'ccc'})}</div>
        <div className="my-2">{t("join_you_will_have_following_role_list")}：</div>
        <div>
          <Badge className="!my-1" color="#000" text="可读" />
        </div>
        <div className='flex justify-end items-center mt-10'>
          <Button type="primary">{t("agree")}</Button>
          <Button className='ml-2' type="primary" danger>
          {t("reject")}
          </Button>
        </div>
      </div>
    </div>
  );
}
