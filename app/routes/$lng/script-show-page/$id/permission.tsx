import { ApartmentOutlined, UserOutlined } from '@ant-design/icons';
import { LoaderFunction } from '@remix-run/node';
import { Outlet, useLocation } from '@remix-run/react';
import { Button, Card, Menu, MenuProps } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQueryState } from '~/utils/utils';



export default function Permission() {
  const [activeMenu, setActiveMenu] = useState<string>('');
  const { t } = useTranslation();
  const location = useLocation();
  const menuList = [
    {
      label: t('access_role_manage'),
      key: 'accessRole',
      icon: <ApartmentOutlined />,
    },
    {
      label: t('user_group_manage'),
      key: 'userGroup',
      icon: <UserOutlined />,
    },
  ];
  const menuClick: MenuProps['onClick'] = (event) => {
    setActiveMenu(event.key);
  };
  const isMobile = useMediaQueryState({ query: '(max-width: 850px)' });
  useEffect(() => {
    if (menuList[0] != null && menuList[0].key !== undefined) {
      setActiveMenu(menuList[0].key as string);
    }
  }, []);
  return (
    <Card>
      <div className={(isMobile ? 'flex-col flex' : 'flex') + ' min-h-[380px]'}>
        <Menu
          className="shrink-0"
          selectedKeys={[activeMenu]}
          onClick={menuClick}
          style={isMobile ? {} : { width: 180 }}
          mode={isMobile ? 'horizontal' : 'vertical'}
          items={menuList}
        />
      </div>
      <Outlet />
    </Card>
  );
}
