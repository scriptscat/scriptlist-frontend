import { Button, Card, Checkbox, Space } from 'antd';
import { QuestionCircleFilled, CodeFilled } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UAParser from 'ua-parser-js';
import Search from '~/components/Search';

export default function Index() {
  const [installUrl] = useState('https://docs.scriptcat.org/use');
  const { t } = useTranslation();
  const [browser, setBrowser] = useState(t("browser"));

  useEffect(() => {
    const ua = new UAParser(navigator.userAgent);
    // TODO: 跳转到对应的商店
    switch (ua.getBrowser().name) {
      case 'Edge':
        return setBrowser('Edge');
      case 'Chrome':
        return setBrowser('Chrome');
      case 'Firefox':
        return setBrowser('Firefox');
    }
  }, []);

  return (
    <div className="flex flex-col text-black dark:text-white gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl m-0">Script Cat</span>
        <span>{t('home_page_subtitle')}</span>
        <Search className="w-4/5" />
        <span className="text-2xl">{t('powerful_script_extension')}</span>
        <span>{t('more_possibilities_for_your_browser')}</span>
        <Space className="flex flex-row justify-center">
          <div>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              {t('greasemonkey_script')}
            </Checkbox>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              {t('background_script')}
            </Checkbox>
          </div>
          <div>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              {t('scheduled_script')}
            </Checkbox>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              {t('cloud_script')}
            </Checkbox>
          </div>
        </Space>
        <Button
          type="primary"
          className="!px-6"
          size="large"
          target={'_blank'}
          href={installUrl}
        >
          {t('add_scriptcat_to')} {browser}
        </Button>
      </div>
      <div className="flex flex-col justify-between gap-6 lg:flex-row">
        <Card className="flex-1 !rounded-xl">
          <div className="text-center flex flex-col sm:max-lg:flex-row">
            <div className="card-title">
              <img
                style={{
                  width: '64px',
                  height: '64px',
                  display: 'inline-block',
                }}
                src="/assets/logo.png"
                alt="logo"
              />
              <p className="text-3xl m-0">{t('scriptcat')}</p>
            </div>
            <div className="text-left text-gray-500">
              <p className="m-0">{t('scriptcat_description')}</p>
              <p className="m-0 mt-2 font-bold">
                {t('if_you_have_installed_other_script_managers')}
              </p>
              <p className="m-0 font-bold">
                {t('if_you_want_to_use_scriptcat')}{' '}
                <a target="_blank" href={installUrl} rel="noreferrer">
                  {t('install_scriptcat')}
                </a>
              </p>
            </div>
          </div>
        </Card>
        <Card className="flex-1 !rounded-xl">
          <div className="text-center flex flex-col sm:max-lg:flex-row">
            <div className="card-title">
              <QuestionCircleFilled
                className="text-6xl"
                style={{ color: '#4695d5' }}
              />
              <p className="text-3xl m-0">{t('common_questions')}</p>
            </div>
            <div className="text-left text-gray-500">
              <p className="m-0 font-bold">
                {t('what_are_greasemonkey_scripts')}
              </p>
              <p className="m-0">
                {t('greasemonkey_scripts_can_extend_web_page_functionality')}
              </p>
              <p className="m-0 font-bold"> {t('what_is_scriptcat')}</p>
              <p className="m-0">
                {t(
                  'scriptcat_is_based_on_greasemonkey_and_supports_most_greasemonkey_scripts'
                )}
              </p>
              <p className="m-0 font-bold">
                {t('how_to_use_greasemonkey_scripts')}
              </p>
              <p>
                {t(
                  'using_greasemonkey_scripts_requires_installing_greasemonkey_manager'
                )}
              </p>
            </div>
          </div>
        </Card>
        <Card className="flex-1 !rounded-xl">
          <div className="text-center flex flex-col sm:max-lg:flex-row">
            <div className="card-title">
              <CodeFilled className="text-6xl" style={{ color: '#4695d5' }} />
              <p className="text-3xl m-0">{t('become_a_developer')}</p>
            </div>
            <div className="text-left text-gray-500">
              <p className="m-0">
                {t('as_a_forum_developer_we_can_offer_the_following_benefits')}
              </p>
              <p className="m-0">{t('1_forum_homepage_recommendation')}</p>
              <p className="m-0">
                {t('2_wechat_official_account_article_recommendation')}
              </p>
              <p className="m-0">
                {t(
                  '3_you_will_be_invited_to_a_technical_community_of_developers'
                )}
              </p>
              <p className="m-0">
                {t(
                  '4_if_you_are_willing_we_will_also_display_your_information'
                )}
              </p>
              <p className="m-0">
                {t('5_forum_and_channel_developer_user_group_permissions')}
              </p>
              <p className="m-0">{t('6_and_more')}</p>
              <p className="m-0">
                {t(
                  'if_you_also_want_to_become_a_developer_please_refer_to_our_tutorial'
                )}
                <a
                  href="https://bbs.tampermonkey.net.cn/thread-1234-1-1.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('tampermonkey_chinese_website')}
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
