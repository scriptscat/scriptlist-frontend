'use client';

import {
  Avatar,
  Button,
  Card,
  Empty,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Tooltip,
} from 'antd';
import {
  ExclamationCircleOutlined,
  UserAddOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined as WarningIcon,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccessRoleList } from '@/lib/api/hooks';
import { UserModal } from '../../../../../../components/UserModal';
import { scriptAccessService } from '@/lib/api/services/scripts';
import dayjs from 'dayjs';
import { useSemDateTime } from '@/lib/utils/semdate';

const { Title, Text } = Typography;

export default function AccessPage() {
  const params = useParams();
  const id = Number(params.id);

  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const semDateTime = useSemDateTime();

  const { data, isLoading, mutate } = useAccessRoleList(id, 1);

  // 转换数据
  const list = data?.list || [];
  const total = data?.total || 0;

  // 处理用户模态框关闭后刷新数据
  const handleUserModalChange = (status: boolean) => {
    setOpenUserDialog(status);
    if (!status) {
      mutate();
    }
  };

  // 处理角色更新
  const handleRoleUpdate = async (
    itemId: number,
    roleName: 'visitor' | 'admin',
    expiretime: number,
  ) => {
    setUpdateLoading(itemId);
    try {
      const result = await scriptAccessService.updateAccessRole(
        id,
        itemId.toString(),
        {
          expiretime,
          role: roleName,
        },
      );
      if (result.code === 0) {
        mutate();
        message.success('更新成功');
      } else {
        message.error(result.msg);
      }
    } catch (error) {
      message.error('更新失败，请稍后重试');
    } finally {
      setUpdateLoading(null);
    }
  };

  // 处理删除
  const handleDelete = async (
    itemId: number,
    itemName: string,
    itemType: number,
  ) => {
    const entityType = itemType === 1 ? '用户' : '用户组';
    modal.confirm({
      title: '确认删除访问权限',
      content: `确认删除${entityType} "${itemName}" 的访问权限吗？此操作不可撤销。`,
      maskClosable: true,
      icon: <ExclamationCircleOutlined />,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleteLoading(itemId);
        try {
          await scriptAccessService.deleteAccess(id, itemId);
          message.success('删除成功');
          mutate();
        } catch (error) {
          message.error('删除失败，请稍后重试');
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  // 渲染状态标签
  const renderStatusTag = (inviteStatus: number) => {
    switch (inviteStatus) {
      case 1:
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            已接受
          </Tag>
        );
      case 2:
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            已拒绝
          </Tag>
        );
      case 3:
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            等待确认
          </Tag>
        );
      default:
        return null;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '用户/用户组',
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Avatar
            size="large"
            src={record.type === 1 ? record.avatar : undefined}
          >
            {record.type === 1 ? (
              !record.avatar && record.name ? (
                record.name[0]
              ) : (
                ''
              )
            ) : (
              <TeamOutlined />
            )}
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              {record.type === 1 ? (
                <UserOutlined className="text-blue-500" />
              ) : (
                <TeamOutlined className="text-green-500" />
              )}
              <Link
                href={
                  record.type === 1
                    ? `/users/${record.link_id}`
                    : `/groups/${record.link_id}`
                }
                target="_blank"
                className="text-sm font-medium hover:text-blue-600 transition-colors"
              >
                {record.name}
              </Link>
              <Tag color={record.type === 1 ? 'blue' : 'green'}>
                {record.type === 1 ? '用户' : '用户组'}
              </Tag>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              添加时间：{semDateTime(record.createtime)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'invite_status',
      key: 'status',
      render: (status: number) => renderStatusTag(status),
    },
    {
      title: '权限角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: any) => (
        <Select
          value={role as 'visitor' | 'admin'}
          style={{ width: 120 }}
          loading={updateLoading === record.id}
          onChange={(newRole: 'visitor' | 'admin') =>
            handleRoleUpdate(record.id, newRole, record.expiretime)
          }
          options={[
            { value: 'guest', label: '访客' },
            { value: 'manager', label: '管理员' },
          ]}
        />
      ),
    },
    {
      title: '过期时间',
      dataIndex: 'expiretime',
      key: 'expiretime',
      render: (expiretime: number, record: any) => (
        <div className="flex items-center space-x-2">
          <ClockCircleOutlined className="text-gray-400" />
          <span
            className={
              expiretime !== 0 && expiretime * 1000 < Date.now()
                ? 'text-red-500'
                : 'text-gray-700'
            }
          >
            {expiretime === 0 ? '永不过期' : semDateTime(expiretime)}
            {expiretime !== 0 && expiretime * 1000 < Date.now() && (
              <span className="ml-1 text-xs">(已过期)</span>
            )}
          </span>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Tooltip title="删除访问权限">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteLoading === record.id}
            onClick={() => handleDelete(record.id, record.name, record.type)}
          >
            删除
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card className="shadow-sm">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            访问权限管理
          </Title>
          <Text type="secondary">
            管理用户和用户组对此脚本的访问权限，包括角色分配和权限期限设置
          </Text>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setOpenUserDialog(true)}
          size="large"
        >
          添加用户/用户组
        </Button>
      </div>

      {/* 统计信息 */}
      {total > 0 && (
        <div className="mb-4 p-4 rounded-lg">
          <Space size="large">
            <div>
              <Text strong>总数：</Text>
              <Text className="text-blue-600 font-medium">{total}</Text>
            </div>
            <div>
              <Text strong>用户：</Text>
              <Text className="text-blue-600 font-medium">
                {list.filter((item) => item.type === 1).length}
              </Text>
            </div>
            <div>
              <Text strong>用户组：</Text>
              <Text className="text-green-600 font-medium">
                {list.filter((item) => item.type === 2).length}
              </Text>
            </div>
            <div>
              <Text strong>等待确认：</Text>
              <Text className="text-orange-600 font-medium">
                {list.filter((item) => item.invite_status === 3).length}
              </Text>
            </div>
            <div>
              <Text strong>已过期：</Text>
              <Text className="text-red-600 font-medium">
                {
                  list.filter(
                    (item) =>
                      item.expiretime !== 0 &&
                      item.expiretime * 1000 < Date.now(),
                  ).length
                }
              </Text>
            </div>
          </Space>
        </div>
      )}

      {/* 用户列表表格 */}
      <Table
        columns={columns}
        dataSource={list}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total,
          pageSize: 20,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p>暂无访问权限的用户或用户组</p>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setOpenUserDialog(true)}
                  >
                    添加第一个用户/用户组
                  </Button>
                </div>
              }
            />
          ),
        }}
      />
      {/* 用户添加模态框 */}
      {openUserDialog && (
        <UserModal
          status={openUserDialog}
          onChange={handleUserModalChange}
          id={id}
        />
      )}

      {contextHolder}
    </Card>
  );
}
