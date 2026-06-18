'use client';

import {
  Button,
  Card,
  Badge,
  Typography,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Empty,
  Spin,
  Pagination,
  Alert,
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CodeOutlined,
  CalendarOutlined,
  HistoryOutlined,
  DiffOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import React, { useState } from 'react';
import { useScript } from '../../components/ScriptContext';
import type {
  ScriptVersion,
  VersionListResponse,
  VersionStatResponse,
} from '@/lib/api/services/scripts/scripts';
import {
  EnablePreRelease,
  scriptService,
} from '@/lib/api/services/scripts/scripts';
import { Link } from '@/i18n/routing';
import dynamic from 'next/dynamic';
const MarkdownView = dynamic(() => import('@/components/MarkdownView'));
import { useSemDateTime } from '@/lib/utils/semdate';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useScriptInstallGuide } from '@/components/ScriptInstallGuide';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

function VersionChangelog({ changelog }: { changelog: string }) {
  const t = useTranslations('script.version');
  const ref = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setExpanded(false);
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 4);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const raf = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [changelog]);
  return (
    <div className="border-l-[3px] border-gray-200 pl-3 dark:border-gray-700">
      <div ref={ref} className={expanded ? '' : 'line-clamp-2 overflow-hidden'}>
        <MarkdownView content={changelog} />
      </div>
      {(overflowing || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {expanded ? t('collapse_changelog') : t('expand_changelog')}
          {expanded ? (
            <UpOutlined className="text-xs" />
          ) : (
            <DownOutlined className="text-xs" />
          )}
        </button>
      )}
    </div>
  );
}

interface EditVersionForm {
  changelog: string;
  is_pre_release: boolean;
}

interface ScriptVersionsClientProps {
  initialVersionData: VersionListResponse | null;
  versionStat: VersionStatResponse | null;
  initialPage?: number;
  initialPageSize?: number;
  embedded?: boolean;
  initialError?: string;
}

