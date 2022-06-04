import { Card, Divider } from 'antd';
import { useState, useEffect } from 'react';
import { Line, Column, Area } from '@ant-design/plots';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type {
  Realtime,
  Statistics,
  StatisticsChart,
} from '~/services/scripts/types';
import { GetRealtime, GetStatistics } from '~/services/scripts/api';
import { useLoaderData } from '@remix-run/react';
import { useContext } from 'react';
import { ScriptContext, UserContext } from '~/context-manager';
import { splitNumber } from '~/utils/utils';

// 30天pv uv图
const PvUv: React.FC<{
  title: string;
  uv: StatisticsChart;
  pv: StatisticsChart;
}> = ({ title, uv, pv }) => {
  const data = [{}];

  for (let i = 0; i < uv.x.length; i++) {
    data.push(
      {
        name: 'uv',
        date: uv.x[i],
        num: uv.y[i],
      },
      {
        name: 'pv',
        date: pv.x[i],
        num: pv.y[i],
      }
    );
  }

  const config = {
    data,
    xField: 'date',
    yField: 'num',
    seriesField: 'name',
  };

  return (
    <div className="flex flex-col items-center w-full">
      <span>{title}</span>
      <Area className="w-full" {...config} />
    </div>
  );
};

const RealtimeColumn: React.FC<{ scriptId: number }> = ({ scriptId }) => {
  const [chartData, setChartData] = useState([{}]);
  useEffect(() => {
    const time = setInterval(async () => {
      const resp = await GetRealtime(scriptId);
      const data = resp.data;
      const chartData = [];
      for (let i = 0; i < data.download.x.length; i++) {
        chartData.push(
          {
            name: '安装',
            date: data.download.x[i],
            num: data.download.y[i],
          },
          {
            name: '更新',
            date: data.update.x[i],
            num: data.update.y[i],
          }
        );
      }
      setChartData(chartData);
    }, 2000);
    return () => {
      clearInterval(time);
    };
  });

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'num',
    seriesField: 'name',
  };

  return (
    <div className="flex flex-col items-center w-full">
      <span>实时更新与下载量</span>
      <Area className="w-full" {...config} />
    </div>
  );
};

export type LoaderData = {
  data: Statistics;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const resp = await GetStatistics(parseInt(params.id as string), request);
  if (resp.code != 0) {
    throw new Response(resp.msg, {
      status: 403,
      statusText: 'Forbidden',
    });
  }
  return json({ data: resp.data } as LoaderData);
};

export default function Statistic() {
  const user = useContext(UserContext);
  const data = useLoaderData<LoaderData>();
  const script = useContext(ScriptContext);
  return (
    <Card>
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
              <span className="text-lg font-bold">
                {splitNumber(data.data.page['today-pv'].toString())}
              </span>
              <span>
                {splitNumber(data.data.page['yesterday-pv'].toString())}
              </span>
              <span>{splitNumber(data.data.page['week-pv'].toString())}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>访客数(UV)</span>
              <span className="text-lg font-bold">
                {splitNumber(data.data.page['today-uv'].toString())}
              </span>
              <span>
                {splitNumber(data.data.page['yesterday-uv'].toString())}
              </span>
              <span>{splitNumber(data.data.page['week-uv'].toString())}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>安装数</span>
              <span className="text-lg font-bold">
                {splitNumber(data.data.download['today-uv'].toString())}
              </span>
              <span>
                {splitNumber(data.data.download['yesterday-uv'].toString())}
              </span>
              <span>
                {splitNumber(data.data.download['week-uv'].toString())}
              </span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>更新数</span>
              <span className="text-lg font-bold">
                {splitNumber(data.data.update['today-uv'].toString())}
              </span>
              <span>
                {splitNumber(data.data.update['yesterday-uv'].toString())}
              </span>
              <span>{splitNumber(data.data.update['week-uv'].toString())}</span>
            </div>
            {user.user!.is_admin == 1 && (
              <div className="flex flex-col p-4">
                <span>平台用户数</span>
                <span className="text-lg font-bold">
                  {splitNumber(data.data.page['today-member'].toString())}
                </span>
                <span>
                  {splitNumber(data.data.page['yesterday-member'].toString())}
                </span>
                <span>
                  {splitNumber(data.data.page['week-member'].toString())}
                </span>
              </div>
            )}
          </div>
        </Card.Grid>
      </Card>
      <Divider />
      <div>
        <RealtimeColumn scriptId={script.script!.id} />
      </div>
      <Divider />
      <div>
        <PvUv
          title="30天安装uv/pv"
          uv={data.data.download.uv}
          pv={data.data.download.pv}
        />
      </div>
      <Divider />
      <div className="flex flex-row justify-between">
        <PvUv
          title="30天更新uv/pv"
          uv={data.data.update.uv}
          pv={data.data.update.pv}
        />
      </div>
      <Divider />
      <div className="text-center">
        <span>以上数据仅为参考，若有出入请以实际为准</span>
      </div>
    </Card>
  );
}
