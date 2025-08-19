'use client';

import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import {
  Input,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Dropdown,
} from 'antd';
import {
  SearchOutlined,
  QuestionCircleFilled,
  CodeFilled,
  DownOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { browserName } from 'react-device-detect';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

const { Title, Text } = Typography;

// 常量定义
const INSTALL_URL = 'https://docs.scriptcat.org/docs/use/use/';
const DEVELOPER_GUIDE_URL =
  'https://bbs.tampermonkey.net.cn/thread-1234-1-1.html';

// 浏览器图标按钮组件属性接口
interface IconButtonProps {
  href: string;
  text: string;
  icon: string;
  target?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  href,
  text,
  icon,
  target = '_blank',
}) => {
  return (
    <a
      target={target}
      href={href}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      <Space align="center">
        <div className="flex items-center justify-center w-[22px] h-[22px] p-0.5 bg-white border border-white rounded">
          <Icon height={16} width={16} icon={icon} />
        </div>
        <span className="font-bold">{text}</span>
      </Space>
    </a>
  );
};

// 浏览器商店配置
interface BrowserStoreConfig {
  url: string;
  icon: string;
  text: string;
  target?: string;
}

const browserStores: Record<string, BrowserStoreConfig> = {
  edge: {
    url: 'https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh',
    icon: 'logos:microsoft-edge',
    text: '添加到 Edge 浏览器',
  },
  chrome: {
    url: 'https://chrome.google.com/webstore/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf',
    icon: 'logos:chrome',
    text: '添加到 Chrome 浏览器',
  },
  firefox: {
    url: 'https://addons.mozilla.org/zh-CN/firefox/addon/scriptcat/',
    icon: 'logos:firefox',
    text: '添加到 Firefox 浏览器',
  },
  crx: {
    url: 'https://github.com/scriptscat/scriptcat/releases',
    icon: 'noto:package',
    text: '下载 安装包 文件手动安装',
  },
  default: {
    url: './docs/use/use',
    icon: 'logos:chrome',
    text: '安装扩展到浏览器',
    target: '_self',
  },
};

// 浏览器商店映射
interface StoreItem {
  key: string;
  label: React.ReactNode;
  show?: boolean;
}

const storeMap: Record<string, StoreItem> = Object.entries(
  browserStores,
).reduce(
  (acc, [key, config]) => {
    acc[key] = {
      key,
      label: (
        <IconButton
          href={config.url}
          icon={config.icon}
          text={config.text}
          target={config.target}
        />
      ),
      show: key !== 'default',
    };
    return acc;
  },
  {} as Record<string, StoreItem>,
);

// 构建商店列表
const storeList: MenuProps['items'] = [];
Object.keys(storeMap).forEach((key) => {
  if (storeMap[key].show !== false) {
    storeList.push({
      key: storeMap[key].key,
      label: storeMap[key].label,
    });
  }
});