export default function ScriptVersionsClient({
  initialVersionData,
  versionStat,
  initialPage = 1,
  initialPageSize = 10,
  embedded = false,
  initialError,
}: ScriptVersionsClientProps) {
  const { script } = useScript();
  const t = useTranslations('script.version');
  const router = useRouter();
  const { handleInstallClick, guideModal } = useScriptInstallGuide(); // 未检测到脚本管理器时的二次引导
  const [editingVersion, setEditingVersion] = useState<ScriptVersion | null>(
    null,
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [form] = Form.useForm<EditVersionForm>();
  const isPreRelease = Form.useWatch('is_pre_release', form);

  // 版本对比状态管理
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // 使用传入的版本数据
  const [versionData, setVersionData] = useState<VersionListResponse>(
    initialVersionData || { list: [], total: 0 },
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(
    initialError ? new Error(initialError) : null,
  );
  const semDateTime = useSemDateTime();

  const versions = versionData?.list || [];
  const totalVersions = versionData?.total || 0;
  const releaseCount = versionStat?.release_num || 0;
  const preReleaseCount = versionStat?.pre_release_num || 0;

  // 刷新数据的函数
  const mutate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newData = await scriptService.getVersionList(script.id, {
        page: currentPage,
        size: pageSize,
      });
      setVersionData(newData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理翻页
  const handlePageChange = async (page: number, size?: number) => {
    const newPageSize = size || pageSize;

    try {
      setIsLoading(true);
      setError(null);

      // 更新状态
      setCurrentPage(page);
      if (size && size !== pageSize) {
        setPageSize(size);
      }

      // 获取新页面数据
      const newData = await scriptService.getVersionList(script.id, {
        page: page,
        size: newPageSize,
      });
      setVersionData(newData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (version: ScriptVersion) => {
    setEditingVersion(version);
    form.setFieldsValue({
      changelog: version.changelog,
      is_pre_release:
        version.is_pre_release === EnablePreRelease.EnablePreReleaseScript,
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values: EditVersionForm) => {
    if (!editingVersion) return;

    setLoading(true);
    try {
      // 调用 API 更新版本信息
      await scriptService.updateVersion(script.id, editingVersion.id, {
        changelog: values.changelog,
        is_pre_release: values.is_pre_release
          ? EnablePreRelease.EnablePreReleaseScript
          : EnablePreRelease.DisablePreReleaseScript,
      });

      message.success(t('update_success'));
      setIsEditModalVisible(false);
      setEditingVersion(null);
      form.resetFields();

      // 刷新数据
      mutate();
    } catch (error) {
      console.error(t('update_version_failed'), error);
      message.error(t('update_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (version: ScriptVersion) => {
    try {
      // 调用 API 删除版本
      await scriptService.deleteVersion(script.id, version.id);

      message.success(t('delete_success'));

      // 刷新数据
      mutate();
    } catch (error) {
      console.error(t('delete_version_failed'), error);
      message.error(t('delete_failed'));
    }
  };

  // 处理版本选择用于对比
  const handleVersionSelect = (version: ScriptVersion) => {
    const versionId = version.version;

    if (selectedVersions.includes(versionId)) {
      // 取消选择
      setSelectedVersions((prev) => prev.filter((id) => id !== versionId));
    } else {
      // 选择版本
      setSelectedVersions((prev) => {
        const newSelected = [...prev, versionId];

        // 如果选择了超过2个版本，移除最早选择的版本
        if (newSelected.length > 2) {
          newSelected.shift();
        }

        // 如果现在有2个版本被选择，自动跳转到对比页面
        if (newSelected.length === 2) {
          router.push(
            `/script-show-page/${script.id}/diff?version1=${newSelected[0]}&version2=${newSelected[1]}`,
          );
        }

        return newSelected;
      });
    }
  };

  const getVersionBadge = (version: ScriptVersion, index: number) => {
    if (
      index === 0 &&
      version.is_pre_release === EnablePreRelease.DisablePreReleaseScript
    ) {
      return <Badge status="success" text={t('latest_version_badge')} />;
    }
    if (version.is_pre_release === EnablePreRelease.EnablePreReleaseScript) {
      return <Badge status="warning" text={t('prerelease_badge')} />;
    }
    return null;
  };

  // 处理加载状态
  if (isLoading) {
    const loadingContent = (
      <Card className="shadow-sm !mb-4">
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      </Card>
    );
    return embedded ? (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    ) : (
      loadingContent
    );
  }

  // 处理错误状态
  if (error) {
    const errorContent = (
      <Alert
        message={t('load_failed')}
        description={error.message || t('load_failed_description')}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => mutate()}>
            {t('retry')}
          </Button>
        }
      />
    );
    return embedded ? (
      errorContent
    ) : (
      <Card className="shadow-sm !mb-4">{errorContent}</Card>
    );
  }

  // 如果没有版本数据，显示空状态
  if (!versions || versions.length === 0) {
    const emptyContent = (
      <div className="space-y-6">
        <Empty
          image={
            <HistoryOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
          }
          description={
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-base mb-2">
                {t('no_history_title')}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {t('no_history_description')}
              </p>
            </div>
          }
        />
      </div>
    );
    return embedded ? (
      emptyContent
    ) : (
      <div className="space-y-6">
        <div className="mb-6">
          <Title level={2} className="!mb-2">
            {t('history_title')}
          </Title>
          <Paragraph className="text-gray-600 dark:text-gray-400">
            {t('history_description')}
          </Paragraph>
        </div>

        <Card className="shadow-sm">{emptyContent}</Card>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      {guideModal}
      {/* 页面标题 */}
      {!embedded && (
        <>
          <Title level={2} className="!mb-2">
            {t('history_title')}
          </Title>
          <Paragraph className="text-gray-600 dark:text-gray-400">
            {t('history_description')}
          </Paragraph>
        </>
      )}

      {/* 版本统计信息 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {t('version_count', { count: totalVersions })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {t('release_chip', { count: releaseCount })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t('prerelease_chip', { count: preReleaseCount })}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {t('pagination_info', {
            start: (currentPage - 1) * pageSize + 1,
            end: Math.min(currentPage * pageSize, totalVersions),
            total: totalVersions,
          })}
        </span>
      </div>

      {/* 版本列表 */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {versions.map((version: ScriptVersion, index: number) => {
          const globalIndex = (currentPage - 1) * pageSize + index;
          const versionInstallUrl = `/scripts/code/${script.id}/${encodeURIComponent(
            script.name,
          )}.user.js?version=${version.version}`;
          return (
            <div key={version.id} className="space-y-3 py-5 first:pt-0">
              {/* 头部：版本号 + 徽标 / 日期 + 管理按钮 */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {version.version}
                  </span>
                  {getVersionBadge(version, globalIndex)}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <CalendarOutlined />
                  <span className="text-xs">
                    {semDateTime(version.createtime)}
                  </span>
                  <Tooltip title={t('edit_button')}>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(version)}
                      className="!text-gray-500"
                    />
                  </Tooltip>
                  <Popconfirm
                    title={t('confirm_delete_title')}
                    description={t('confirm_delete_description')}
                    onConfirm={() => handleDelete(version)}
                    okText={t('confirm_delete_ok')}
                    cancelText={t('confirm_delete_cancel')}
                    okType="danger"
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={t('delete_button')}
                    />
                  </Popconfirm>
                </div>
              </div>

              {/* changelog（可折叠） */}
              {version.changelog && (
                <VersionChangelog changelog={version.changelog} />
              )}

              {/* 操作：安装/查看代码 左，对比 图标 右 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    href={versionInstallUrl}
                    target="_blank"
                    onClick={(e) => handleInstallClick(e, versionInstallUrl)}
                  >
                    {t('install_button')}
                  </Button>
                  <Link
                    href={`/script-show-page/${script.id}/code?version=${version.version}`}
                  >
                    <Button size="small" icon={<CodeOutlined />}>
                      {t('view_code_button')}
                    </Button>
                  </Link>
                </div>
                <Tooltip title={t('compare_button')}>
                  <Button
                    size="small"
                    color={
                      selectedVersions.includes(version.version)
                        ? 'primary'
                        : 'default'
                    }
                    variant="outlined"
                    icon={<DiffOutlined />}
                    onClick={() => handleVersionSelect(version)}
                    disabled={
                      selectedVersions.length >= 2 &&
                      !selectedVersions.includes(version.version)
                    }
                  />
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分页组件 */}
      {totalVersions > pageSize && (
        <div className="flex justify-center pt-4">
          <Pagination
            current={currentPage}
            total={totalVersions}
            pageSize={pageSize}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              t('pagination_total', {
                start: range[0],
                end: range[1],
                total: total,
              })
            }
            pageSizeOptions={['5', '10', '20', '50']}
            className="!mb-0"
          />
        </div>
      )}

      {/* 编辑模态框 */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EditOutlined />
            <span>
              {t('edit_modal_title', {
                version: editingVersion?.version || '',
              })}
            </span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingVersion(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="max-w-[90vw]"
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
            className="mt-4"
          >
            <Form.Item
              name="changelog"
              label={
                <div className="flex items-center space-x-1">
                  <span>{t('changelog_label')}</span>
                  <Text type="secondary" className="text-xs">
                    {t('changelog_subtitle')}
                  </Text>
                </div>
              }
            >
              <TextArea
                rows={8}
                placeholder={t('changelog_placeholder')}
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Form.Item
              name="is_pre_release"
              valuePropName="checked"
              label={t('version_type_label')}
              extra={t('version_type_extra')}
            >
              <Switch
                className={
                  isPreRelease
                    ? '[&_>.ant-switch-inner]:bg-[#f97316]'
                    : '[&_>.ant-switch-inner]:bg-[#10b981]'
                }
                checkedChildren={t('prerelease_checked')}
                unCheckedChildren={t('prerelease_unchecked')}
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setIsEditModalVisible(false);
                    setEditingVersion(null);
                    form.resetFields();
                  }}
                  disabled={loading}
                >
                  {t('confirm_delete_cancel')}
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {t('save_changes')}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );

  return embedded ? (
    content
  ) : (
    <Card className="shadow-sm !mb-4">{content}</Card>
  );
}
