import { Card, Divider } from 'antd';
import { useState, useEffect } from 'react';
import { Line } from '@ant-design/plots';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { Statistics, StatisticsChart } from '~/services/scripts/types';
import { GetRealtime, GetStatistics } from '~/services/scripts/api';
import { useLoaderData } from '@remix-run/react';
import { useContext } from 'react';
import { ScriptContext } from '~/context-manager';
import { splitNumber } from '~/utils/utils';
import { useTranslation } from 'react-i18next';

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
      <Line className="w-full" {...config} />
    </div>
  );
};

const RealtimeColumn: React.FC<{ scriptId: number }> = ({ scriptId }) => {
  const [chartData, setChartData] = useState([{}]);
  const { t } = useTranslation();

  useEffect(() => {
    const time = setInterval(async () => {
      const resp = await GetRealtime(scriptId);
      const data = resp.data;
      const chartData = [];
      for (let i = 0; i < data.download.x.length; i++) {
        chartData.push(
          {
            name: '安装',
            time: data.download.x[i],
            num: data.download.y[i],
          },
          {
            name: '更新',
            time: data.update.x[i],
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
    xField: 'time',
    yField: 'num',
    seriesField: 'name',
  };

  return (
    <div className="flex flex-col items-center w-full">
      <span>{t('realtime_update_download')}</span>
      <Line
        className="w-full"
        renderer="canvas"
        animation={false}
        {...config}
      />
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

export default function Basic() {
  const data = useLoaderData<LoaderData>();
  const script = useContext(ScriptContext);
  const { t } = useTranslation();

  return (
    <>
      <Card className="!p-0">
        <Card.Grid hoverable={false} className="!w-full !p-2">
          <div className="flex flex-row justify-between statistic">
            <div className="flex flex-col border-r pr-4 gap-1">
              <span></span>
              <span>{t('today')}</span>
              <span>{t('yesterday')}</span>
              <span>{t('this_week')}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>{t('page_views')}</span>
              <span className="text-lg font-bold">
                {splitNumber(data.data.page_pv.today.toString())}
              </span>
              <span>{splitNumber(data.data.page_pv.yesterday.toString())}</span>
              <span>{splitNumber(data.data.page_pv.week.toString())}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>{t('visitors')}</span>
              <span className="text-lg font-bold">
                {splitNumber(data.data.page_uv.today.toString())}
              </span>
              <span>{splitNumber(data.data.page_uv.yesterday.toString())}</span>
              <span>{splitNumber(data.data.page_uv.week.toString())}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>{t('installs')}</span>
              <span className="text-lg font-bold">
                {splitNumber(data.data.download_uv.today.toString())}
              </span>
              <span>
                {splitNumber(data.data.download_uv.yesterday.toString())}
              </span>
              <span>{splitNumber(data.data.download_uv.week.toString())}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>{t('updates')}</span>
              <span className="text-lg font-bold">
                {splitNumber(data.data.update_uv.today.toString())}
              </span>
              <span>
                {splitNumber(data.data.update_uv.yesterday.toString())}
              </span>
              <span>{splitNumber(data.data.update_uv.week.toString())}</span>
            </div>
            {/* {user.user!.is_admin == 1 && (
              <div className="flex flex-col p-4">
                <span>{t('platform_users')}</span>
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
            )} */}
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
          title={t('30_day_install_uv_pv')}
          uv={data.data.uv_chart.download}
          pv={data.data.pv_chart.download}
        />
      </div>
      <Divider />
      <div className="flex flex-row justify-between">
        <PvUv
          title={t('30_day_update_uv_pv')}
          uv={data.data.uv_chart.update}
          pv={data.data.pv_chart.update}
        />
      </div>
      <Divider />
      <div className="text-center">
        <span>{t('data_disclaimer')}</span>
      </div>
    </>
  );
}
