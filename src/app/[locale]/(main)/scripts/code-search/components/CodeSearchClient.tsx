'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Empty,
  Input,
  Pagination,
  Spin,
  Typography,
  message,
} from 'antd';
import {
  CodeOutlined,
  LoginOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useUser } from '@/contexts/UserContext';
import { APIError, type ListData } from '@/types/api';
import {
  scriptService,
  type ScriptCodeSearchItem,
} from '@/lib/api/services/scripts';

const { Text, Title } = Typography;
const PAGE_SIZE = 20;
const CODE_SEARCH_DEDUPE_MS = 2000;

interface CodeSearchClientProps {
  initialKeyword: string;
  initialPage: number;
}

interface RunSearchOptions {
  syncUrl?: boolean;
}

interface CodeSearchCacheEntry {
  promise?: Promise<ListData<ScriptCodeSearchItem>>;
  result?: ListData<ScriptCodeSearchItem>;
  timestamp: number;
}

const codeSearchCache = new Map<string, CodeSearchCacheEntry>();

function getSearchKey(keyword: string, page: number) {
  return `${keyword.trim()}:${page}`;
}

function getCodeSearchPath(keyword: string, page: number) {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  if (page > 1) params.set('page', String(page));
  return `/scripts/code-search?${params.toString()}`;
}

function getRecentCodeSearchResult(searchKey: string) {
  const entry = codeSearchCache.get(searchKey);
  if (!entry?.result) return null;
  if (Date.now() - entry.timestamp > CODE_SEARCH_DEDUPE_MS) return null;
  return entry.result;
}

