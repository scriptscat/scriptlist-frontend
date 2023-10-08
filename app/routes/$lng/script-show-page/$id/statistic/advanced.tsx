import { Line, Pie } from '@ant-design/plots';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Input, List, message, TablePaginationConfig } from 'antd';
import { Card, Divider, Progress, Table, Tooltip } from 'antd';
import { json } from '@remix-run/node';
import {
  GetAdvRealtimeChart,
  GetAdvStatistics,
  GetOriginList,
  GetVisitDomain,
  GetVisitList,
  UpdateWhitelist,
} from '~/services/scripts/api';
import type {
  AdvStatistics,
  PieChart,
  VisitListItem,
} from '~/services/scripts/types';
import React, { useContext, useEffect, useState } from 'react';
import { ScriptContext } from '~/context-manager';
import type { APIListResponse } from '~/services/http';
import { formatDate, secondToMinute } from '~/utils/utils';
import { useTranslation } from 'react-i18next';

export type LoaderData = {
  data: AdvStatistics;
};

const PieChartList: React.FC<{
  scriptId: number;
  fetchDataFunc: (
    scriptId: number,
    page: number
  ) => Promise<APIListResponse<PieChart>>;
  columns: { title1: string; title2: string };
}> = ({ scriptId, fetchDataFunc, columns }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PieChart[]>([]);
  const [total, setTotal] = useState(0);
  const fetchData = (page: number) => {
    setLoading(true);
    fetchDataFunc(scriptId, page).then((resp) => {
      setData(resp.data.list);
      setLoading(false);
      setTotal(resp.data.total);
    });
  };
  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  return (
    <Table
      className="flex-1"
      size="small"
      columns={[
        {
          title: columns.title1,
          dataIndex: 'key',
          key: 'key',
          render(value: string, record, index) {
            if (value === '') {
              return t('local_creation'); // Translate the text using the t function
            }
            // 截取长度,并检查有没有http前缀
            if (!value.startsWith('http')) {
              value = 'http://' + value;
            }
            if (value.length > 20) {
              return (
                <a href={value} target="_blank" rel="noreferrer">
                  {value.slice(0, 20) + '...'}
                </a>
              );
            }
            return (
              <a href={value} target="_blank" rel="noreferrer">
                {value}
              </a>
            );
          },
        },
        { title: columns.title2, dataIndex: 'value', key: 'value' },
      ]}
      dataSource={data}
      loading={loading}
      pagination={{
        hideOnSinglePage: true,
        total: total,
        current: page,
        pageSize: 20,
        showSizeChanger: false,
      }}
      onChange={(pagination: TablePaginationConfig) => {
        setPage(pagination.current || 1);
      }}
    ></Table>
  );
};

const VisitTable: React.FC<{ scriptId: number }> = ({ scriptId }) => {
  const { t } = useTranslation(); 
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<VisitListItem[]>([]);
  const [total, setTotal] = useState(0);
  const fetchData = (page: number) => {
    setLoading(true);
    GetVisitList(scriptId, page).then((resp) => {
      setData(resp.data.list);
      setLoading(false);
      setTotal(resp.data.total);
    });
  };
  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  return (
    <Table
      className="flex-1"
      size="small"
      columns={[
        {
          title: t('visitor_id'), // Translate the text using the t function
          dataIndex: 'visitor_id',
          key: 'visitor_id',
          render(value) {
            // 截取16位
            return value.slice(0, 16);
          },
        },
        {
          title: t('operation_page'), // Translate the text using the t function
          dataIndex: 'operation_page',
          key: 'operation_page',
          render(value) {
            // 超过20个字符就截取
            if (value.length > 20) {
              return (
                <a href={value} target="_blank" rel="noreferrer">
                  {value.slice(0, 20) + '...'}
                </a>
              );
            }
            return (
              <a href={value} target="_blank" rel="noreferrer">
                {value}
              </a>
            );
          },
        },
        {
          title: t('duration'), // Translate the text using the t function
          dataIndex: 'duration',
          key: 'duration',
          render(value) {
            return secondToMinute(value);
          },
        },
        {
          title: t('visit_time'), // Translate the text using the t function
          dataIndex: 'visit_time',
          key: 'visit_time',
          render(value) {
            return formatDate(value);
          },
        },
        {
          title: t('exit_time'), // Translate the text using the t function
          dataIndex: 'exit_time',
          key: 'exit_time',
          render(value) {
            if (value === '') {
              return '-';
            }
            return formatDate(value);
          },
        },
      ]}
      dataSource={data}
      loading={loading}
      pagination={{
        hideOnSinglePage: true,
        total: total,
        current: page,
        pageSize: 20,
        showSizeChanger: false,
      }}
      onChange={(pagination: TablePaginationConfig) => {
        setPage(pagination.current || 1);
      }}
    ></Table>
  );
};

