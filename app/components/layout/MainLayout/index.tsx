import { Avatar, MenuProps } from 'antd';
import { Divider } from 'antd';
import { Dropdown, Space } from 'antd';
import { Layout, Menu, Button, ConfigProvider } from 'antd';
import { ReactNode, useContext } from 'react';
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
import { useLocation } from 'react-router-dom';
import { Link } from '@remix-run/react';
import Search from '~/components/Search';
import { UserContext } from '~/context-manager';

const { Header, Footer, Content } = Layout;

const items: MenuProps['items'] = [
  {
    label: '首页',
    key: 'home',
    icon: <HomeOutlined />,
  },
  {
    label: '社区',
    key: 'bbs',
    icon: <MessageOutlined />,
  },
  {
    label: '脚本列表',
    key: 'list',
    icon: <CodeOutlined />,
  },
  {
    label: '浏览器扩展',
    key: 'extension',
    icon: <ChromeOutlined />,
  },
];

const MainLayout: React.FC<{
  children: ReactNode;
  styleMode: string;
  oauthClient: string;
  apiUrl: string;
}> = ({ children, styleMode, oauthClient, apiUrl }) => {
  const [dark, setDark] = useState(styleMode || 'light');
  const [mode, setMode] = useState(styleMode || 'auto');
  const location = useLocation();
  const current = location.pathname == '/' ? 'home' : '';
  const user = useContext(UserContext);
  const modeMenu = (
    <Menu
      className="!rounded-md border-inherit border-1 w-32 !mt-4"
      selectedKeys={[mode]}
      onClick={({ key }) => {
        setMode(key);
        if (key == 'auto') {
          key = '';
        }
        document.cookie = 'styleMode=' + key;
      }}
    >
      <Menu.Item key="light">
        <Space>
          <RiSunLine />
          <p className="text-sm m-0">Light</p>
        </Space>
      </Menu.Item>
      <Menu.Item key="dark">
        <Space>
          <RiMoonLine />
          <p className="text-sm m-0">Dark</p>
        </Space>
      </Menu.Item>
      <Menu.Item key="auto">
        <Space>
          <RiComputerLine />
          <p className="text-sm m-0">跟随系统</p>
        </Space>
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu className="!rounded-md border-inherit border-1 w-32 !mt-4">
      <Menu.Item key="light">
        <Space>
          <UserOutlined />
          <p className="text-sm m-0">个人中心</p>
        </Space>
      </Menu.Item>{' '}
    </Menu>
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
    <>
      <ConfigProvider prefixCls={dark}>
        <Layout className={dark}>
          <Header className="flex flex-row">
            <div className="items-center flex flex-row justify-start basis-3/4">
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
                className="header-menu !ml-4 max-w-xs lg:max-w-none"
                style={{
                  border: 0,
                }}
              />
              {location.pathname == '/search' && (
                <Search className="h-9 border w-full" />
              )}
            </div>
            <div className="flex items-center justify-end basis-1/4">
              <Space className="!gap-3">
                {user.user && (
                  <Button type="primary" size="small">
                    发布脚本
                  </Button>
                )}
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
                    placement="bottomCenter"
                  >
                    <Avatar
                      src={
                        'https://scriptcat.org/api/v1/user/avatar/' +
                        user.user.user.uid
                      }
                    ></Avatar>
                  </Dropdown>
                ) : (
                  <Button type="primary" ghost onClick={gotoLogin}>
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
      </ConfigProvider>
    </>
  );
};

export default MainLayout;
