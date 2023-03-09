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
            if (value == '') {
              return '本地新建';
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
          title: '访客id',
          dataIndex: 'visitor_id',
          key: 'visitor_id',
          render(value) {
            // 截取16位
            return value.slice(0, 16);
          },
        },
        {
          title: '访问页面',
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
                value
              </a>
            );
          },
        },
        {
          title: '停留时间',
          dataIndex: 'duration',
          key: 'duration',
          render(value) {
            return secondToMinute(value);
          },
        },
        {
          title: '访问时间',
          dataIndex: 'visit_time',
          key: 'visit_time',
          render(value) {
            return formatDate(value);
          },
        },
        {
          title: '退出时间',
          dataIndex: 'exit_time',
          key: 'exit_time',
          render(value) {
            if (value == '') {
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
  const [chartData, setChartData] = useState([{}]);
  useEffect(() => {
    const time = setInterval(async () => {
      const resp = await GetAdvRealtimeChart(scriptId);
      const data = resp.data;
      const chartData = [];
      for (let i = 0; i < data.chart.x.length; i++) {
        chartData.push({
          name: '实时用户数量',
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
  if (resp.code != 0) {
    throw new Response(resp.msg, {
      status: 403,
      statusText: 'Forbidden',
    });
  }
  return json({ data: resp.data } as LoaderData);
};

export default function Advanced() {
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
    if (resp.code == 0) {
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
          高级统计需要在脚本中引用
          <a
            href="https://scriptcat.org/script-show-page/881"
            target="_blank"
            rel="noreferrer"
          >
            高级统计库
          </a>
          才能获取数据, 此功能还在测试中, 可能还会有改动
        </span>
      </div>
      <div className="text-center">
        <Tooltip title={data.data.limit.usage} placement="bottom">
          <Progress
            percent={Math.floor(data.data.limit.usage / data.data.limit.quota)}
          />
        </Tooltip>
        <span>受限于服务器资源,暂时限额{data.data.limit.quota}条数据</span>
      </div>
      <Divider />
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
              <span>脚本执行数(pv)</span>
              <span className="text-lg font-bold">{data.data.pv.today}</span>
              <span>{data.data.pv.yesterday}</span>
              <span>{data.data.pv.week}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>脚本用户数(uv)</span>
              <span className="text-lg font-bold">{data.data.uv.today}</span>
              <span>{data.data.uv.yesterday}</span>
              <span>{data.data.uv.week}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>ip数</span>
              <span className="text-lg font-bold">{data.data.ip.today}</span>
              <span>{data.data.ip.yesterday}</span>
              <span>{data.data.ip.week}</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>平均使用时间</span>
              <span className="text-lg font-bold">
                {secondToMinute(data.data.use_time.today)}
              </span>
              <span>{secondToMinute(data.data.use_time.yesterday)}</span>
              <span>{secondToMinute(data.data.use_time.week)}</span>
            </div>
          </div>
        </Card.Grid>
      </Card>
      <Divider orientation="left">统计key</Divider>
      <Input value={data.data.statistics_key} readOnly style={{ width: 200 }} />
      <Divider orientation="left">收集白名单</Divider>
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
                  const tmpWhitelist = whitelist.filter((v) => v != item);
                  const resp = await UpdateWhitelist(
                    script.script!.id,
                    tmpWhitelist
                  );
                  if (resp.code == 0) {
                    setWhitelist(resp.data.whitelist);
                    setWhitelistAdd('');
                  } else {
                    message.error(resp.msg);
                  }
                }}
              >
                删除
              </Button>
            </List.Item>
          );
        }}
        dataSource={whitelist}
        footer={
          <div>
            <span>添加白名单: </span>
            <Input
              style={{ width: 200 }}
              value={whitelistAdd}
              onChange={(e) => {
                setWhitelistAdd(e.target.value);
              }}
              onPressEnter={submitWhitlist}
            />
            <Button type="primary" onClick={submitWhitlist}>
              添加
            </Button>
          </div>
        }
      />
      <Divider />
      <div className="flex flex-row w-full gap-4">
        <Card
          title="用户安装来源"
          className="flex-1"
          size="small"
          bordered={false}
        >
          <PieChartList
            scriptId={script.script!.id}
            fetchDataFunc={GetOriginList}
            columns={{ title1: '来源', title2: '用户数' }}
          />
        </Card>
        <Card title="访问域" className="flex-1" size="small" bordered={false}>
          <PieChartList
            scriptId={script.script!.id}
            fetchDataFunc={GetVisitDomain}
            columns={{ title1: '访问域', title2: '用户数' }}
          />
        </Card>
        <Card title="新老用户" className="flex-1" size="small" bordered={false}>
          <Pie
            colorField="key"
            angleField="value"
            data={data.data.new_old_user}
          />
        </Card>
      </div>
      <Divider />
      <div className="flex flex-row w-full gap-4">
        <Card title="版本分布" className="flex-1" size="small" bordered={false}>
          <Pie colorField="key" angleField="value" data={data.data.version} />
        </Card>
        <Card title="终端设备" className="flex-1" size="small" bordered={false}>
          <Pie colorField="key" angleField="value" data={data.data.system} />
        </Card>
        <Card title="浏览器" className="flex-1" size="small" bordered={false}>
          <Pie colorField="key" angleField="value" data={data.data.browser} />
        </Card>
      </div>
      <Divider />
      <Card title="实时用户" size="small" bordered={false}>
        <div className="flex flex-row gap-4">
          <RealtimeColumn scriptId={script.script!.id} />
          <VisitTable scriptId={script.script!.id} />
        </div>
      </Card>
    </>
  );
}
