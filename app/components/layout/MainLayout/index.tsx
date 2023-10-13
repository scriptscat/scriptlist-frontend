import type { MenuProps } from 'antd';
import { message, theme } from 'antd';
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
} from '@ant-design/icons';
import { RiSunLine, RiMoonLine, RiComputerLine } from 'react-icons/ri';
import { Link, useLocation } from '@remix-run/react';
import Search from '~/components/Search';
import { UserContext } from '~/context-manager';
import useToken from 'antd/es/theme/useToken';

const { Header, Footer, Content } = Layout;

const items: MenuProps['items'] = [
  {
    label: <Link to={'/'}>首页</Link>,
    key: 'home',
    icon: <HomeOutlined />,
  },
  {
    label: <a href="https://bbs.tampermonkey.net.cn">社区</a>,
    key: 'bbs',
    icon: <MessageOutlined />,
  },
  {
    label: <Link to={'/search'}>脚本列表</Link>,
    key: 'list',
    icon: <CodeOutlined />,
  },
  {
    label: <a href="https://docs.scriptcat.org/">浏览器扩展</a>,
    key: 'extension',
    icon: <ChromeOutlined />,
  },
];

const MainLayout: React.FC<{
  children: ReactNode;
  styleMode: string;
  oauthClient: string;
  apiUrl: string;
  onDarkModeChange: (dark: boolean) => void;
}> = ({ children, styleMode, oauthClient, apiUrl, onDarkModeChange }) => {
  const user = useContext(UserContext);
  const [dark, _setDark] = useState(styleMode || 'light');
  const { token } = theme.useToken();
  const setDark = (mode: string) => {
    if (mode === 'light') {
      document.body.style.backgroundColor = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#000000';
    }
    _setDark(mode);
    message.config({
      prefixCls: mode === 'light' ? 'light-message' : 'dark-message',
    });
    onDarkModeChange(mode === 'dark');
  };
  const [mode, setMode] = useState(styleMode || 'auto');
  const location = useLocation();
  const current =
    location.pathname == '/'
      ? 'home'
      : location.pathname == '/search'
      ? 'list'
      : '';
  const modeMenu = (
    <Menu
      className="!rounded-md border-inherit border-1 w-32 !mt-4"
      selectedKeys={[mode]}
      onClick={({ key }) => {
        setMode(key);
        if (key == 'auto') {
          key = '';
        }
        document.cookie = 'styleMode=' + key + ';path=/';
      }}
      items={[
        {
          label: (
            <Space>
              <RiSunLine />
              <p className="text-sm m-0">Light</p>
            </Space>
          ),
          key: 'light',
        },
        {
          label: (
            <Space>
              <RiMoonLine />
              <p className="text-sm m-0">Dark</p>
            </Space>
          ),
          key: 'dark',
        },
        {
          label: (
            <Space>
              <RiComputerLine />
              <p className="text-sm m-0">跟随系统</p>
            </Space>
          ),
          key: 'auto',
        },
      ]}
    ></Menu>
  );

  const userMenu = (
    <Menu
      className="!rounded-md border-inherit border-1 w-32 !mt-4"
      items={[
        {
          label: (
            <Link to={{ pathname: '/users/' + user.user?.user_id }}>
              <Space className="anticon-middle">
                <UserOutlined />
                <p className="text-sm m-0">个人中心</p>
              </Space>
            </Link>
          ),
          key: 'users',
        },
      ]}
    ></Menu>
  );

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

  let DropdownIcon = <RiSunLine className="text-base" />;
  switch (dark) {
    case 'dark':
      DropdownIcon = <RiMoonLine className="text-base" />;
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

  return (
    <Layout
      className={dark}
      style={{
        minHeight: '100%',
      }}
    >
      <Header
        className="flex flex-row"
        style={{
          background: token.colorBgContainer,
        }}
      >
        <div className="items-center flex flex-row justify-start basis-3/4">
          <div className="items-center flex flex-row w-full">
            <Link to="/" className="hidden lg:block min-w-max">
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
          {location.pathname == '/search' && (
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
                  message.info('请先登录');
                  return false;
                } else {
                  window.open('/post-script', '_self');
                }
              }}
            >
              发布脚本
            </Button>
            <Dropdown
              overlay={modeMenu}
              trigger={['click']}
              placement="bottomLeft"
            >
              {DropdownIcon}
            </Dropdown>
            {user.user ? (
              <Dropdown
                overlay={userMenu}
                trigger={['click']}
                placement="bottom"
              >
                <Avatar src={user.user.avatar}></Avatar>
              </Dropdown>
            ) : (
              <Button id="go-to-login" type="primary" ghost onClick={gotoLogin}>
                登录
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
            油猴中文网
          </a>
          <Divider type="vertical" />
          <a
            href="https://docs.scriptcat.org/"
            target="_blank"
            rel="noreferrer"
          >
            脚本猫
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
        <p className="m-0 text-sm">
          © 2022-至今 ScriptCat. All rights reserved.
        </p>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
