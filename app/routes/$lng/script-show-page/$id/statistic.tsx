import { Outlet, useLocation, useNavigate } from '@remix-run/react';
import { Card, Divider, Radio } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Statistic() {
  const location = useLocation();
  const [mode, setMode] = useState<'basic' | 'advanced'>(
    location.pathname.indexOf('advanced') === -1 ? 'basic' : 'advanced'
  );
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card>
      <Radio.Group
        value={mode}
        onChange={(value) => {
          setMode(value.target.value);
        }}
        className="w-full"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Radio.Button
          value="basic"
          onClick={() => {
            // 跳转到基础统计页面
            navigate('.');
          }}
          style={{
            flex: 1,
            textAlign: 'center',
          }}
        >
          {t('basic_statistics')}
        </Radio.Button>
        <Radio.Button
          value="advanced"
          onClick={() => {
            // 跳转到高级统计页面
            navigate('./advanced');
          }}
          style={{
            flex: 1,
            textAlign: 'center',
          }}
        >
          {t('advanced_statistics')}
        </Radio.Button>
      </Radio.Group>
      <Divider />
      <Outlet />
    </Card>
  );
}
