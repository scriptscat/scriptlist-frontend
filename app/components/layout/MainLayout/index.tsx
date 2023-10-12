import type { MenuProps } from 'antd';
import { message } from 'antd';
import { Avatar } from 'antd';
import { Divider } from 'antd';
import { Dropdown, Space } from 'antd';
import { Layout, Menu, Button, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import {
  MessageOutlined,
  HomeOutlined,
  CodeOutlined,
  ChromeOutlined,
  UserOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { RiSunLine, RiMoonLine, RiComputerLine } from 'react-icons/ri';
import { Link, useLocation, useNavigate } from '@remix-run/react';
import Search from '~/components/Search';
import { UserContext } from '~/context-manager';
import { lngMap } from '~/utils/i18n';
import { I18nContext, useTranslation } from 'react-i18next';
import i18n from '~/i18n';
import { useChangeLanguage } from 'remix-i18next';

const { Header, Footer, Content } = Layout;

const MainLayout: React.FC<{
  locale: string;
  children: ReactNode;
  oauthClient: string;
  apiUrl: string;
  onDarkModeChange: (dark: boolean) => void;
}> = ({ children, locale, oauthClient, apiUrl, onDarkModeChange }) => {
  const user = useContext(UserContext);
  const [dark, _setDark] = useState(user.dark ? 'dark' : 'light');
  const [mode, setMode] = useState('auto');
  const i18n = useContext(I18nContext);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMode(localStorage.getItem('styleMode') || 'auto');
  }, []);
  const uLocale = '/' + locale;
  const setDark = (mode: string) => {
    _setDark(mode);
    message.config({
      prefixCls: mode === 'light' ? 'light-message' : 'dark-message',
    });
    onDarkModeChange(mode === 'dark');
    document.cookie = 'styleMode=' + mode + ';path=/';
  };
  const current =
    location.pathname == uLocale + '/'
      ? 'home'
      : location.pathname == uLocale + '/search'
      ? 'list'
      : '';
  const items: MenuProps['items'] = [
    {
      label: <Link to={uLocale + '/'}>{t('home')}</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    {
      label: <a href="https://bbs.tampermonkey.net.cn">{t('community')}</a>,
      key: 'bbs',
      icon: <MessageOutlined />,
    },
    {
      label: <Link to={uLocale + '/search'}>{t('script_list')}</Link>,
      key: 'list',
      icon: <CodeOutlined />,
    },
    {
      label: <a href="https://docs.scriptcat.org/">{t('browser_extension')}</a>,
      key: 'extension',
      icon: <ChromeOutlined />,
    },
  ];

  useEffect(() => {
    if (mode == 'auto') {
      let media = window.matchMedia('(prefers-color-scheme: dark)');
      let isMatch = (match: boolean) => {
        if (match) {
          setDark('dark');
        } else {
          setDark('light');
        }
      };
      const callback = (e: { matches: any }) => {
        isMatch(e.matches);
      };
      media.addEventListener('change', callback);
      isMatch(media.matches);
    } else {
      setDark(mode);
    }
  }, [mode]);

  let DropdownIcon = <RiSunLine className="text-base cursor-pointer" />;
  switch (dark) {
    case 'dark':
      DropdownIcon = <RiMoonLine className="text-base cursor-pointer" />;
      break;
  }

  const gotoLogin = () => {
    window.open(
      'https://bbs.tampermonkey.net.cn/plugin.php?id=codfrm_oauth2:oauth&client_id=' +
        encodeURIComponent(oauthClient) +
        '&scope=user&response_type=code&redirect_uri=' +
        encodeURIComponent(apiUrl) +
        '%2Flogin%2Foauth%3Fredirect_uri%3D' +
        encodeURIComponent(location.pathname + '?' + location.search),
      '_self'
    );
  };

  let localeList = [];
  for (const [, lng] of Object.entries(lngMap)) {
    for (const [key, value] of Object.entries(lng)) {
      if (!value.hide) {
        localeList.push({
          label: <div className="text-sm">{value.name + '(' + key + ')'}</div>,
          key: key,
        });
      }
    }
  }

  localeList.push({
    label: <div className="text-sm">{t('help_translate')}</div>,
    key: 'help',
  });

  return (
    <>
      <ConfigProvider prefixCls={dark}>
        <Layout
          className={dark}
          style={{
            minHeight: '100%',
          }}
        >
          <Header className="flex flex-row">
            <div className="items-center flex flex-row justify-start basis-3/4">
              <div className="items-center flex flex-row w-full">
                <Link to={uLocale + '/'} className="hidden lg:block min-w-max">
                  <img
                    style={{
                      width: '32px',
                      height: '32px',
                    }}
                    src="/assets/logo.png"
                    alt="logo"
                  />
                </Link>
                <Menu
                  selectedKeys={[current]}
                  mode="horizontal"
                  items={items}
                  className="header-menu !ml-4 max-w-xs lg:max-w-none w-full"
                  style={{
                    border: 0,
                  }}
                />
              </div>
              {location.pathname == uLocale + '/search' && (
                <div
                  style={{
                    width: '80%',
                  }}
                >
                  <Search className="h-9 border w-full" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end basis-1/4">
              <Space className="!gap-3">
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    if (!user.user) {
                      message.info(t('please_login'));
                      return false;
                    } else {
                      window.open(uLocale + '/post-script', '_self');
                    }
                  }}
                >
                  {t('publish_script')}
                </Button>
                <Dropdown
                  menu={{
                    className: '!rounded-md border-inherit border-1 w-32 !mt-4',
                    selectedKeys: [mode],
                    onClick: ({ key }) => {
                      setMode(key);
                      localStorage.setItem('styleMode', key);
                    },
                    items: [
                      {
                        label: (
                          <Space>
                            <RiSunLine />
                            <p className="text-sm m-0">{t('light')}</p>
                          </Space>
                        ),
                        key: 'light',
                      },
                      {
                        label: (
                          <Space>
                            <RiMoonLine />
                            <p className="text-sm m-0">{t('dark')}</p>
                          </Space>
                        ),
                        key: 'dark',
                      },
                      {
                        label: (
                          <Space>
                            <RiComputerLine />
                            <p className="text-sm m-0">{t('system')}</p>
                          </Space>
                        ),
                        key: 'auto',
                      },
                    ],
                  }}
                  trigger={['click']}
                  placement="bottomLeft"
                >
                  {DropdownIcon}
                </Dropdown>
                <Dropdown
                  menu={{
                    className: '!rounded-md border-inherit border-1 w-50 !mt-4',
                    selectedKeys: [uLocale],
                    onClick: ({ key }) => {
                      if (key == 'help') {
                        window.open(
                          'https://crowdin.com/project/scriptlist',
                          '_blank'
                        );
                      } else {
                        // 修改路径为对应的语言
                        const newPathname = location.pathname.replace(
                          uLocale,
                          '/' + key
                        );
                        window.open(newPathname, '_self');
                      }
                    },
                    items: localeList,
                  }}
                  trigger={['click']}
                  placement="bottomLeft"
                >
                  <GlobalOutlined style={{ display: 'block' }} />
                </Dropdown>
                {user.user ? (
                  <Dropdown
                    menu={{
                      className:
                        '!rounded-md border-inherit border-1 w-32 !mt-4',
                      items: [
                        {
                          label: (
                            <Link
                              to={{
                                pathname:
                                  uLocale + '/users/' + user.user?.user_id,
                              }}
                            >
                              <Space className="anticon-middle">
                                <UserOutlined />
                                <p className="text-sm m-0">
                                  {t('personal_center')}
                                </p>
                              </Space>
                            </Link>
                          ),
                          key: 'users',
                        },
                      ],
                    }}
                    trigger={['click']}
                    placement="bottom"
                  >
                    <Avatar src={user.user.avatar}></Avatar>
                  </Dropdown>
                ) : (
                  <Button
                    id="go-to-login"
                    type="primary"
                    ghost
                    onClick={gotoLogin}
                  >
                    {t('login')}
                  </Button>
                )}
              </Space>
            </div>
          </Header>
          <Content className="w-4/5 m-auto p-4">{children}</Content>
          <Footer className="flex flex-col items-center">
            <div>
              <a
                href="https://bbs.tampermonkey.net.cn/"
                target="_blank"
                rel="noreferrer"
              >
                {t('tampermonkey_chinese_website')}
              </a>
              <Divider type="vertical" />
              <a
                href="https://docs.scriptcat.org/"
                target="_blank"
                rel="noreferrer"
              >
                {t('scriptcat')}
              </a>
              <Divider type="vertical" />
              <a
                href="https://github.com/scriptscat"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
            <p className="m-0 text-sm">{t('all_rights_reserved')}</p>
          </Footer>
        </Layout>
      </ConfigProvider>
    </>
  );
};

export default MainLayout;
