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
import { browserName } from 'react-device-detect';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
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
  textKey: string;
  target?: string;
}

const getBrowserStores = (t: any): Record<string, BrowserStoreConfig> => ({
  edge: {
    url: 'https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh',
    icon: 'logos:microsoft-edge',
    textKey: 'home.browser_stores.add_to_edge',
  },
  chrome: {
    url: 'https://chrome.google.com/webstore/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf',
    icon: 'logos:chrome',
    textKey: 'home.browser_stores.add_to_chrome',
  },
  firefox: {
    url: 'https://addons.mozilla.org/zh-CN/firefox/addon/scriptcat/',
    icon: 'logos:firefox',
    textKey: 'home.browser_stores.add_to_firefox',
  },
  crx: {
    url: 'https://github.com/scriptscat/scriptcat/releases',
    icon: 'noto:package',
    textKey: 'home.browser_stores.download_crx_install',
  },
  default: {
    url: './docs/use/use',
    icon: 'logos:chrome',
    textKey: 'home.browser_stores.install_extension',
    target: '_self',
  },
});

// 浏览器商店映射
interface StoreItem {
  key: string;
  label: React.ReactNode;
  show?: boolean;
}

const getStoreMap = (t: any): Record<string, StoreItem> => {
  const browserStores = getBrowserStores(t);
  return Object.entries(browserStores).reduce(
    (acc, [key, config]) => {
      acc[key] = {
        key,
        label: (
          <IconButton
            href={config.url}
            icon={config.icon}
            text={t(config.textKey)}
            target={config.target}
          />
        ),
        show: key !== 'default',
      };
      return acc;
    },
    {} as Record<string, StoreItem>,
  );
};

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
  const t = useTranslations();
  const currentBrowser = browserName.toLowerCase();
  const storeMap = getStoreMap(t);
  const browserStore = storeMap[currentBrowser] || storeMap.default;

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

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r"></div>
      <div className="relative max-w-6xl mx-auto px-4 pt-10">
        <div className="text-center">
          {/* Logo and Title */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <Image
                height={64}
                width={64}
                src="/assets/logo.png"
                alt="ScriptCat Logo"
                className="mr-4"
              />
              <Title
                level={1}
                className="!text-4xl sm:!text-6xl !font-bold !mb-0 !bg-gradient-to-r !from-blue-600 !to-purple-600 !bg-clip-text !text-transparent"
              >
                ScriptCat
              </Title>
            </div>
            <Typography.Paragraph className="!text-xl !text-gray-600 !mb-0 max-w-2xl mx-auto">
              {t('home.hero.tagline')}
            </Typography.Paragraph>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-16">
            <Input.Search
              size="large"
              placeholder={t('home.hero.search_placeholder')}
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
                  {t('home.hero.search_button')}
                </Button>
              }
            />
          </div>

          {/* Install Button */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
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
                {t('home.hero.browse_all_scripts')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const t = useTranslations();

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
              {t('home.features.why_choose_title')}
            </Title>
            <Text type="secondary" className="!text-xl max-w-3xl mx-auto">
              {t('home.features.why_choose_subtitle')}
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
                      height={40}
                      width={40}
                      src="/assets/logo.png"
                      alt="ScriptCat"
                    />
                  </div>
                  <Title level={3} className="!text-2xl !font-bold !mb-4">
                    {t('home.features.scriptcat.title')}
                  </Title>
                  <div className="text-left space-y-4">
                    <Text type="secondary" className="block">
                      {t('home.features.scriptcat.description')}
                    </Text>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {t('home.features.scriptcat.features.compatible')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {t('home.features.scriptcat.features.background')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {t('home.features.scriptcat.features.rich_api')}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        type="link"
                        href={INSTALL_URL}
                        target="_blank"
                        className="!p-0 !h-auto !text-blue-600 hover:!text-blue-700"
                      >
                        {t('home.features.scriptcat.install_link')}
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
                    {t('home.features.faq.title')}
                  </Title>
                  <div className="text-left space-y-4">
                    <div>
                      <Text className="font-medium">
                        {t('home.features.faq.what_is_userscript.question')}
                      </Text>
                      <Text type="secondary" className="block text-sm mt-1">
                        {t('home.features.faq.what_is_userscript.answer')}
                      </Text>
                    </div>
                    <div>
                      <Text className="font-medium">
                        {t('home.features.faq.why_scriptcat.question')}
                      </Text>
                      <Text type="secondary" className="block text-sm mt-1">
                        {t('home.features.faq.why_scriptcat.answer')}
                      </Text>
                    </div>
                    <div>
                      <Text className="font-medium">
                        {t('home.features.faq.how_to_start.question')}
                      </Text>
                      <Text type="secondary" className="block text-sm mt-1">
                        {t('home.features.faq.how_to_start.answer')}
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
                    {t('home.features.developer.title')}
                  </Title>
                  <div className="text-left space-y-4">
                    <Text type="secondary" className="block">
                      {t('home.features.developer.description')}
                    </Text>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        {t('home.features.developer.benefits.exposure')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        {t('home.features.developer.benefits.forum_permission')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        {t('home.features.developer.benefits.tech_group')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        {t('home.features.developer.benefits.badge')}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        type="link"
                        href={DEVELOPER_GUIDE_URL}
                        target="_blank"
                        className="!p-0 !h-auto !text-purple-600 hover:!text-purple-700"
                      >
                        {t('home.features.developer.guide_link')}
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
