'use client';

import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Switch,
  Select,
  Button,
  Badge,
  Space,
  Tooltip,
  Alert,
  Tabs,
  Tag,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  FireOutlined,
  RiseOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import React, { useState } from 'react';
import { useScript } from '../../components/ScriptContext';
import { Line, Column } from '@ant-design/charts';
import { useTheme } from '@/contexts/ThemeClientContext';
import { useTranslations } from 'next-intl';
import { useScriptStatistics, useScriptRealtime } from '@/lib/api/hooks/script';

const { Text } = Typography;
const { Option } = Select;

// UV/PV 图表组件
const PvUv: React.FC<{
  title: string;
  uv: { x: string[]; y: number[] };
  pv: { x: string[]; y: number[] };
  chartType?: 'line' | 'column';
}> = ({ title, uv, pv, chartType = 'line' }) => {
  const { themeMode } = useTheme();
  const data = [];

  for (let i = 0; i < uv.x.length; i++) {
    data.push(
      {
        name: 'UV',
        date: uv.x[i],
        num: uv.y[i],
      },
      {
        name: 'PV',
        date: pv.x[i],
        num: pv.y[i],
      },
    );
  }

  const config = {
    theme: themeMode.theme,
    data,
    xField: 'date',
    yField: 'num',
    seriesField: 'name',
    smooth: chartType === 'line',
    color: ['#1890ff', '#52c41a'],
    legend: {
      position: 'top' as const,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
  };

  const ChartComponent = chartType === 'line' ? Line : Column;

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <Text strong className="text-lg">
          {title}
        </Text>
      </div>
      <ChartComponent {...config} />
    </div>
  );
};

