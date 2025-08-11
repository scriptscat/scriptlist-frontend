'use client';

import { Button, Empty, Typography } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import type { ScriptListItem } from '@/app/[locale]/script-show-page/[id]/types';
import ScriptList from '../Scriptlist';

const { Text } = Typography;

interface UserScriptsProps {
  userId: number;
}

// 模拟脚本数据
const getMockScripts = (userId: number): ScriptListItem[] => {
  const baseScripts: ScriptListItem[] = [
    {
      id: 1,
      user_id: userId,
      username: '开发者用户',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      is_admin: 0,
      post_id: 1,
      name: '网页广告拦截器',
      description:
        '智能识别并拦截各种网页广告，提供纯净的浏览体验。支持主流网站的广告过滤，自动更新过滤规则。',
      category: {
        id: 1,
        name: '工具',
        num: 100,
        sort: 1,
        createtime: 1672531200000,
        updatetime: 1704067200000,
      },
      tags: [
        {
          id: 1,
          name: '广告拦截',
          num: 50,
          sort: 1,
          createtime: 1672531200000,
          updatetime: 1704067200000,
        },
        {
          id: 2,
          name: '效率',
          num: 80,
          sort: 2,
          createtime: 1672531200000,
          updatetime: 1704067200000,
        },
      ],
      status: 1,
      score: 4.8,
      score_num: 156,
      type: 1,
      public: 1,
      unwell: 0,
      archive: 0,
      danger: 0,
      enable_pre_release: 0,
      today_install: 245,
      total_install: 15432,
      createtime: 1672531200000,
      updatetime: 1704067200000,
      script: {
        id: 1,
        user_id: userId,
        username: '开发者用户',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        is_admin: 0,
        meta_json: {
          name: ['网页广告拦截器'],
          description: ['智能识别并拦截各种网页广告，提供纯净的浏览体验'],
          version: ['2.1.0'],
          author: ['开发者用户'],
        },
        script_id: 1,
        version: '2.1.0',
        changelog: '',
        is_pre_release: 0,
        status: 1,
        createtime: 1672531200000,
        code: '',
      },
    },
    {
      id: 2,
      user_id: userId,
      username: '开发者用户',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      is_admin: 0,
      post_id: 2,
      name: '视频下载助手',
      description:
        '支持多个视频网站的视频下载，包括B站、优酷、腾讯视频等主流平台。一键下载高清视频，支持批量下载。',
      category: {
        id: 2,
        name: '媒体',
        num: 75,
        sort: 2,
        createtime: 1675123200000,
        updatetime: 1703980800000,
      },
      tags: [
        {
          id: 3,
          name: '下载',
          num: 60,
          sort: 3,
          createtime: 1675123200000,
          updatetime: 1703980800000,
        },
        {
          id: 4,
          name: '视频',
          num: 45,
          sort: 4,
          createtime: 1675123200000,
          updatetime: 1703980800000,
        },
      ],
      status: 1,
      score: 4.6,
      score_num: 89,
      type: 1,
      public: 1,
      unwell: 0,
      archive: 0,
      danger: 0,
      enable_pre_release: 0,
      today_install: 89,
      total_install: 8976,
      createtime: 1675123200000,
      updatetime: 1703980800000,
      script: {
        id: 2,
        user_id: userId,
        username: '开发者用户',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        is_admin: 0,
        meta_json: {
          name: ['视频下载助手'],
          description: ['支持多个视频网站的视频下载'],
          version: ['1.5.3'],
          author: ['开发者用户'],
        },
        script_id: 2,
        version: '1.5.3',
        changelog: '',
        is_pre_release: 0,
        status: 1,
        createtime: 1675123200000,
        code: '',
      },
    },
    {
      id: 3,
      user_id: userId,
      username: '开发者用户',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      is_admin: 0,
      post_id: 3,
      name: '自动填表工具',
      description:
        '自动填充网页表单，支持自定义规则和数据模板。提高工作效率，减少重复输入。',
      category: {
        id: 3,
        name: '效率',
        num: 120,
        sort: 3,
        createtime: 1677542400000,
        updatetime: 1703894400000,
      },
      tags: [
        {
          id: 5,
          name: '自动化',
          num: 70,
          sort: 5,
          createtime: 1677542400000,
          updatetime: 1703894400000,
        },
        {
          id: 6,
          name: 'AI',
          num: 55,
          sort: 6,
          createtime: 1677542400000,
          updatetime: 1703894400000,
        },
      ],
      status: 1,
      score: 4.2,
      score_num: 45,
      type: 1,
      public: 1,
      unwell: 0,
      archive: 0,
      danger: 0,
      enable_pre_release: 0,
      today_install: 67,
      total_install: 5234,
      createtime: 1677542400000,
      updatetime: 1703894400000,
      script: {
        id: 3,
        user_id: userId,
        username: '开发者用户',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        is_admin: 0,
        meta_json: {
          name: ['自动填表工具'],
          description: ['自动填充网页表单，支持自定义规则和数据模板'],
          version: ['3.0.1'],
          author: ['开发者用户'],
        },
        script_id: 3,
        version: '3.0.1',
        changelog: '',
        is_pre_release: 0,
        status: 1,
        createtime: 1677542400000,
        code: '',
      },
    },
  ];

  if (userId === 2) {
    return [
      {
        id: 4,
        user_id: userId,
        username: '代码爱好者',
        avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
        is_admin: 0,
        post_id: 4,
        name: '代码高亮增强',
        description:
          '为各种代码网站提供更好的语法高亮显示，支持多种编程语言，自定义主题配色。',
        category: {
          id: 4,
          name: '开发',
          num: 90,
          sort: 4,
          createtime: 1680307200000,
          updatetime: 1703808000000,
        },
        tags: [
          {
            id: 7,
            name: '代码',
            num: 85,
            sort: 7,
            createtime: 1680307200000,
            updatetime: 1703808000000,
          },
          {
            id: 8,
            name: '高亮',
            num: 40,
            sort: 8,
            createtime: 1680307200000,
            updatetime: 1703808000000,
          },
        ],
        status: 1,
        score: 4.5,
        score_num: 28,
        type: 1,
        public: 1,
        unwell: 0,
        archive: 0,
        danger: 0,
        enable_pre_release: 0,
        today_install: 34,
        total_install: 3456,
        createtime: 1680307200000,
        updatetime: 1703808000000,
        script: {
          id: 4,
          user_id: userId,
          username: '代码爱好者',
          avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
          is_admin: 0,
          meta_json: {
            name: ['代码高亮增强'],
            description: ['为各种代码网站提供更好的语法高亮显示'],
            version: ['1.2.0'],
            author: ['代码爱好者'],
          },
          script_id: 4,
          version: '1.2.0',
          changelog: '',
          is_pre_release: 0,
          status: 1,
          createtime: 1680307200000,
          code: '',
        },
      },
      {
        id: 5,
        user_id: userId,
        username: '代码爱好者',
        avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
        is_admin: 0,
        post_id: 5,
        name: '购物比价助手',
        description:
          '在购物网站上显示商品的历史价格和其他平台价格对比，帮助用户找到最优惠的价格。',
        category: {
          id: 5,
          name: '购物',
          num: 65,
          sort: 5,
          createtime: 1682899200000,
          updatetime: 1703721600000,
        },
        tags: [
          {
            id: 9,
            name: '比价',
            num: 35,
            sort: 9,
            createtime: 1682899200000,
            updatetime: 1703721600000,
          },
          {
            id: 10,
            name: '购物',
            num: 65,
            sort: 10,
            createtime: 1682899200000,
            updatetime: 1703721600000,
          },
        ],
        status: 1,
        score: 4.7,
        score_num: 67,
        type: 1,
        public: 1,
        unwell: 0,
        archive: 0,
        danger: 0,
        enable_pre_release: 0,
        today_install: 123,
        total_install: 7891,
        createtime: 1682899200000,
        updatetime: 1703721600000,
        script: {
          id: 5,
          user_id: userId,
          username: '代码爱好者',
          avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
          is_admin: 0,
          meta_json: {
            name: ['购物比价助手'],
            description: ['在购物网站上显示商品的历史价格和其他平台价格对比'],
            version: ['2.3.1'],
            author: ['代码爱好者'],
          },
          script_id: 5,
          version: '2.3.1',
          changelog: '',
          is_pre_release: 0,
          status: 1,
          createtime: 1682899200000,
          code: '',
        },
      },
    ];
  }

  return baseScripts;
};

export default function UserScripts({ userId }: UserScriptsProps) {
  const scripts = getMockScripts(userId);

  if (scripts.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text type="secondary">该用户还没有发布任何脚本</Text>
            <div className="mt-2">
              <Button type="primary" icon={<CodeOutlined />}>
                发布第一个脚本
              </Button>
            </div>
          </div>
        }
      />
    );
  }

  return <ScriptList scripts={scripts} totalCount={scripts.length} />;
}
