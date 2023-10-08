import { Outlet, useLocation, useNavigate } from '@remix-run/react';
import { Card, Divider, Radio } from 'antd';
import { useState } from 'react';

export default function Statistic() {
  const location = useLocation();
  const [mode, setMode] = useState<'basic' | 'advanced'>(
    location.pathname.indexOf('advanced') === -1 ? 'basic' : 'advanced'
  );
  const navigate = useNavigate();

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
          基础统计
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
          高级统计
        </Radio.Button>
      </Radio.Group>
      <Divider />
      <Outlet />
    </Card>
  );
}
