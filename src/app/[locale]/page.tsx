'use client';

import React from 'react';
import {
  Input,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Tag,
  Avatar,
  Badge,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  CodeOutlined,
  DownloadOutlined,
  StarOutlined,
  TrophyOutlined,
  RocketOutlined,
  FireOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

// 示例数据
const featuredScripts = [
  {
    id: 1,
    name: '百度网盘直链下载助手',
    description: '支持百度网盘文件直链下载，提升下载速度',
    author: 'scriptcat',
    avatar: '/assets/logo.png',
    downloads: 125680,
    rating: 4.8,
    tags: ['下载', '网盘', '实用工具'],
    isHot: true,
  },
  {
    id: 2,
    name: '知乎增强',
    description: '为知乎添加更多实用功能，优化浏览体验',
    author: 'zhuser',
    avatar: '/assets/logo.png',
    downloads: 89234,
    rating: 4.6,
    tags: ['知乎', '增强', '阅读'],
    isNew: true,
  },
  {
    id: 3,
    name: '购物比价助手',
    description: '自动比较各大电商平台商品价格，找到最优惠的购买渠道',
    author: 'shophelper',
    avatar: '/assets/logo.png',
    downloads: 76543,
    rating: 4.9,
    tags: ['购物', '比价', '省钱'],
    isTrending: true,
  },
];

const popularTags = [
  '去广告',
  '下载工具',
  '视频增强',
  '购物助手',
  '学习工具',
  '社交媒体',
  '开发工具',
  '游戏辅助',
];

const stats = [
  { title: '脚本总数', value: 12847, icon: <CodeOutlined /> },
  { title: '总下载量', value: 5683920, icon: <DownloadOutlined /> },
  { title: '活跃用户', value: 89234, icon: <EyeOutlined /> },
  { title: '开发者', value: 2341, icon: <TrophyOutlined /> },
];

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/assets/logo.png"
              alt="ScriptCat Logo"
              width={80}
              height={80}
              className="mr-4"
            />
            <Title level={1} className="!mb-0 !text-6xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ScriptCat
              </span>
            </Title>
          </div>
          <Paragraph className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            发现和分享优质用户脚本，让你的浏览器拥有无限可能
          </Paragraph>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-8">
          <Search
            placeholder="搜索脚本、作者或功能..."
            allowClear
            enterButton={
              <Button type="primary" size="large">
                <SearchOutlined />
                搜索
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            className="shadow-lg"
          />
        </div>

        {/* Popular Tags */}
        <div className="text-center">
          <Text className="text-gray-500 mr-3">热门标签：</Text>
          <Space wrap>
            {popularTags.map((tag) => (
              <Tag
                key={tag}
                className="cursor-pointer hover:scale-105 transition-transform"
                color="blue"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <Row gutter={[24, 24]} justify="center">
            {stats.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.icon}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Featured Scripts */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title level={2} className="flex items-center justify-center">
              <FireOutlined className="mr-2 text-orange-500" />
              精选脚本
            </Title>
            <Paragraph className="text-lg text-gray-600 dark:text-gray-300">
              发现最受欢迎和最新推出的优质脚本
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {featuredScripts.map((script) => (
              <Col xs={24} md={8} key={script.id}>
                <Card
                  hoverable
                  className="h-full transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(`/scripts/${script.id}`)}
                >
                  <div className="flex flex-col h-full">
                    {/* Header with badges */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <Title level={4} className="!mb-2 line-clamp-1">
                          {script.name}
                        </Title>
                      </div>
                      <div className="flex flex-col gap-1">
                        {script.isHot && <Badge status="error" text="热门" />}
                        {script.isNew && <Badge status="success" text="最新" />}
                        {script.isTrending && (
                          <Badge status="processing" text="趋势" />
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <Paragraph className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-2">
                      {script.description}
                    </Paragraph>

                    {/* Author */}
                    <div className="flex items-center mb-3">
                      <Avatar size="small" src={script.avatar} />
                      <Text className="ml-2 text-sm">{script.author}</Text>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-3">
                      <Space size="large">
                        <span className="flex items-center text-sm text-gray-500">
                          <DownloadOutlined className="mr-1" />
                          {script.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center text-sm text-gray-500">
                          <StarOutlined className="mr-1" />
                          {script.rating}
                        </span>
                      </Space>
                    </div>

                    {/* Tags */}
                    <div>
                      <Space wrap>
                        {script.tags.map((tag) => (
                          <Tag
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag);
                            }}
                            className="cursor-pointer"
                          >
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* View More Button */}
          <div className="text-center mt-12">
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => router.push('/search')}
            >
              探索更多脚本
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Title level={2} className="mb-8">
            开始使用 ScriptCat
          </Title>
          
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} md={8}>
              <Card className="h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">1️⃣</div>
                  <Title level={4}>安装扩展</Title>
                  <Paragraph>在浏览器中安装 ScriptCat 扩展程序</Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">2️⃣</div>
                  <Title level={4}>寻找脚本</Title>
                  <Paragraph>在脚本站中搜索你需要的功能脚本</Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">3️⃣</div>
                  <Title level={4}>享受体验</Title>
                  <Paragraph>一键安装脚本，享受增强的浏览体验</Paragraph>
                </div>
              </Card>
            </Col>
          </Row>

          <Space size="large">
            <Button
              type="primary"
              size="large"
              href="https://docs.scriptcat.org/"
              target="_blank"
            >
              下载扩展
            </Button>
            <Button size="large" onClick={() => router.push('/search')}>
              浏览脚本
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
