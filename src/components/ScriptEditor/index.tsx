'use client';

import {
  Button,
  Card,
  Space,
  Input,
  Form,
  Typography,
  message,
  Upload,
  Checkbox,
  Alert,
  Tooltip,
  Tag,
  Select,
  Skeleton,
} from 'antd';
import {
  UploadOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  FileTextOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useTranslations } from 'next-intl';
import type { MonacoEditorRef } from '@/components/MonacoEditor';
import type { MarkdownEditorRef } from '@/components/MarkdownEditor';
import dynamic from 'next/dynamic';
import LoadingBlock from '@/components/ui/LoadingBlock';

/** Monaco 实际渲染成 500px；占位必须等高，否则加载完成会把下面的说明区整块顶下去。 */
const CODE_EDITOR_HEIGHT = 500;
/** 说明区的 Markdown 编辑器实际渲染成 300px。 */
const MARKDOWN_EDITOR_HEIGHT = 300;
/** 代码行宽度循环：40 / 70 / 55 / 85，长短交替才像代码，而不是一张等宽的表格。 */
const CODE_LINE_WIDTHS = ['40%', '70%', '55%', '85%'];
/** 画多少行代码。12 行刚好填满 500px 里工具条以下的可视区域。 */
const CODE_LINE_COUNT = 12;

/**
 * 代码编辑器的加载占位。
 *
 * 原来是 `<div style={{ height: '500px' }} />`：高度是留住了（不产生 CLS），
 * 但冷缓存下 Monaco 要下载好几百 KB，这期间用户看到的是一整块纯白空洞，
 * 分不清是在加载还是加载挂了。这里画出编辑器真实的形状：
 * 顶部 32px 工具条 + 12 行长短不一的代码行，并写明正在加载什么。
 */
function CodeEditorLoading() {
  const t = useTranslations('components.loading');

  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="script-editor-code-loading"
      style={{ height: CODE_EDITOR_HEIGHT }}
      className="flex flex-col overflow-hidden bg-app-elevated theme-transition"
    >
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-app-primary px-3">
        <Skeleton.Input
          active
          size="small"
          style={{ width: 96, minWidth: 96, height: 14 }}
        />
        <Skeleton.Input
          active
          size="small"
          style={{ width: 64, minWidth: 64, height: 14 }}
        />
      </div>
      <div
        data-testid="script-editor-code-loading-lines"
        className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3"
      >
        {Array.from({ length: CODE_LINE_COUNT }, (_, index) => (
          <Skeleton.Input
            key={index}
            active
            size="small"
            style={{
              width: CODE_LINE_WIDTHS[index % CODE_LINE_WIDTHS.length],
              minWidth: 0,
              height: 12,
            }}
          />
        ))}
      </div>
      <div className="shrink-0 px-3 pb-3 text-sm text-app-secondary">
        {t('code')}
      </div>
    </div>
  );
}

/** 说明编辑器的加载占位，与 issue / report 页的写法保持一致。 */
function MarkdownEditorLoading() {
  const t = useTranslations('components.markdown_editor');

  return (
    <LoadingBlock
      height={MARKDOWN_EDITOR_HEIGHT}
      variant="spinner"
      label={t('loading_editor')}
    />
  );
}

const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), {
  ssr: false,
  loading: () => <CodeEditorLoading />,
});
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  ssr: false,
  loading: () => <MarkdownEditorLoading />,
});
import {
  parseMetadata,
  parseTags,
} from '@/app/[locale]/(main)/script-show-page/[id]/utils';
import type { ScriptInfo } from '@/app/[locale]/(main)/script-show-page/[id]/types';
import { useCategoryList } from '@/lib/api/hooks';
import { APIError } from '@/types/api';
import IntegrityErrorAlert from '@/components/IntegrityErrorAlert/IntegrityErrorAlert';
import { ErrorCodes } from '@/lib/api/errorCodes';
import {
  LICENSE_DEFS,
  NO_DERIVATIVE_VALUE,
  CUSTOM_LICENSE,
  hasUserScriptHeader,
  getLicenseFromCode,
  setLicenseInCode,
  normalizeKnown,
} from '@/lib/license';