// Hero 部分组件
interface HeroSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchValue,
  onSearchChange,
  onSearch,
}) => {
  const currentBrowser = browserName.toLowerCase();
  const browserStore = storeMap[currentBrowser] || storeMap.default;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r"></div>
      <div className="relative max-w-6xl mx-auto px-4 pt-10">
        <div className="text-center">
          {/* Logo and Title */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/assets/logo.png"
                alt="ScriptCat Logo"
                className="w-16 h-16 mr-4"
              />
              <Title
                level={1}
                className="!text-6xl !font-bold !mb-0 !bg-gradient-to-r !from-blue-600 !to-purple-600 !bg-clip-text !text-transparent"
              >
                ScriptCat
              </Title>
            </div>
            <Typography.Paragraph className="!text-xl !text-gray-600 !mb-0 max-w-2xl mx-auto">
              发现和分享优质用户脚本，让浏览体验更精彩
            </Typography.Paragraph>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-16">
            <Input.Search
              size="large"
              placeholder="搜索脚本，开启新世界"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onSearch={onSearch}
              enterButton={
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  className="!bg-gradient-to-r !from-blue-500 !to-purple-500 !border-0 hover:!from-blue-600 hover:!to-purple-600"
                >
                  搜索脚本
                </Button>
              }
            />
          </div>

          {/* Install Button */}
          <div className="flex justify-center space-x-4">
            <Space direction="horizontal" size="large">
              <Dropdown.Button
                size="large"
                type="primary"
                icon={<DownOutlined rev={undefined} />}
                menu={{ items: storeList }}
                arrow={true}
                style={{ width: 'auto' }}
              >
                {browserStore.label}
              </Dropdown.Button>
              <Link href={'/search'}>
                <Button type="default" icon={<SearchOutlined />} size="large">
                  浏览所有脚本
                </Button>
              </Link>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  const handleSearch = (value: string) => {
    // 如果搜索内容为空，跳转到搜索页面浏览所有脚本
    if (value.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(value.trim())}`);
    } else {
      // 搜索内容为空时，跳转到搜索页面显示所有脚本
      router.push('/search');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Hero Section */}
      <HeroSection
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      {/* Features Section */}
      <div className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="!text-4xl !font-bold !mb-4">
              为什么选择 ScriptCat？
            </Title>
            <Text type="secondary" className="!text-xl max-w-3xl mx-auto">
              基于油猴的设计理念，完全兼容油猴脚本，提供更多丰富的API，让脚本能够完成更多强大的功能。
            </Text>
          </div>

          <Row gutter={[32, 32]}>
            {/* ScriptCat 介绍 */}
            <Col xs={24} lg={8}>
              <Card
                className="!h-full !border-0 !shadow-lg !rounded-2xl hover:!shadow-xl transition-all duration-300 hover:!-translate-y-1"
                bodyStyle={{ padding: '32px' }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Image
                      src="/assets/logo.png"
                      alt="ScriptCat"
                      className="w-10 h-10"
                    />
                  </div>
                  <Title level={3} className="!text-2xl !font-bold !mb-4">
                    强大的脚本管理器
                  </Title>
                  <div className="text-left space-y-4">
                    <Text type="secondary" className="block">
                      ScriptCat（脚本猫）完全兼容油猴脚本，同时提供后台脚本运行框架和丰富的API扩展。
                    </Text>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        完全兼容油猴脚本
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        支持后台脚本运行
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        提供丰富API扩展
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        type="link"
                        href={INSTALL_URL}
                        target="_blank"
                        className="!p-0 !h-auto !text-blue-600 hover:!text-blue-700"
                      >
                        立即安装 ScriptCat →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* 常见问题 */}
            <Col xs={24} lg={8}>
              <Card
                className="!h-full !border-0 !shadow-lg !rounded-2xl hover:!shadow-xl transition-all duration-300 hover:!-translate-y-1"
                bodyStyle={{ padding: '32px' }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <QuestionCircleFilled className="text-3xl text-white" />
                  </div>
                  <Title level={3} className="!text-2xl !font-bold !mb-4">
                    常见问题
                  </Title>
                  <div className="text-left space-y-4">
                    <div>
                      <Text className="font-medium">什么是用户脚本？</Text>
                      <Text type="secondary" className="block text-sm mt-1">
                        用户脚本可以增强网页功能、去除广告、提升易用性，让你的浏览体验更出色。
                      </Text>
                    </div>
                    <div>
                      <Text className="font-medium">为什么选择脚本猫？</Text>
                      <Text type="secondary" className="block text-sm mt-1">
                        脚本猫不仅兼容油猴脚本，还支持后台脚本运行，功能更强大，覆盖范围更广。
                      </Text>
                    </div>
                    <div>
                      <Text className="font-medium">如何开始使用？</Text>
                      <Text type="secondary" className="block text-sm mt-1">
                        首先安装脚本管理器，然后在本站寻找适合的脚本一键安装即可。
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* 成为开发者 */}
            <Col xs={24} lg={8}>
              <Card
                className="!h-full !border-0 !shadow-lg !rounded-2xl hover:!shadow-xl transition-all duration-300 hover:!-translate-y-1"
                bodyStyle={{ padding: '32px' }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CodeFilled className="text-3xl text-white" />
                  </div>
                  <Title level={3} className="!text-2xl !font-bold !mb-4">
                    加入开发者
                  </Title>
                  <div className="text-left space-y-4">
                    <Text type="secondary" className="block">
                      成为脚本开发者，享受专属权益和技术支持。
                    </Text>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        脚本推荐曝光机会
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        论坛开发者权限
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        技术交流群邀请
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        专属开发者标识
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        type="link"
                        href={DEVELOPER_GUIDE_URL}
                        target="_blank"
                        className="!p-0 !h-auto !text-purple-600 hover:!text-purple-700"
                      >
                        查看开发教程 →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}
