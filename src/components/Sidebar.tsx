'use client';

import { Card, Button, Space, Typography } from 'antd';
import {
  PlusOutlined,
  HeartOutlined,
  UserOutlined,
  SettingOutlined,
  StarOutlined,
  FireOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { Link } from '@/i18n/routing';
import ScriptListCard from './ScriptListCard';
import type { ScriptListItem } from '@/app/[locale]/script-show-page/[id]/types';

const { Text } = Typography;

interface SidebarProps {
  recentScripts?: ScriptListItem[];
  ratingScripts?: ScriptListItem[];
}

export default function Sidebar({
  recentScripts = [],
  ratingScripts = [],
}: SidebarProps) {
  const { user } = useUser();

  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">
      <Card>
        <Card.Meta
          title={
            <div className="flex flex-row justify-between items-center">
              <span>学油猴脚本</span>
              <span className="text-xs">
                <a
                  href="https://bbs.tampermonkey.net.cn/forum-75-1.html"
                  className="text-gray-400"
                  target="_blank"
                >
                  建议/投诉/举报
                </a>
              </span>
            </div>
          }
          description={
            <span
              className="text-gray-400"
              dangerouslySetInnerHTML={{
                __html:
                  "就来 <a href='https://bbs.tampermonkey.net.cn/'>油猴中文网</a>",
              }}
            ></span>
          }
        ></Card.Meta>
      </Card>

      {/* 最新脚本 */}
      <ScriptListCard
        title="最新脚本"
        data={recentScripts}
        icon={<FireOutlined className="text-orange-500" />}
      />

      {/* 最新评分 */}
      <ScriptListCard
        title="最新评分"
        data={ratingScripts}
        icon={<StarOutlined className="text-yellow-500" />}
      />

      {/* 快速操作 */}
      {user && (
        <Card
          size="small"
          title={
            <Space>
              <ThunderboltOutlined className="text-purple-500" />
              <Text strong>快速操作</Text>
            </Space>
          }
          className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800"
          bodyStyle={{ padding: '16px' }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Link href="/scripts/create">
              <Button
                type="text"
                icon={<PlusOutlined />}
                className="w-full h-12 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:hover:from-green-800/30 dark:hover:to-green-700/30 border-0 text-green-700 dark:text-green-400 font-medium rounded-lg transition-all duration-200"
              >
                上传脚本
              </Button>
            </Link>
            <Link href={`/users/${user.user_id}/favorites`}>
              <Button
                type="text"
                icon={<HeartOutlined />}
                className="w-full h-12 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:hover:from-red-800/30 dark:hover:to-red-700/30 border-0 text-red-700 dark:text-red-400 font-medium rounded-lg transition-all duration-200"
              >
                我的收藏
              </Button>
            </Link>
            <Link href={`/users/${user.user_id}`}>
              <Button
                type="text"
                icon={<UserOutlined />}
                className="w-full h-12 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 border-0 text-blue-700 dark:text-blue-400 font-medium rounded-lg transition-all duration-200"
              >
                我的脚本
              </Button>
            </Link>
            <Link href={`/users/settings`}>
              <Button
                type="text"
                icon={<SettingOutlined />}
                className="w-full h-12 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 dark:from-gray-700/50 dark:to-gray-600/50 dark:hover:from-gray-600/60 dark:hover:to-gray-500/60 border-0 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-200"
              >
                设置
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
