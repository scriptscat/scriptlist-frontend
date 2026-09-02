// 深层导入：服务端组件若从 'antd' barrel 具名导入，整个 barrel 会变成客户端引用。
import Breadcrumb from 'antd/es/breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { getTranslations } from 'next-intl/server';

interface ScriptBreadcrumbProps {
  scriptName: string;
  locale: string;
}

export default async function ScriptBreadcrumb({
  scriptName,
  locale,
}: ScriptBreadcrumbProps) {
  const t = await getTranslations('script');

  return (
    <Breadcrumb
      className="!mb-3"
      items={[
        { href: '/', title: <HomeOutlined /> },
        { href: '/' + locale + '/search', title: t('navigation.market') },
        { title: scriptName },
      ]}
    />
  );
}
