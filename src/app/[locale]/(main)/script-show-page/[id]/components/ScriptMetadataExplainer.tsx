'use client';

import { Empty, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import type { Metadata } from '../types';

const { Text, Paragraph } = Typography;

interface MetadataItem {
  value: string;
  description: string;
}

interface MetadataSection {
  key: string;
  title: string;
  directive: string;
  description: string;
  items: MetadataItem[];
}

const sectionColor: Record<string, string> = {
  grant: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  match: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  include:
    'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  exclude: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  connect:
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  run_at: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};
const defaultColor =
  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

interface ScriptMetadataExplainerProps {
  meta: Metadata;
}

function getValues(meta: Metadata, key: keyof Metadata | string) {
  const value = meta[key];
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export default function ScriptMetadataExplainer({
  meta,
}: ScriptMetadataExplainerProps) {
  const t = useTranslations('script.detail.metadata');

  const describeGrant = (grant: string) => {
    switch (grant) {
      case 'none':
        return t('grants.none');
      case 'unsafeWindow':
        return t('grants.unsafeWindow');
      case 'GM_xmlhttpRequest':
      case 'GM.xmlHttpRequest':
        return t('grants.xmlhttpRequest');
      case 'GM_setValue':
      case 'GM.setValue':
        return t('grants.setValue');
      case 'GM_getValue':
      case 'GM.getValue':
        return t('grants.getValue');
      case 'GM_deleteValue':
      case 'GM.deleteValue':
        return t('grants.deleteValue');
      case 'GM_listValues':
      case 'GM.listValues':
        return t('grants.listValues');
      case 'GM_addStyle':
      case 'GM.addStyle':
        return t('grants.addStyle');
      case 'GM_addElement':
      case 'GM.addElement':
        return t('grants.addElement');
      case 'GM_registerMenuCommand':
      case 'GM.registerMenuCommand':
        return t('grants.registerMenuCommand');
      case 'GM_unregisterMenuCommand':
      case 'GM.unregisterMenuCommand':
        return t('grants.unregisterMenuCommand');
      case 'GM_setClipboard':
      case 'GM.setClipboard':
        return t('grants.setClipboard');
      case 'GM_notification':
      case 'GM.notification':
        return t('grants.notification');
      case 'GM_download':
      case 'GM.download':
        return t('grants.download');
      case 'GM_openInTab':
      case 'GM.openInTab':
        return t('grants.openInTab');
      case 'GM_getResourceText':
      case 'GM.getResourceText':
        return t('grants.getResourceText');
      case 'GM_getResourceURL':
      case 'GM.getResourceUrl':
      case 'GM.getResourceURL':
        return t('grants.getResourceUrl');
      case 'GM_info':
      case 'GM.info':
        return t('grants.info');
      default:
        return t('grants.unknown');
    }
  };

  const describeRunAt = (value: string) => {
    switch (value) {
      case 'document-start':
        return t('run_at.document_start');
      case 'document-body':
        return t('run_at.document_body');
      case 'document-end':
        return t('run_at.document_end');
      case 'document-idle':
        return t('run_at.document_idle');
      case 'context-menu':
        return t('run_at.context_menu');
      default:
        return t('run_at.unknown');
    }
  };

  const makeSection = (
    key: string,
    directive: string,
    values: string[],
    description: string,
    describeValue: (value: string) => string,
  ): MetadataSection | null => {
    if (values.length === 0) return null;
    return {
      key,
      directive,
      title: t(`fields.${key}`),
      description,
      items: values.map((value) => ({
        value,
        description: describeValue(value),
      })),
    };
  };

  const sections = [
    makeSection(
      'grant',
      '@grant',
      getValues(meta, 'grant'),
      t('sections.grant'),
      describeGrant,
    ),
    makeSection(
      'connect',
      '@connect',
      getValues(meta, 'connect'),
      t('sections.connect'),
      () => t('values.connect'),
    ),
    makeSection(
      'match',
      '@match',
      getValues(meta, 'match'),
      t('sections.match'),
      () => t('values.match'),
    ),
    makeSection(
      'include',
      '@include',
      getValues(meta, 'include'),
      t('sections.include'),
      () => t('values.include'),
    ),
    makeSection(
      'exclude',
      '@exclude',
      getValues(meta, 'exclude'),
      t('sections.exclude'),
      () => t('values.exclude'),
    ),
    makeSection(
      'require',
      '@require',
      getValues(meta, 'require'),
      t('sections.require'),
      () => t('values.require'),
    ),
    makeSection(
      'resource',
      '@resource',
      getValues(meta, 'resource'),
      t('sections.resource'),
      () => t('values.resource'),
    ),
    makeSection(
      'run_at',
      '@run-at',
      getValues(meta, 'run-at'),
      t('sections.run_at'),
      describeRunAt,
    ),
    makeSection(
      'license',
      '@license',
      getValues(meta, 'license'),
      t('sections.license'),
      () => t('values.license'),
    ),
    makeSection(
      'namespace',
      '@namespace',
      getValues(meta, 'namespace'),
      t('sections.namespace'),
      () => t('values.namespace'),
    ),
    makeSection(
      'author',
      '@author',
      getValues(meta, 'author'),
      t('sections.author'),
      () => t('values.author'),
    ),
  ].filter((section): section is MetadataSection => Boolean(section));

  if (sections.length === 0) {
    return (
      <Empty
        description={
          <div>
            <div>{t('empty_title')}</div>
            <Text type="secondary">{t('empty_description')}</Text>
          </div>
        }
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      <Paragraph type="secondary" className="!mb-0 pb-4">
        {t('intro')}
      </Paragraph>
      {sections.map((section) => (
        <div key={section.key} className="space-y-3 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 font-mono text-sm font-semibold ${
                sectionColor[section.key] ?? defaultColor
              }`}
            >
              {section.directive}
            </span>
            <Text strong>{section.title}</Text>
          </div>
          <Paragraph type="secondary" className="!mb-0 text-sm">
            {section.description}
          </Paragraph>
          <div className="space-y-2.5">
            {section.items.map((item, index) => (
              <div
                key={`${section.key}-${index}-${item.value}`}
                className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3"
              >
                <code className="inline-block w-fit break-all rounded bg-gray-100 px-2 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {item.value}
                </code>
                <Text type="secondary" className="text-sm leading-relaxed">
                  {item.description}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
