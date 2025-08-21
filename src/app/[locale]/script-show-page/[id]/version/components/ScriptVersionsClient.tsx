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
  Divider,
  Empty,
  Spin,
  Pagination,
  Alert,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CodeOutlined,
  CalendarOutlined,
  TagOutlined,
  HistoryOutlined,
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
import MarkdownView from '@/components/MarkdownView';
import { useSemDateTime } from '@/lib/utils/semdate';
import { useTranslations } from 'next-intl';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

interface EditVersionForm {
  changelog: string;
  is_pre_release: boolean;
}

interface ScriptVersionsClientProps {
  initialVersionData: VersionListResponse;
  versionStat: VersionStatResponse;
  initialPage?: number;
  initialPageSize?: number;
}

export default function ScriptVersionsClient({
  initialVersionData,
  versionStat,
  initialPage = 1,
  initialPageSize = 10,
}: ScriptVersionsClientProps) {
  const { script } = useScript();
  const t = useTranslations('script.version');
  const [editingVersion, setEditingVersion] = useState<ScriptVersion | null>(
    null,
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [form] = Form.useForm<EditVersionForm>();
  const isPreRelease = Form.useWatch('is_pre_release', form);

  // 使用传入的版本数据
  const [versionData, setVersionData] =
    useState<VersionListResponse>(initialVersionData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const semDateTime = useSemDateTime();

  const versions = versionData?.list || [];
  const totalVersions = versionData?.total || 0;

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

  const handleInstall = (version: ScriptVersion) => {
    // TODO: 处理安装逻辑，可能需要跳转到安装页面或下载文件
    const installUrl = `/scripts/${script.id}/install?version=${version.version}`;
    window.open(installUrl, '_blank');
    message.success(t('install_success', { version: version.version }));
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
    return (
      <Card className="shadow-sm !mb-4">
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  // 处理错误状态
  if (error) {
    return (
      <Card className="shadow-sm !mb-4">
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
      </Card>
    );
  }

  // 如果没有版本数据，显示空状态
  if (!versions || versions.length === 0) {
    return (
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <Title level={2} className="!mb-2">
            {t('history_title')}
          </Title>
          <Paragraph className="text-gray-600 dark:text-gray-400">
            {t('history_description')}
          </Paragraph>
        </div>

        <Card className="shadow-sm">
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
        </Card>
      </div>
    );
  }

  return (
    <Card className="shadow-sm !mb-4">
      <div className="space-y-6">
        {/* 页面标题 */}
        <Title level={2} className="!mb-2">
          {t('history_title')}
        </Title>
        <Paragraph className="text-gray-600 dark:text-gray-400">
          {t('history_description')}
        </Paragraph>

        {/* 版本统计信息 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalVersions}
              </div>
              <div className="text-sm text-gray-500">{t('total_versions')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {versionStat.release_num}
              </div>
              <div className="text-sm text-gray-500">
                {t('release_versions')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {versionStat.pre_release_num}
              </div>
              <div className="text-sm text-gray-500">
                {t('prerelease_versions')}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">
              {t('pagination_info', {
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, totalVersions),
                total: totalVersions,
              })}
            </div>
          </div>
        </div>

        {/* 版本列表 */}
        <div className="flex flex-col gap-4 space-y-4">
          {versions.map((version: ScriptVersion, index: number) => {
            const globalIndex = (currentPage - 1) * pageSize + index; // 计算全局索引
            return (
              <Card
                key={version.id}
                className="shadow-sm hover:shadow-md transition-shadow duration-200"
                size="small"
              >
                {/* 头部区域 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <TagOutlined className="text-gray-500" />
                      <Title level={4} className="!mb-0 !text-lg">
                        {version.version}
                      </Title>
                      {getVersionBadge(version, globalIndex)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(version)}
                      className="flex items-center"
                    >
                      <span className="hidden sm:inline">
                        {t('edit_button')}
                      </span>
                    </Button>
                    <Popconfirm
                      title={t('confirm_delete_title')}
                      description={t('confirm_delete_description')}
                      onConfirm={() => handleDelete(version)}
                      okText={t('confirm_delete_ok')}
                      cancelText={t('confirm_delete_cancel')}
                      okType="danger"
                    >
                      <Button
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        className="flex items-center"
                      >
                        <span className="hidden sm:inline">
                          {t('delete_button')}
                        </span>
                      </Button>
                    </Popconfirm>
                  </div>
                </div>

                {/* 版本信息区域 */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <CalendarOutlined />
                      <span className="text-xs">
                        {semDateTime(version.createtime)}
                      </span>
                    </div>
                  </div>

                  {version.changelog && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <MarkdownView content={version.changelog} />
                    </div>
                  )}
                </div>

                <Divider className="!my-3" />

                {/* 操作区域 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="primary"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleInstall(version)}
                      className="w-full sm:w-auto"
                    >
                      {t('install_button')}
                    </Button>
                    <Link
                      href={`/script-show-page/${script.id}/code?version=${version.version}`}
                    >
                      <Button
                        size="small"
                        icon={<CodeOutlined />}
                        className="w-full sm:w-auto"
                      >
                        {t('view_code_button')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
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
    </Card>
  );
}
