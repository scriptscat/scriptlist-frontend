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
  t: (key: string) => string;
}> = ({ download, update, isRealtime, t }) => {
  const { themeMode } = useTheme();

  const data = [];
  for (let i = 0; i < download.x.length; i++) {
    data.push(
      {
        name: t('install'),
        time: download.x[i],
        num: download.y[i],
      },
      {
        name: t('update'),
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
          {t('realtime_downloads')}
        </Text>
        <Badge
          status={isRealtime ? 'processing' : 'default'}
          text={isRealtime ? t('realtime_updating') : t('realtime_paused')}
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
  t: (key: string) => string;
}> = ({ title, icon, today, yesterday, week, color, t }) => {
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
            title={`${t('growth_tooltip').replace('{type}', isPositive ? t('growth_increase') : t('growth_decrease')).replace('{value}', Math.abs(parseFloat(growth)).toString())}`}
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
              {t('today')}
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
                {t('yesterday')}
              </Text>
              <div className="text-gray-600 font-semibold">
                {splitNumber(yesterday.toString())}
              </div>
            </div>
            <div>
              <Text type="secondary" className="text-xs">
                {t('week')}
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
  const t = useTranslations('script.statistics');
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
          message={t('loading_failed')}
          description={t('loading_failed_description')}
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
              {t('retry')}
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
          <Text type="secondary">{t('loading_data')}</Text>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size={20} className="w-full">
        {/* 页面底部说明 */}
        <Alert
          message={t('data_notice')}
          description={t('data_notice_description')}
          type="info"
          showIcon
          closable
        />
        {/* 核心统计指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard
            title={t('page_views')}
            icon={<EyeOutlined />}
            today={statisticsData.page_pv.today}
            yesterday={statisticsData.page_pv.yesterday}
            week={statisticsData.page_pv.week}
            color="blue"
            t={t}
          />
          <StatsCard
            title={t('visitors')}
            icon={<EyeOutlined />}
            today={statisticsData.page_uv.today}
            yesterday={statisticsData.page_uv.yesterday}
            week={statisticsData.page_uv.week}
            color="green"
            t={t}
          />
          <StatsCard
            title={t('installs')}
            icon={<DownloadOutlined />}
            today={statisticsData.download_uv.today}
            yesterday={statisticsData.download_uv.yesterday}
            week={statisticsData.download_uv.week}
            color="orange"
            t={t}
          />
          <StatsCard
            title={t('updates')}
            icon={<RiseOutlined />}
            today={statisticsData.update_uv.today}
            yesterday={statisticsData.update_uv.yesterday}
            week={statisticsData.update_uv.week}
            color="purple"
            t={t}
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
                  {t('trend_overview')}
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
                          <span>{t('realtime_monitoring')}</span>
                          <Badge
                            status={isRealtime ? 'processing' : 'default'}
                            text={isRealtime ? t('realtime_updating') : t('realtime_paused')}
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <Text className="text-sm text-gray-500">
                            {t('realtime_update')}
                          </Text>
                          <Switch
                            checked={isRealtime}
                            onChange={setIsRealtime}
                            size="small"
                            checkedChildren={t('on')}
                            unCheckedChildren={t('off')}
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
                      t={t}
                    />
                  </Card>

                  {/* 30天趋势分析 */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} xl={12}>
                      <Card
                        title={
                          <div className="flex items-center justify-between">
                            <span>{t('30_day_install_trend')}</span>
                            <Select
                              value={chartType}
                              onChange={setChartType}
                              size="small"
                              style={{ width: 120 }}
                            >
                              <Option value="line">
                                <LineChartOutlined className="mr-1" />
                                {t('line_chart')}
                              </Option>
                              <Option value="column">
                                <BarChartOutlined className="mr-1" />
                                {t('column_chart')}
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
                        title={t('30_day_update_trend')}
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