async function fetchCodeSearch(
  searchKey: string,
  keyword: string,
  page: number,
) {
  const cached = codeSearchCache.get(searchKey);
  if (cached?.promise) {
    return cached.promise;
  }

  const promise = scriptService.codeSearch({
    keyword,
    page,
    size: PAGE_SIZE,
  });
  codeSearchCache.set(searchKey, { promise, timestamp: Date.now() });

  try {
    const result = await promise;
    codeSearchCache.set(searchKey, { result, timestamp: Date.now() });
    return result;
  } catch (error) {
    codeSearchCache.delete(searchKey);
    throw error;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeHighlightedHtml(snippet: string) {
  return escapeHtml(snippet)
    .replaceAll('&lt;mark&gt;', '<mark>')
    .replaceAll('&lt;/mark&gt;', '</mark>');
}

function CodeSnippet({ snippet }: { snippet: string }) {
  const html = useMemo(() => safeHighlightedHtml(snippet), [snippet]);

  return (
    <pre
      className="m-0 overflow-x-auto rounded-md border border-app-secondary bg-[rgb(var(--bg-secondary))] px-3 py-2 text-xs leading-5 text-app-primary"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
    >
      <code
        className="[&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:text-inherit dark:[&_mark]:bg-yellow-500/35"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  );
}

function CodeSearchResult({ item }: { item: ScriptCodeSearchItem }) {
  // 命中但无高亮片段(如匹配位置超出后端 highlight 分析上限)时后端可能返回
  // null/缺失,直接 .slice 会抛 TypeError 崩溃整页。兜底成空数组,优雅降级为
  // 只展示脚本名/描述/作者、不显示代码片段。
  const snippets = (item.snippets ?? []).slice(0, 3);

  return (
    <article className="rounded-lg border border-app-primary bg-app-elevated p-4 transition-colors hover:border-[rgb(var(--primary-400))]">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/script-show-page/${item.id}`}
            className="text-lg font-semibold !text-app-primary hover:!text-[rgb(var(--primary-500))]"
            target="_blank"
          >
            {item.name}
          </Link>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-app-secondary">
              {item.description}
            </p>
          )}
        </div>
        <Link
          href={`/users/${item.user_id}`}
          target="_blank"
          className="flex shrink-0 items-center gap-2 text-sm text-app-secondary hover:text-[rgb(var(--primary-500))]"
        >
          <Avatar size={24} src={item.avatar} icon={<UserOutlined />} />
          <span className="hidden max-w-28 truncate sm:inline">
            {item.username}
          </span>
        </Link>
      </div>

      <div className="space-y-2">
        {snippets.map((snippet, index) => (
          <CodeSnippet key={`${item.id}-${index}`} snippet={snippet} />
        ))}
      </div>
    </article>
  );
}

export default function CodeSearchClient({
  initialKeyword,
  initialPage,
}: CodeSearchClientProps) {
  const t = useTranslations('script.code_search');
  const router = useRouter();
  const { user, login } = useUser();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchedKeyword, setSearchedKeyword] = useState(initialKeyword.trim());
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<ListData<ScriptCodeSearchItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const lastRequestedSearchRef = useRef('');

  const runSearch = useCallback(
    async (
      nextKeyword: string,
      nextPage: number,
      options: RunSearchOptions = {},
    ) => {
      const { syncUrl = true } = options;
      const trimmed = nextKeyword.trim();
      if (trimmed.length < 2) {
        message.warning(t('keyword_too_short'));
        return;
      }
      if (!user) {
        setErrorText(t('login_required'));
        return;
      }

      const searchKey = getSearchKey(trimmed, nextPage);
      lastRequestedSearchRef.current = searchKey;
      const recentResult = getRecentCodeSearchResult(searchKey);
      if (recentResult) {
        setData(recentResult);
        setSearchedKeyword(trimmed);
        setPage(nextPage);
        setErrorText('');
        if (syncUrl) {
          router.push(getCodeSearchPath(trimmed, nextPage));
        }
        return;
      }

      setLoading(true);
      setErrorText('');
      try {
        const result = await fetchCodeSearch(searchKey, trimmed, nextPage);
        setData(result);
        setSearchedKeyword(trimmed);
        setPage(nextPage);

        if (syncUrl) {
          router.push(getCodeSearchPath(trimmed, nextPage));
        }
      } catch (error) {
        if (error instanceof APIError) {
          setErrorText(
            error.statusCode === 429 ? t('rate_limited') : error.msg,
          );
        } else {
          setErrorText(t('search_failed'));
        }
      } finally {
        setLoading(false);
      }
    },
    [router, t, user],
  );

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    const trimmed = initialKeyword.trim();
    if (trimmed.length >= 2 && user) {
      const searchKey = getSearchKey(trimmed, initialPage);
      if (lastRequestedSearchRef.current === searchKey) {
        return;
      }
      void runSearch(trimmed, initialPage, { syncUrl: false });
    }
  }, [initialKeyword, initialPage, runSearch, user]);

  const handleSearch = () => {
    void runSearch(keyword, 1);
  };

  const handlePageChange = (nextPage: number) => {
    void runSearch(searchedKeyword || keyword, nextPage);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary-50))] text-[rgb(var(--primary-600))] dark:bg-[rgb(var(--primary-500))]/15 dark:text-[rgb(var(--primary-300))]">
            <CodeOutlined />
          </span>
          <div>
            <Title level={2} className="!mb-0 !text-2xl">
              {t('title')}
            </Title>
            <Text type="secondary">{t('subtitle')}</Text>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-app-primary bg-app-elevated p-3 sm:flex-row">
          <Input
            size="large"
            value={keyword}
            placeholder={t('placeholder')}
            prefix={<SearchOutlined className="text-app-tertiary" />}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
            disabled={loading}
            maxLength={128}
          />
          <Button
            size="large"
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
            className="sm:w-32"
          >
            {t('button')}
          </Button>
        </div>
      </header>

      {!user && (
        <Alert
          type="warning"
          showIcon
          title={t('login_required')}
          action={
            <Button size="small" icon={<LoginOutlined />} onClick={login}>
              {t('login')}
            </Button>
          }
        />
      )}

      {errorText && user && <Alert type="error" showIcon title={errorText} />}

      <Spin spinning={loading}>
        <div className="min-h-64">
          {data && data.list.length > 0 && (
            <div className="space-y-4">
              {data.list.map((item) => (
                <CodeSearchResult key={item.id} item={item} />
              ))}
            </div>
          )}

          {data && data.list.length === 0 && (
            <div className="rounded-lg border border-app-primary bg-app-elevated py-12">
              <Empty description={t('empty')} />
            </div>
          )}

          {!data && !loading && user && (
            <div className="rounded-lg border border-app-primary bg-app-elevated py-12">
              <Empty description={t('ready')} />
            </div>
          )}
        </div>
      </Spin>

      {data && data.total > PAGE_SIZE && (
        <div className="flex justify-center">
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={data.total}
            showSizeChanger={false}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
