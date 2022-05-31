import { Alert, Card, Divider } from 'antd';
import { useState, useEffect } from 'react';
import { Line, Column } from '@ant-design/plots';

// 周对比图
const WeekLine = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch(
      'https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json'
    )
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    data,
    xField: 'year',
    yField: 'value',
    seriesField: 'category',
    yAxis: {
      label: {
        // 数值格式化为千分位
        formatter: (v: any) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
    color: ['#1979C9', '#D62A0D', '#FAA219'],
  };

  return <Line {...config} />;
};

// 实时统计
const RealtimeColumn = () => {
  const data = [
    {
      type: '家具家电',
      sales: 38,
    },
    {
      type: '粮油副食',
      sales: 52,
    },
    {
      type: '生鲜水果',
      sales: 61,
    },
    {
      type: '美容洗护',
      sales: 145,
    },
    {
      type: '母婴用品',
      sales: 48,
    },
    {
      type: '进口食品',
      sales: 38,
    },
    {
      type: '食品饮料',
      sales: 38,
    },
    {
      type: '家庭清洁',
      sales: 38,
    },
  ];
  const config = {
    data,
    xField: 'type',
    yField: 'sales',
    columnWidthRatio: 0.8,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: {
        alias: '时间',
      },
      sales: {
        alias: '数量',
      },
    },
  };
  return <Column {...config} />;
};

export default function Statistic() {
  return (
    <Card>
      <Alert
        message="TODO"
        description="以下数据仅供参考"
        type="info"
        showIcon
      />
      <Card className="!p-0">
        <Card.Grid hoverable={false} className="!w-full !p-2">
          <div className="flex flex-row justify-between statistic">
            <div className="flex flex-col border-r pr-4 gap-1">
              <span></span>
              <span>今日</span>
              <span>昨日</span>
              <span>本周</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>浏览数(PV)</span>
              <span className="text-lg font-bold">1,000</span>
              <span>100</span>
              <span>100,000</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>访客数(UV)</span>
              <span className="text-lg font-bold">1,000</span>
              <span>100</span>
              <span>100,000</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>安装数</span>
              <span className="text-lg font-bold">1,000</span>
              <span>100</span>
              <span>100,000</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>更新数</span>
              <span className="text-lg font-bold">1,000</span>
              <span>100</span>
              <span>100,000</span>
            </div>
            <div className="flex flex-col p-4">
              <span>独立用户数</span>
              <span className="text-lg font-bold">1,000</span>
              <span>100</span>
              <span>100,000</span>
            </div>
          </div>
        </Card.Grid>
      </Card>
      <Divider />
      <div className="flex flex-row justify-between">
        <RealtimeColumn />
        <RealtimeColumn />
      </div>
      <Divider />
      <div className="flex flex-row justify-between">
        <WeekLine />
        <WeekLine />
      </div>
      <Divider />
      <div className="flex flex-row justify-between">
        <WeekLine />
        <WeekLine />
      </div>
      <Divider />
      <div className="text-center">
        <span>以上数据仅为参考，若有出入请以实际为准</span>
      </div>
    </Card>
  );
}