const RealtimeColumn: React.FC<{ scriptId: number }> = ({ scriptId }) => {
  const { t } = useTranslation(); // Initialize the useTranslation hook
  const [chartData, setChartData] = useState([{}]);
  useEffect(() => {
    const time = setInterval(async () => {
      const resp = await GetAdvRealtimeChart(scriptId);
      const data = resp.data;
      const chartData = [];
      for (let i = 0; i < data.chart.x.length; i++) {
        chartData.push({
          name: t('realtime_user_count'), // Translate the text using the t function
          time: data.chart.x[i],
          num: data.chart.y[i],
        });
      }
      setChartData(chartData);
    }, 2000);
    return () => {
      clearInterval(time);
    };
  });

  return (
    <Line
      className="flex-4"
      style={{ height: 300 }}
      renderer="canvas"
      animation={false}
      data={chartData}
      xField="time"
      yField="num"
      seriesField="name"
    />
  );
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const resp = await GetAdvStatistics(parseInt(params.id as string), request);
  if (resp.code !== 0) {
    throw new Response(resp.msg, {
      status: 403,
      statusText: 'Forbidden',
    });
  }
  return json({ data: resp.data } as LoaderData);
};

export default function Advanced() {
  const { t } = useTranslation(); // Initialize the useTranslation hook
  const data = useLoaderData<LoaderData>();
  const script = useContext(ScriptContext);
  const [whitelist, setWhitelist] = useState<string[]>(
    data.data.whitelist || []
  );
  const [whitelistAdd, setWhitelistAdd] = useState('');

  const submitWhitlist = async () => {
    const resp = await UpdateWhitelist(script.script!.id, [
      ...whitelist,
      whitelistAdd,
    ]);
    if (resp.code === 0) {
      setWhitelist(resp.data.whitelist);
      setWhitelistAdd('');
    } else {
      message.error(resp.msg);
    }
  };
  return (
    <>
      <div>
        <span>
          {t('advanced_stats_require')}{' '}
          <a
            href="https://scriptcat.org/script-show-page/881"
            target="_blank"
            rel="noreferrer"
          >
            {t('advanced_stats_lib')}
          </a>{' '}
          {t('advanced_stats_description')}
        </span>
      </div>
      <div className="text-center">
        <Tooltip title={data.data.limit.usage} placement="bottom">
          <Progress
            percent={Math.floor(
              (data.data.limit.usage / data.data.limit.quota) * 100
            )}
          />
        </Tooltip>
        <span>
          {t('limited_server_resources')} {data.data.limit.quota}{' '}
          {t('data_entries')}
        </span>
      </div>
      <Divider />
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
              <span>{t('script_executions_pv')}</span>
              <span className="text-lg font-bold">{data.data.pv.today}</span>
              <span>{data.data.pv.yesterday}</span>
              <span>{data.data.pv.week}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>{t('script_users_uv')}</span>
              <span className="text-lg font-bold">{data.data.uv.today}</span>
              <span>{data.data.uv.yesterday}</span>
              <span>{data.data.uv.week}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>{t('ip_count')}</span>
              <span className="text-lg font-bold">{data.data.ip.today}</span>
              <span>{data.data.ip.yesterday}</span>
              <span>{data.data.ip.week}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>{t('avg_usage_time')}</span>
              <span className="text-lg font-bold">
                {secondToMinute(data.data.use_time.today)}
              </span>
              <span>{secondToMinute(data.data.use_time.yesterday)}</span>
              <span>{secondToMinute(data.data.use_time.week)}</span>
            </div>
          </div>
        </Card.Grid>
      </Card>
      <Divider orientation="left">{t('statistics_key')}</Divider>
      <Input value={data.data.statistics_key} readOnly style={{ width: 200 }} />
      <Divider orientation="left">{t('whitelist_collection')}</Divider>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 4,
          lg: 4,
          xl: 6,
          xxl: 3,
        }}
        renderItem={(item) => {
          return (
            <List.Item>
              <span>{item}</span>
              <Button
                type="link"
                size="small"
                onClick={async () => {
                  const tmpWhitelist = whitelist.filter((v) => v !== item);
                  const resp = await UpdateWhitelist(
                    script.script!.id,
                    tmpWhitelist
                  );
                  if (resp.code === 0) {
                    setWhitelist(resp.data.whitelist);
                    setWhitelistAdd('');
                  } else {
                    message.error(resp.msg);
                  }
                }}
              >
                {t('delete')}
              </Button>
            </List.Item>
          );
        }}
        dataSource={whitelist}
        footer={
          <div>
            <span>{t('add_whitelist')}: </span>
            <Input
              style={{ width: 200 }}
              value={whitelistAdd}
              onChange={(e) => {
                setWhitelistAdd(e.target.value);
              }}
              onPressEnter={submitWhitlist}
            />
            <Button type="primary" onClick={submitWhitlist}>
              {t('add')}
            </Button>
          </div>
        }
      />
      <Divider />
      <div className="flex flex-row w-full gap-4">
        <Card
          title={t('user_installation_source')}
          className="flex-1"
          size="small"
          bordered={false}
        >
          <PieChartList
            scriptId={script.script!.id}
            fetchDataFunc={GetOriginList}
            columns={{ title1: t('source'), title2: t('user_count') }}
          />
        </Card>
        <Card
          title={t('visit_domain')}
          className="flex-1"
          size="small"
          bordered={false}
        >
          <PieChartList
            scriptId={script.script!.id}
            fetchDataFunc={GetVisitDomain}
            columns={{ title1: t('visit_domain'), title2: t('user_count') }}
          />
        </Card>
        <Card
          title={t('new_old_users')}
          className="flex-1"
          size="small"
          bordered={false}
        >
          <Pie
            colorField="key"
            angleField="value"
            data={data.data.new_old_user}
          />
        </Card>
      </div>
      <Divider />
      <div className="flex flex-row w-full gap-4">
        <Card
          title={t('version_distribution')}
          className="flex-1"
          size="small"
          bordered={false}
        >
          <Pie colorField="key" angleField="value" data={data.data.version} />
        </Card>
        <Card
          title={t('terminal_devices')}
          className="flex-1"
          size="small"
          bordered={false}
        >
          <Pie colorField="key" angleField="value" data={data.data.system} />
        </Card>
        <Card
          title={t('browsers')}
          className="flex-1"
          size="small"
          bordered={false}
        >
          <Pie colorField="key" angleField="value" data={data.data.browser} />
        </Card>
      </div>
      <Divider />
      <Card title={t('realtime_users')} size="small" bordered={false}>
        <div className="flex flex-row gap-4">
          <RealtimeColumn scriptId={script.script!.id} />
          <VisitTable scriptId={script.script!.id} />
        </div>
      </Card>
    </>
  );
}