// 实时图表组件
const RealtimeColumn: React.FC<{
  download: { x: string[]; y: number[] };
  update: { x: string[]; y: number[] };
  isRealtime: boolean;
}> = ({ download, update, isRealtime }) => {
  const { themeMode } = useTheme();

  const data = [];
  for (let i = 0; i < download.x.length; i++) {
    data.push(
      {
        name: '安装',
        time: download.x[i],
        num: download.y[i],
      },
      {
        name: '更新',
        time: update.x[i],
        num: update.y[i],
      },
    );
  }

  const config = {
    theme: themeMode.theme,
    data,
    xField: 'time',
    yField: 'num',
    seriesField: 'name',
    color: ['#1890ff', '#52c41a'],
    legend: {
      position: 'top' as const,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    animation: !isRealtime,
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Text strong className="text-lg">
          实时更新下载
        </Text>
        <Badge
          status={isRealtime ? 'processing' : 'default'}
          text={isRealtime ? '实时更新中' : '已暂停'}
        />
      </div>
      <Line {...config} />
    </div>
  );
};

// 工具函数：格式化数字
const splitNumber = (num: string) => {
  return parseInt(num).toLocaleString();
};

// 增强的统计卡片组件
const StatsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  today: number;
  yesterday: number;
  week: number;
  color: string;
}> = ({ title, icon, today, yesterday, week, color }) => {
  const growth =
    yesterday > 0 ? (((today - yesterday) / yesterday) * 100).toFixed(1) : '0';
  const isPositive = parseFloat(growth) >= 0;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg text-${color}-500`}>{icon}</div>
            <Text strong className="text-gray-700">
              {title}
            </Text>
          </div>
          <Tooltip
            title={`较昨日${isPositive ? '增长' : '下降'}${Math.abs(parseFloat(growth))}%`}
          >
            <Tag
              color={isPositive ? 'green' : 'red'}
              icon={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            >
              {growth}%
            </Tag>
          </Tooltip>
        </div>

        <div className="space-y-3">
          <div>
            <Text type="secondary" className="text-sm">
              今日
            </Text>
            <div className="mt-1">
              <Statistic
                value={today}
                formatter={(value) => splitNumber(value.toString())}
                valueStyle={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <Text type="secondary" className="text-xs">
                昨日
              </Text>
              <div className="text-gray-600 font-semibold">
                {splitNumber(yesterday.toString())}
              </div>
            </div>
            <div>
              <Text type="secondary" className="text-xs">
                本周
              </Text>
              <div className="text-gray-600 font-semibold">
                {splitNumber(week.toString())}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ScriptStatsClient() {
  const { script } = useScript();
  const [isRealtime, setIsRealtime] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'column'>('line');
  const [activeTab, setActiveTab] = useState('overview');

  // 使用API hooks获取数据
  const {
    data: statisticsData,
    error: statisticsError,
    isLoading: statisticsLoading,
    mutate: refreshStatistics,
  } = useScriptStatistics(script.id);
  const {
    data: realtimeData,
    error: realtimeError,
    isLoading: realtimeLoading,
  } = useScriptRealtime(script.id, isRealtime);

  const loading = statisticsLoading || realtimeLoading;
  const error = statisticsError || realtimeError;

  if (error) {
    return (
      <Card>
        <Alert
          message="加载失败"
          description="获取统计数据失败，请稍后重试。"
          type="error"
          showIcon
          action={
            <Button
              size="small"
              danger
              icon={<ReloadOutlined />}
              onClick={() => {
                refreshStatistics();
              }}
            >
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  if (loading || !statisticsData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <Text type="secondary">加载统计数据中...</Text>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size={20} className="w-full">
        {/* 页面底部说明 */}
        <Alert
          message="数据说明"
          description="以下数据仅为参考，若有出入请以实际为准。UV表示独立访客数，PV表示访问量。"
          type="info"
          showIcon
          closable
        />
        {/* 核心统计指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard
            title="页面浏览量"
            icon={<EyeOutlined />}
            today={statisticsData.page_pv.today}
            yesterday={statisticsData.page_pv.yesterday}
            week={statisticsData.page_pv.week}
            color="blue"
          />
          <StatsCard
            title="访客数"
            icon={<EyeOutlined />}
            today={statisticsData.page_uv.today}
            yesterday={statisticsData.page_uv.yesterday}
            week={statisticsData.page_uv.week}
            color="green"
          />
          <StatsCard
            title="安装数"
            icon={<DownloadOutlined />}
            today={statisticsData.download_uv.today}
            yesterday={statisticsData.download_uv.yesterday}
            week={statisticsData.download_uv.week}
            color="orange"
          />
          <StatsCard
            title="更新数"
            icon={<RiseOutlined />}
            today={statisticsData.update_uv.today}
            yesterday={statisticsData.update_uv.yesterday}
            week={statisticsData.update_uv.week}
            color="purple"
          />
        </div>

        {/* 图表展示区域 */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <LineChartOutlined />
                  趋势概览
                </span>
              ),
              children: (
                <div className="space-y-6">
                  {/* 实时数据监控 */}
                  <Card
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FireOutlined className="text-red-500" />
                          <span>实时数据监控</span>
                          <Badge
                            status={isRealtime ? 'processing' : 'default'}
                            text={isRealtime ? '实时更新中' : '已暂停'}
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <Text className="text-sm text-gray-500">
                            实时更新
                          </Text>
                          <Switch
                            checked={isRealtime}
                            onChange={setIsRealtime}
                            size="small"
                            checkedChildren="开"
                            unCheckedChildren="关"
                          />
                        </div>
                      </div>
                    }
                    className="shadow-sm"
                    bordered={false}
                  >
                    <RealtimeColumn
                      download={realtimeData?.download || { x: [], y: [] }}
                      update={realtimeData?.update || { x: [], y: [] }}
                      isRealtime={isRealtime}
                    />
                  </Card>

                  {/* 30天趋势分析 */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} xl={12}>
                      <Card
                        title={
                          <div className="flex items-center justify-between">
                            <span>30天安装量趋势</span>
                            <Select
                              value={chartType}
                              onChange={setChartType}
                              size="small"
                              style={{ width: 120 }}
                            >
                              <Option value="line">
                                <LineChartOutlined className="mr-1" />
                                折线图
                              </Option>
                              <Option value="column">
                                <BarChartOutlined className="mr-1" />
                                柱状图
                              </Option>
                            </Select>
                          </div>
                        }
                        className="shadow-sm h-full"
                        bordered={false}
                      >
                        <PvUv
                          title=""
                          uv={statisticsData.uv_chart.download}
                          pv={statisticsData.pv_chart.download}
                          chartType={chartType}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} xl={12}>
                      <Card
                        title="30天更新量趋势"
                        className="shadow-sm h-full"
                        bordered={false}
                      >
                        <PvUv
                          title=""
                          uv={statisticsData.uv_chart.update}
                          pv={statisticsData.pv_chart.update}
                          chartType={chartType}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Space>
    </Card>
  );
}
