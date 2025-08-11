'use client';

import { Card, Typography, List, Button, Space } from 'antd';
import {
  RiseOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  HeartOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface TrendingItem {
  name: string;
  count: number;
}

interface RankingItem {
  rank: number;
  title: string;
  downloads: string;
}

interface RecentItem {
  title: string;
  time: string;
  color: string;
}

const trendingData: TrendingItem[] = [
  { name: '百度网盘', count: 1234 },
  { name: '去广告', count: 987 },
  { name: 'GitHub', count: 856 },
  { name: '豆瓣', count: 743 },
  { name: '微博', count: 651 },
];

const rankingData: RankingItem[] = [
  { rank: 1, title: '视频网站去广告', downloads: '234.5k' },
  { rank: 2, title: 'GitHub 增强套件', downloads: '156.8k' },
  { rank: 3, title: '豆瓣资源下载大师', downloads: '125.4k' },
  { rank: 4, title: '百度网盘直链解析', downloads: '98.7k' },
  { rank: 5, title: '微博增强工具', downloads: '87.2k' },
];

const recentData: RecentItem[] = [
  { title: '知乎回答增强器', time: '2 小时前', color: 'blue' },
  { title: 'Twitter 图片下载', time: '5 小时前', color: 'green' },
  { title: '网易云音乐解锁', time: '1 天前', color: 'purple' },
  { title: 'Steam 增强工具', time: '2 天前', color: 'orange' },
];

const getRankColor = (rank: number) => {
  if (rank === 1) return 'bg-yellow-500';
  if (rank === 2) return 'bg-gray-400';
  if (rank === 3) return 'bg-orange-500';
  return 'bg-gray-300 dark:bg-gray-600';
};

export default function Sidebar() {
  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">
      {/* 热门搜索 */}
      <Card
        title={
          <div className="flex items-center">
            <RiseOutlined className="mr-2 text-blue-500" />
            热门搜索
          </div>
        }
      >
        <List
          size="small"
          dataSource={trendingData}
          renderItem={(item) => (
            <List.Item className="flex items-center justify-between !px-0">
              <Text className="text-gray-700 dark:text-gray-300">
                {item.name}
              </Text>
              <Text type="secondary">{item.count}</Text>
            </List.Item>
          )}
        />
      </Card>

      {/* 下载排行 */}
      <Card
        title={
          <div className="flex items-center">
            <DownloadOutlined className="mr-2 text-green-500" />
            下载排行
          </div>
        }
      >
        <List
          size="small"
          dataSource={rankingData}
          renderItem={(item) => (
            <List.Item className="flex items-center space-x-3 !px-0">
              <div
                className={`w-6 h-6 ${getRankColor(
                  item.rank,
                )} rounded-full flex items-center justify-center text-white text-xs font-bold`}
              >
                {item.rank}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.downloads} 下载
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* 最新脚本 */}
      <Card
        title={
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-2 text-blue-500" />
            最新脚本
          </div>
        }
      >
        <List
          size="small"
          dataSource={recentData}
          renderItem={(item) => (
            <List.Item
              className={`border-l-2 border-${item.color}-500 pl-3 !px-0`}
            >
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.time}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* 快速操作 */}
      <Card title="快速操作">
        <Space direction="vertical" className="w-full">
          <Button
            type="text"
            icon={<PlusOutlined />}
            className="w-full text-left justify-start"
          >
            上传脚本
          </Button>
          <Button
            type="text"
            icon={<HeartOutlined />}
            className="w-full text-left justify-start"
          >
            我的收藏
          </Button>
          <Button
            type="text"
            icon={<UserOutlined />}
            className="w-full text-left justify-start"
          >
            我的脚本
          </Button>
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="w-full text-left justify-start"
          >
            设置
          </Button>
        </Space>
      </Card>
    </div>
  );
}
