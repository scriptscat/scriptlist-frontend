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
            message.success('脚本元数据解析成功');
          }
        } catch (error) {
          console.error('解析脚本元数据时出错:', error);
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

      message.success('文件上传成功！');
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
      message.success(script ? '脚本更新成功！' : '脚本创建成功！');
    } catch (error: any) {
      console.error('提交失败:', error);
      message.error(
        error.message + ': ' + (script ? '脚本更新失败！' : '脚本创建失败！'),
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
            请仔细阅读并遵守
            <Link
              href="https://bbs.tampermonkey.net.cn/thread-3036-1-1.html"
              target="_blank"
              className="mx-1"
            >
              脚本审核规则
            </Link>
            ，确保代码质量和安全性。违规脚本将被下架或删除。
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
                  <span>脚本代码</span>
                  <Tag color="blue">JavaScript</Tag>
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
                      上传本地文件
                    </Button>
                  </Upload>
                  <Text type="secondary" className="flex items-center">
                    支持 .js 和 .user.js 文件
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
                  <span>详细说明</span>
                  <Tag color="green">Markdown</Tag>
                </Space>
              }
              className="shadow-sm"
            >
              <Space direction="vertical" className="w-full">
                <Form.Item name="detailedDescription" noStyle>
                  <MarkdownEditor
                    value={detailedDescription}
                    placeholder="请详细描述脚本的功能、使用方法等信息，支持 Markdown 格式..."
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
                  {script ? '发布更新' : '创建脚本'}
                </Button>
              </Space>
            </Card>
          </div>

          {/* 侧边栏信息 */}
          <div className="flex flex-col gap-3 space-y-6">
            {/* 脚本类型和版本信息 */}
            <Card title="脚本信息" size="small" className="shadow-sm">
              <div className="space-y-4">
                <Form.Item
                  name="type"
                  label="脚本类型"
                  rules={[{ required: true, message: '请选择脚本类型' }]}
                  style={{
                    display: script ? 'none' : 'block',
                  }}
                >
                  <Select placeholder="请选择脚本类型">
                    <Select.Option value={1}>用户脚本</Select.Option>
                    <Select.Option value={2}>订阅脚本</Select.Option>
                    <Select.Option value={3}>库</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="category_id" label="脚本分类">
                  <Select
                    placeholder="请选择脚本分类"
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
                      <span>版本号</span>
                      <Tooltip title="建议用语义化版本号，如：1.0.0, 2.1.5">
                        <InfoCircleOutlined className="text-gray-400" />
                      </Tooltip>
                    </Space>
                  }
                  rules={[{ required: true, message: '请输入版本号' }]}
                >
                  <Input
                    placeholder="例如: 1.0.0"
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
                        <span>预发布版本</span>
                        <Tooltip title="设置为预发布版本，正式版本不会更新至此版本，可在脚本管理页开启脚本预发布安装链接">
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
                      <span>标签</span>
                      <Tooltip
                        title={
                          scriptType === 3 ? '请输入标签' : '使用@tag添加标签'
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
                      scriptType === 3 ? '请输入标签' : '使用@tag添加标签'
                    }
                    disabled={scriptType !== 3}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
            </Card>

            {/* 库描述信息 - 仅当脚本类型为库时显示 */}
            {scriptType === 3 && !script && (
              <Card title="库描述信息" size="small" className="shadow-sm">
                <div>
                  <Form.Item
                    name="libraryName"
                    label="库名称"
                    rules={[{ required: true, message: '请输入库名称' }]}
                  >
                    <Input placeholder="例如: MyLibrary" />
                  </Form.Item>

                  <Form.Item
                    name="libraryDescription"
                    label="库描述"
                    rules={[{ required: true, message: '请输入库描述' }]}
                  >
                    <Input.TextArea
                      placeholder="请描述这个库的用途和功能..."
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
                  <span>{'更新日志'}</span>
                  <Tag color="green">Markdown</Tag>
                </Space>
              }
              size="small"
              className="shadow-sm"
            >
              <Form.Item name="changelog">
                <Input.TextArea
                  placeholder={`例如：
• 修复了某个已知问题
• 新增了某项功能  
• 优化了性能表现
• 更新了依赖库`}
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
