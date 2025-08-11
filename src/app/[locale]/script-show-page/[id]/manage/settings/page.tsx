'use client';

import {
  Button,
  Input,
  Form,
  Space,
  Radio,
  Checkbox,
  Modal,
  message,
  Card,
  Divider,
  Typography,
} from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useScript } from '../../components/ScriptContext';
import { scriptService } from '@/lib/api/services/scripts';
import { APIError } from '@/types/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function SettingsPage() {
  const script = useScript();
  const router = useRouter();
  const [modal, contextHolder] = Modal.useModal();
  const [loading, setLoading] = useState(false);

  // 脚本基本信息状态
  const [name, setName] = useState(script.script.name || '');
  const [description, setDescription] = useState(
    script.script.description || '',
  );

  // 当脚本数据变化时更新状态
  useEffect(() => {
    setName(script.script.name || '');
    setDescription(script.script.description || '');
    setIsPublic((script.script.public as 1 | 2 | 3) || 1);
    setUnwell((script.script.unwell as 1 | 2) || 2);
    setArchive((script.script.archive as 1 | 2) || 2);
  }, [
    script.script.name,
    script.script.description,
    script.script.public,
    script.script.unwell,
    script.script.archive,
  ]);

  // 脚本管理状态
  const [isPublic, setIsPublic] = useState<1 | 2 | 3>(
    (script.script.public as 1 | 2 | 3) || 1,
  ); // 1: 公开, 2: 未公开, 3: 私有
  const [unwell, setUnwell] = useState<1 | 2>(
    (script.script.unwell as 1 | 2) || 2,
  ); // 1: 不当内容, 2: 正常
  const [archive, setArchive] = useState<1 | 2>(
    (script.script.archive as 1 | 2) || 2,
  ); // 1: 已归档, 2: 正常

  const handleSaveBasicInfo = async () => {
    if (!name.trim()) {
      message.error('脚本名称不能为空');
      return;
    }

    setLoading(true);
    try {
      await scriptService.updateLibInfo(script.script.id.toString(), {
        name: name.trim(),
        description: description.trim(),
      });
      message.success('库信息保存成功');
    } catch (error) {
      console.error('保存库信息失败:', error);
      if (error instanceof APIError) {
        message.error(error.msg || '保存失败');
      } else {
        message.error('保存失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublicChange = async (value: 1 | 2 | 3) => {
    setLoading(true);
    try {
      await scriptService.updatePublic(script.script.id, value);
      setIsPublic(value);
      message.success('公开状态更新成功');
    } catch (error) {
      console.error('更新公开状态失败:', error);
      if (error instanceof APIError) {
        message.error(error.msg || '更新失败');
      } else {
        message.error('更新失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnwellChange = async (checked: boolean) => {
    setLoading(true);
    try {
      const unwellValue = checked ? 1 : 2;
      await scriptService.updateUnwell(script.script.id, unwellValue);
      setUnwell(unwellValue);
      message.success('不当内容标记更新成功');
    } catch (error) {
      console.error('更新不当内容标记失败:', error);
      if (error instanceof APIError) {
        message.error(error.msg || '更新失败');
      } else {
        message.error('更新失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    const isArchiving = archive === 2;
    modal.confirm({
      title: isArchiving ? '确认归档脚本？' : '确认取消归档？',
      content: isArchiving
        ? '归档后，脚本将不再支持更新，用户无法反馈，但是仍然可以使用。'
        : '取消归档后脚本可以收到用户反馈等信息。',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      maskClosable: true,
      onOk: async () => {
        setLoading(true);
        try {
          await scriptService.archiveScript(script.script.id, isArchiving);
          setArchive(isArchiving ? 1 : 2);
          message.success(isArchiving ? '脚本已归档' : '脚本已取消归档');
        } catch (error) {
          console.error('归档操作失败:', error);
          if (error instanceof APIError) {
            message.error(error.msg || '操作失败');
          } else {
            message.error('操作失败');
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDelete = () => {
    modal.confirm({
      title: '确认删除脚本？',
      content: '删除脚本后所有数据将无法恢复，请谨慎操作！',
      icon: <ExclamationCircleOutlined />,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      maskClosable: true,
      onOk: async () => {
        setLoading(true);
        try {
          await scriptService.deleteScript(script.script.id);
          message.success('脚本已删除');
          // 删除成功后跳转到首页或脚本列表
          router.push('/');
        } catch (error) {
          console.error('删除脚本失败:', error);
          if (error instanceof APIError) {
            message.error(error.msg || '删除失败');
          } else {
            message.error('删除失败');
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Space direction="vertical" className="w-full" size={24}>
      {contextHolder}

      {/* 库信息设置 */}
      {script.script.type == 3 && (
        <Card className="shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={3} className="!mb-1">
                库信息设置
              </Title>
              <Text type="secondary">
                配置脚本库的基本信息，包括名称、描述等。
              </Text>
            </div>
          </div>
          <Form layout="vertical">
            <Form.Item label="库名称" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入库名称"
              />
            </Form.Item>
            <Form.Item label="库描述">
              <TextArea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入库描述信息"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSaveBasicInfo}
              >
                保存库信息
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 脚本公开设置 */}
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} className="!mb-1">
              脚本公开设置
            </Title>
            <Text type="secondary">
              配置脚本的公开状态，决定脚本的可见性和访问权限。
            </Text>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Title level={5}>脚本可见性</Title>
            <Text type="secondary" className="block mb-3">
              {isPublic === 3
                ? '脚本为私有状态，仅您自己可见'
                : isPublic === 2
                  ? '脚本未公开，仅通过直接链接访问'
                  : '脚本已公开，所有用户都可以查看和安装'}
            </Text>
            <Radio.Group
              value={isPublic}
              onChange={(e) => handlePublicChange(e.target.value)}
              options={[
                { value: 1, label: '公开' },
                { value: 2, label: '未公开' },
                { value: 3, label: '私有' },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </div>

          <Divider />

          <div>
            <Title level={5}>内容标记</Title>
            <Checkbox
              checked={unwell === 1}
              onChange={(e) => handleUnwellChange(e.target.checked)}
            >
              标记为可能包含不当内容
            </Checkbox>
            <Text type="secondary" className="block mt-2">
              该网站可能存在令人不适内容，包括但不限于红蓝闪光频繁闪烁、对视觉、精神有侵害的内容。
            </Text>
          </div>
        </div>
      </Card>

      {/* 脚本管理操作 */}
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} className="!mb-1">
              脚本管理
            </Title>
            <Text type="secondary">管理脚本的状态和删除</Text>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Title level={5}>脚本状态管理</Title>
            <Space className="w-full" direction="vertical">
              <Button
                type={archive === 2 ? 'default' : 'primary'}
                className={
                  archive === 2
                    ? '!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300 !text-white'
                    : '!bg-green-500 !border-green-500 hover:!bg-green-400 hover:!border-green-400'
                }
                loading={loading}
                onClick={handleArchive}
                size="large"
              >
                {archive === 2 ? '归档脚本' : '取消归档'}
              </Button>
              <Text type="secondary">
                {archive === 2
                  ? '归档后，脚本将不再支持更新，用户无法反馈，但是仍然可以使用'
                  : '脚本已归档，点击可取消归档状态'}
              </Text>
            </Space>
          </div>

          <Divider />

          <div>
            <Title level={5} type="danger">
              危险操作
            </Title>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              loading={loading}
              onClick={handleDelete}
              size="large"
            >
              删除脚本
            </Button>
            <Text type="danger" className="block mt-2">
              删除脚本后所有数据将无法恢复，请谨慎操作！
            </Text>
          </div>
        </div>
      </Card>
    </Space>
  );
}
