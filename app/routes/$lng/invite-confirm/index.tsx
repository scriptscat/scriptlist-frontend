import type { LinksFunction } from '@remix-run/node';
import { useTranslation } from 'react-i18next';

import pageStylesHref from './page.css';
import { Badge, Button, Card, Divider, message } from 'antd';
import { json, redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import {
  GetInviteMessage,
  HandleInvite,
  inviteDetail,
} from '~/services/scripts/api';
import { useLoaderData, useRevalidator } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
  let { searchParams } = new URL(request.url);
  let code = searchParams.get('code');
  if (code === null) {
    return redirect('/');
  }
  const codeData = await GetInviteMessage(code, request);
  return json({ data: codeData.data, code });
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: pageStylesHref },
];
export default function inviteConfirm() {
  const revalidator = useRevalidator();
  const data = useLoaderData<{ data: inviteDetail; code: string }>();
  const codeData = data.data;
  const invite_status = codeData.invite_status;
  const code = data.code;
  const isGroup = codeData.group !== undefined;
  const username = codeData.script.username;
  const scriptname = codeData.script.name;
  const { t } = useTranslation();
  const sbumitInvite = async (status: boolean) => {
    const result = await HandleInvite(code, status);
    if (result.code == 0) {
      message.success(t('submit_success'));
      revalidator.revalidate();
    } else {
      message.error(result.msg);
    }
  };
  const acceptInvite = () => sbumitInvite(true);
  const rejectInvite = () => sbumitInvite(false);
  function InviteDetail({ invite_status }: { invite_status: number }) {
    //1 未使用，2使用，3过期，4等待，5拒绝
    if (invite_status === 1) {
      return (
        <>
          {' '}
          <div>
            {isGroup
              ? t('invite_you_join_group', {
                  inviter: username,
                  holder: scriptname,
                  property: codeData.group?.name,
                })
              : t('invite_you_join', {
                  inviter: username,
                  holder: scriptname,
                })}
          </div>
          {!isGroup ? (
            <>
              <div className="my-2">
                {t('join_you_will_have_following_role_list')}：
              </div>
              <div>
                {(() => {
                  if (codeData.access?.role === 'guest') {
                    return (
                      <Badge
                        className="!my-1"
                        color="#000"
                        text={t('readable')}
                      />
                    );
                  }
                  if (codeData.access?.role === 'manager') {
                    return (
                      <>
                        <Badge
                          className="!my-1"
                          color="#000"
                          text={t('readable')}
                        />
                        <Badge
                          className="!my-1"
                          color="#000"
                          text={t('writeable')}
                        />
                      </>
                    );
                  }
                  return <></>;
                })()}
              </div>
            </>
          ) : (
            <></>
          )}
          <div className="flex justify-end items-center mt-10">
            <Button onClick={acceptInvite} type="primary">
              {t('agree')}
            </Button>
            <Button
              onClick={rejectInvite}
              className="ml-2"
              type="primary"
              danger
            >
              {t('reject')}
            </Button>
          </div>
        </>
      );
    } else if (invite_status === 2) {
      return (
        <div className="min-h-[150px] flex  text-lg flex-col items-center">
          <div>
            {isGroup
              ? t('invite_you_join_group', {
                  inviter: username,
                  holder: scriptname,
                  property: codeData.group?.name,
                })
              : t('invite_you_join', {
                  inviter: username,
                  holder: scriptname,
                })}
          </div>
          <div className="mt-3">{code + ' ' + t('used')}</div>
        </div>
      );
    } else if (invite_status === 3) {
      return (
        <div className="min-h-[150px] flex  text-lg flex-col items-center">
          <div>
            {isGroup
              ? t('invite_you_join_group', {
                  inviter: username,
                  holder: scriptname,
                  property: codeData.group?.name,
                })
              : t('invite_you_join', {
                  inviter: username,
                  holder: scriptname,
                })}
          </div>
          <div className="mt-3">{code + ' ' + t('expired')}</div>
        </div>
      );
    } else if (invite_status === 4) {
      return (
        <div className="min-h-[150px] flex  text-lg flex-col items-center">
          <div>
            {isGroup
              ? t('invite_you_join_group', {
                  inviter: username,
                  holder: scriptname,
                  property: codeData.group?.name,
                })
              : t('invite_you_join', {
                  inviter: username,
                  holder: scriptname,
                })}
          </div>
          <div className="mt-3">{code + ' ' + t('pending')}</div>
        </div>
      );
    } else if (invite_status === 5) {
      return (
        <div className="min-h-[150px] flex  text-lg flex-col items-center">
          <div>
            {isGroup
              ? t('invite_you_join_group', {
                  inviter: username,
                  holder: scriptname,
                  property: codeData.group?.name,
                })
              : t('invite_you_join', {
                  inviter: username,
                  holder: scriptname,
                })}
          </div>
          <div className="mt-3">{code + ' ' + t('rejected')}</div>
        </div>
      );
    }
    return <></>;
  }
  return (
    <div className="h-full flex justify-center items-center text-xl">
      <Card
        title={<div className='flex justify-center'>{t('invite_confirm')}</div>}
        className="w-[40%] max-w-[500px]"
      >
        <InviteDetail invite_status={invite_status} />
      </Card>
      {/* <div className="flex w-[40%] flex-col max-w-[500px] bg-white rounded-md p-5">
        <div className="flex justify-center text-xl w-full">
          {t('invite_confirm')}
        </div>
        <Divider />
      </div> */}
    </div>
  );
}
