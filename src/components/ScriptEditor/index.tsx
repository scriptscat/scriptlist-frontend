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
} from 'antd';
import {
  UploadOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  FileTextOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { MonacoEditorRef } from '@/components/MonacoEditor';
import MonacoEditor from '@/components/MonacoEditor';
import MarkdownEditor from '@/components/MarkdownEditor';
import {
  parseMetadata,
  parseTags,
} from '@/app/[locale]/script-show-page/[id]/utils';
import type { ScriptInfo } from '@/app/[locale]/script-show-page/[id]/types';
import { useCategoryList } from '@/lib/api/hooks';

const { Text, Link } = Typography;

export interface ScriptEditorProps {
  script?: ScriptInfo | null;
  onSubmit?: (formData: any) => Promise<void>;
}

export default function ScriptEditor({ script, onSubmit }: ScriptEditorProps) {
  const t = useTranslations('script.editor');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: category, isLoading: isCategoryLoading } = useCategoryList();

  // 使用 Form.useWatch 监听表单字段变化
  const scriptType = Form.useWatch('type', form);
  const code = Form.useWatch('code', form);
  const detailedDescription = Form.useWatch('detailedDescription', form);
  const isPreRelease = Form.useWatch('isPreRelease', form);
  const editorRef = useRef<MonacoEditorRef>(null);

  // 初始化表单值
  useEffect(() => {
    form.setFieldsValue({
      type: script ? script.type : 1,
      code: script?.script?.code || '',
      tags: script?.tags.map((tag) => tag.name) || [],
      isPreRelease: 0,
      detailedDescription: script?.content || '',
      version: script?.script?.version || '',
      category_id: script?.category?.id,
      changelog: '',
      libraryName: '',
      libraryDescription: '',
    });
  }, [script, form]);

  // 防抖解析脚本元数据
  const debouncedParseMetadata = useCallback(
    (code: string) => {
      const currentScriptType = form.getFieldValue('type');
      if (currentScriptType === 3) {
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
        } catch (error) {
          console.error('Parse script metadata error:', error);
        }
      }, 2000);
    },
    [form],
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

    try {
      setLoading(true);
      await onSubmit(values);
      message.success(
        script
          ? t('messages.script_update_success')
          : t('messages.script_create_success'),
      );
    } catch (error: any) {
      console.error('Submit failed:', error);
      message.error(
        t('messages.submit_failed') +
          ' ' +
          (script
            ? t('messages.script_update_failed')
            : t('messages.script_create_failed')),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-7xl mx-auto space-y-6">
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
                    value={detailedDescription}
                    placeholder={t('description_section.placeholder')}
                    rows={12}
                    comment={script ? 'update-script' : 'create-script'}
                    linkId={script?.id}
                    onChange={(value) =>
                      form.setFieldValue('detailedDescription', value)
                    }
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
                    <Select.Option value={2}>
                      {t('script_types.subscribe_script')}
                    </Select.Option>
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