const { Text, Link } = Typography;
const EDITABLE_TAG_TYPE = 2;

export interface ScriptEditorProps {
  script?: ScriptInfo | null;
  onSubmit?: (formData: any) => Promise<void>;
}

export default function ScriptEditor({ script, onSubmit }: ScriptEditorProps) {
  const t = useTranslations('script.editor');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [integrityError, setIntegrityError] = useState<string | null>(null);
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: category, isLoading: isCategoryLoading } = useCategoryList();

  // 使用 Form.useWatch 监听表单字段变化
  const scriptType = Form.useWatch('type', form);
  const code = Form.useWatch('code', form);
  const isPreRelease = Form.useWatch('isPreRelease', form);
  const editorRef = useRef<MonacoEditorRef>(null);
  const mkEditorRef = useRef<MarkdownEditorRef>(null);

  // 许可协议（License）：真相源是脚本头部 @license，选择器与之双向同步
  const [licenseMode, setLicenseMode] = useState<string | undefined>(undefined);
  const [licenseCustom, setLicenseCustom] = useState('');
  // 选择器注入代码引发的变化无需重复解析，置位后跳过下一次防抖解析
  const suppressParseRef = useRef(false);
  const hasHeader = useMemo(() => hasUserScriptHeader(code || ''), [code]);

  // 从代码头部解析 @license 并回显到选择器
  const applyLicenseFromCode = useCallback((currentCode: string) => {
    const lic = getLicenseFromCode(currentCode);
    if (!lic) {
      setLicenseMode(undefined);
      setLicenseCustom('');
      return;
    }
    const known = normalizeKnown(lic);
    if (known) {
      setLicenseMode(known);
      setLicenseCustom('');
    } else {
      setLicenseMode(CUSTOM_LICENSE);
      setLicenseCustom(lic);
    }
  }, []);

  // 把选择结果写入代码头部（空字符串表示删除该行）
  const writeLicenseToCode = useCallback(
    (license: string) => {
      const cur = form.getFieldValue('code') || '';
      const next = setLicenseInCode(cur, license);
      if (next === cur) {
        return;
      }
      suppressParseRef.current = true;
      form.setFieldValue('code', next);
      editorRef.current?.setValue(next);
    },
    [form],
  );

  const handleLicenseSelect = useCallback(
    (mode?: string) => {
      setLicenseMode(mode);
      if (!mode) {
        setLicenseCustom('');
        writeLicenseToCode('');
      } else if (mode === CUSTOM_LICENSE) {
        writeLicenseToCode(licenseCustom.trim());
      } else {
        setLicenseCustom('');
        writeLicenseToCode(mode);
      }
    },
    [writeLicenseToCode, licenseCustom],
  );

  const handleLicenseCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setLicenseCustom(text);
      writeLicenseToCode(text.trim());
    },
    [writeLicenseToCode],
  );

  // 初始化表单值
  useEffect(() => {
    form.setFieldsValue({
      type: script ? script.type : 1,
      code: script?.script?.code || '',
      tags:
        script?.tags
          .filter((tag) => tag.type === EDITABLE_TAG_TYPE)
          .map((tag) => tag.name) || [],
      isPreRelease: 0,
      detailedDescription: script?.content || '',
      version: script?.script?.version || '',
      category_id: script?.category?.id,
      changelog: '',
      libraryName: '',
      libraryDescription: '',
    });
    applyLicenseFromCode(script?.script?.code || '');
  }, [script, form]);

  // 防抖解析脚本元数据
  const debouncedParseMetadata = useCallback(
    (code: string) => {
      const currentScriptType = form.getFieldValue('type');
      if (currentScriptType === 3) {
        return;
      }
      // 选择器注入代码引发的变化跳过解析，避免误弹"解析成功"提示
      if (suppressParseRef.current) {
        suppressParseRef.current = false;
        return;
      }
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }

      parseTimeoutRef.current = setTimeout(() => {
        try {
          const metadata = parseMetadata(code);
          if (metadata) {
            // 自动填充表单字段
            if (metadata.version && metadata.version[0]) {
              form.setFieldValue('version', metadata.version[0]);
            }
            form.setFieldValue('tags', parseTags(metadata));
            message.success(t('messages.metadata_parse_success'));
          }
          applyLicenseFromCode(code);
        } catch (error) {
          console.error('Parse script metadata error:', error);
        }
      }, 2000);
    },
    [form, applyLicenseFromCode],
  );

  // 处理代码变化
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || '';
      form.setFieldValue('code', newCode);

      if (newCode.trim()) {
        debouncedParseMetadata(newCode);
      }
    },
    [debouncedParseMetadata, form],
  );

  // 组件卸载时清理定时器
  useEffect(() => {
    const currentCode = form.getFieldValue('code');
    if (currentCode) {
      debouncedParseMetadata(currentCode);
    }
    return () => {
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }
    };
  }, [form, debouncedParseMetadata]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      form.setFieldValue('code', content);
      editorRef.current?.setValue(content);

      if (content.trim()) {
        debouncedParseMetadata(content);
      }

      message.success(t('messages.file_upload_success'));
    };
    reader.readAsText(file);
    return false;
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (!onSubmit) return;

    // 成功后**不**关掉 loading：`onSubmit` 在 `router.push` 被**调用**的那一刻就
    // resolve 了，导航还在飞；而编程式跳转没有全局顶部进度条
    // （`NavigationProgress` 只在 document 上监听 `<a>` 点击），一旦按钮回到可点，
    // 用户看到的就是一个「提交完却什么也没发生」的表单，只会再点一次。
    // 按钮保持 loading 直到新页面把这个组件卸载掉。
    let navigating = false;
    try {
      setLoading(true);
      setIntegrityError(null);
      values.detailedDescription = mkEditorRef.current?.getValue();
      await onSubmit(values);
      message.success(
        script
          ? t('messages.script_update_success')
          : t('messages.script_create_success'),
      );
      navigating = true;
    } catch (error: any) {
      console.error('Submit failed:', error);
      if (error instanceof APIError) {
        if (error.code === ErrorCodes.SimilarityIntegrityRejected) {
          setIntegrityError(error.msg);
        } else {
          message.error(`${t('messages.submit_failed')} ${error.msg}`);
        }
      } else {
        message.error(
          `${t('messages.submit_failed')} ${
            script
              ? t('messages.script_update_failed')
              : t('messages.script_create_failed')
          }`,
        );
      }
    } finally {
      if (!navigating) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-7xl mx-auto space-y-6">
      {integrityError && <IntegrityErrorAlert message={integrityError} />}
      {/* 提示信息 */}
      <Alert
        description={
          <div>
            {t('alerts.review_rules_text')}
            <Link
              href="https://bbs.tampermonkey.net.cn/thread-3036-1-1.html"
              target="_blank"
              className="mx-1"
            >
              {t('alerts.review_rules_link')}
            </Link>
            {t('alerts.review_rules_description')}
          </div>
        }
        type="info"
        showIcon
        closable
        className="shadow-sm"
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
          {/* 主要内容区域 */}
          <div className="flex flex-col gap-3 xl:col-span-3 space-y-6">
            {/* 代码编辑器 */}
            <Card
              title={
                <Space>
                  <CodeOutlined />
                  <span>{t('code_section.title')}</span>
                  <Tag color="blue">{t('code_section.tag')}</Tag>
                </Space>
              }
              className="shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Upload
                    accept=".js,.user.js"
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} size="small">
                      {t('code_section.upload_button')}
                    </Button>
                  </Upload>
                  <Text type="secondary" className="flex items-center">
                    {t('code_section.file_support')}
                  </Text>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Form.Item name="code" noStyle>
                    <MonacoEditor
                      ref={editorRef}
                      value={code}
                      language="javascript"
                      readOnly={false}
                      height="500px"
                      className="w-full"
                      onChange={handleCodeChange}
                    />
                  </Form.Item>
                </div>
              </div>
            </Card>

            {/* 详细说明 */}
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>{t('description_section.title')}</span>
                  <Tag color="green">{t('description_section.tag')}</Tag>
                </Space>
              }
              className="shadow-sm"
            >
              <Space direction="vertical" className="w-full">
                <Form.Item name="detailedDescription" noStyle>
                  <MarkdownEditor
                    ref={mkEditorRef}
                    initialValue={script?.content}
                    placeholder={t('description_section.placeholder')}
                    rows={12}
                    comment={script ? 'update-script' : 'create-script'}
                    linkId={script?.id}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  htmlType="submit"
                  loading={loading}
                  className="float-end"
                >
                  {script
                    ? t('description_section.update_button')
                    : t('description_section.create_button')}
                </Button>
              </Space>
            </Card>
          </div>

          {/* 侧边栏信息 */}
          <div className="flex flex-col gap-3 space-y-6">
            {/* 脚本类型和版本信息 */}
            <Card
              title={t('info_section.title')}
              size="small"
              className="shadow-sm"
            >
              <div className="space-y-4">
                <Form.Item
                  name="type"
                  label={t('info_section.script_type_label')}
                  rules={[
                    {
                      required: true,
                      message: t('info_section.script_type_required'),
                    },
                  ]}
                  style={{
                    display: script ? 'none' : 'block',
                  }}
                >
                  <Select
                    placeholder={t('info_section.script_type_placeholder')}
                  >
                    <Select.Option value={1}>
                      {t('script_types.user_script')}
                    </Select.Option>
                    {/* 订阅脚本(type=2)暂不支持发布，不提供该选项 */}
                    <Select.Option value={3}>
                      {t('script_types.library')}
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="category_id"
                  label={t('info_section.script_category_label')}
                >
                  <Select
                    placeholder={t('info_section.script_category_placeholder')}
                    loading={isCategoryLoading}
                    allowClear
                    options={category?.categories.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  name="version"
                  label={
                    <Space size="small">
                      <span>{t('info_section.version_label')}</span>
                      <Tooltip title={t('info_section.version_tooltip')}>
                        <InfoCircleOutlined className="text-gray-400" />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    {
                      required: true,
                      message: t('info_section.version_required'),
                    },
                  ]}
                >
                  <Input
                    placeholder={t('info_section.version_placeholder')}
                    disabled={scriptType !== 3}
                  />
                </Form.Item>

                {scriptType !== 3 && (
                  <Form.Item
                    label={
                      <Space size="small">
                        <span>{t('info_section.license_label')}</span>
                        <Tooltip title={t('info_section.license_tooltip')}>
                          <InfoCircleOutlined className="text-gray-400" />
                        </Tooltip>
                      </Space>
                    }
                  >
                    <Select
                      value={licenseMode}
                      placeholder={t('info_section.license_placeholder')}
                      onChange={handleLicenseSelect}
                      allowClear
                      disabled={!hasHeader}
                      style={{ width: '100%' }}
                      options={[
                        {
                          label: t('info_section.license_group_opensource'),
                          options: LICENSE_DEFS.filter(
                            (d) => d.group === 'opensource',
                          ).map((d) => ({ value: d.value, label: d.value })),
                        },
                        {
                          label: t('info_section.license_group_other'),
                          options: [
                            {
                              value: NO_DERIVATIVE_VALUE,
                              label: t('info_section.license_no_derivative'),
                            },
                            {
                              value: CUSTOM_LICENSE,
                              label: t('info_section.license_custom'),
                            },
                          ],
                        },
                      ]}
                    />
                    {licenseMode === CUSTOM_LICENSE && (
                      <Input
                        value={licenseCustom}
                        onChange={handleLicenseCustomChange}
                        placeholder={t(
                          'info_section.license_custom_placeholder',
                        )}
                        className="mt-2"
                      />
                    )}
                    {!hasHeader ? (
                      <Text type="secondary" className="text-xs block mt-1">
                        {t('info_section.license_need_header')}
                      </Text>
                    ) : licenseMode &&
                      (licenseMode !== CUSTOM_LICENSE ||
                        licenseCustom.trim()) ? (
                      <Text type="success" className="text-xs block mt-1">
                        {t('info_section.license_written', {
                          license:
                            licenseMode === CUSTOM_LICENSE
                              ? licenseCustom.trim()
                              : licenseMode,
                        })}
                      </Text>
                    ) : (
                      <Text type="warning" className="text-xs block mt-1">
                        {t('info_section.license_none_warning')}
                      </Text>
                    )}
                  </Form.Item>
                )}

                {script && (
                  <Form.Item name="isPreRelease">
                    <Checkbox
                      checked={isPreRelease === 1}
                      indeterminate={isPreRelease === 0 && scriptType === 1}
                      onChange={() => {
                        const currentValue = form.getFieldValue('isPreRelease');
                        let newValue: number;

                        if (currentValue === 0) {
                          // 从半选中状态变为勾选
                          newValue = 1;
                        } else if (currentValue === 1) {
                          // 从勾选状态变为不勾选
                          newValue = 2;
                        } else {
                          // 从不勾选状态变为勾选
                          newValue = 1;
                        }

                        form.setFieldValue('isPreRelease', newValue);
                      }}
                    >
                      <Space size="small">
                        <span>{t('info_section.prerelease_label')}</span>
                        <Tooltip title={t('info_section.prerelease_tooltip')}>
                          <InfoCircleOutlined className="text-gray-400" />
                        </Tooltip>
                      </Space>
                    </Checkbox>
                  </Form.Item>
                )}

                <Form.Item
                  name="tags"
                  label={
                    <Space size="small">
                      <span>{t('info_section.tags_label')}</span>
                      <Tooltip
                        title={
                          scriptType === 3
                            ? t('info_section.tags_tooltip_library')
                            : t('info_section.tags_tooltip_script')
                        }
                      >
                        <InfoCircleOutlined className="text-gray-400" />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Select
                    mode="tags"
                    placeholder={
                      scriptType === 3
                        ? t('info_section.tags_placeholder_library')
                        : t('info_section.tags_placeholder_script')
                    }
                    disabled={scriptType !== 3}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
            </Card>

            {/* 库描述信息 - 仅当脚本类型为库时显示 */}
            {scriptType === 3 && !script && (
              <Card
                title={t('library_section.title')}
                size="small"
                className="shadow-sm"
              >
                <div>
                  <Form.Item
                    name="libraryName"
                    label={t('library_section.name_label')}
                    rules={[
                      {
                        required: true,
                        message: t('library_section.name_required'),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t('library_section.name_placeholder')}
                    />
                  </Form.Item>

                  <Form.Item
                    name="libraryDescription"
                    label={t('library_section.description_label')}
                    rules={[
                      {
                        required: true,
                        message: t('library_section.description_required'),
                      },
                    ]}
                  >
                    <Input.TextArea
                      placeholder={t('library_section.description_placeholder')}
                      rows={3}
                      showCount
                      maxLength={200}
                    />
                  </Form.Item>
                </div>
              </Card>
            )}

            {/* 更新日志/发布说明 */}
            <Card
              title={
                <Space>
                  <span>{t('changelog_section.title')}</span>
                  <Tag color="green">{t('changelog_section.tag')}</Tag>
                </Space>
              }
              size="small"
              className="shadow-sm"
            >
              <Form.Item name="changelog">
                <Input.TextArea
                  placeholder={t('changelog_section.placeholder')}
                  rows={8}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
