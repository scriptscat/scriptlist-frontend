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
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAccessRoleList } from '@/lib/api/hooks';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { useSemDateTime } from '@/lib/utils/semdate';
import { UserModal } from '@/components/ScriptInvite/UserModal';

const { Title, Text } = Typography;

export default function AccessPage() {
  const params = useParams();
  const id = Number(params.id);
  const t = useTranslations('script.manage.access');

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
        message.success(t('update_success'));
      } else {
        message.error(result.msg);
      }
    } catch (error: any) {
      message.error(error.message || t('update_failed'));
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
    const entityType =
      itemType === 1 ? t('entity_types.user') : t('entity_types.group');
    modal.confirm({
      title: t('delete_confirm_title'),
      content: t('delete_confirm_content', { entityType, itemName }),
      maskClosable: true,
      icon: <ExclamationCircleOutlined />,
      okText: t('delete_confirm_ok'),
      cancelText: t('delete_confirm_cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleteLoading(itemId);
        try {
          await scriptAccessService.deleteAccess(id, itemId);
          message.success(t('delete_success'));
          mutate();
        } catch (error: any) {
          message.error(error.message || t('delete_failed'));
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
            {t('status.accepted')}
          </Tag>
        );
      case 2:
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            {t('status.rejected')}
          </Tag>
        );
      case 3:
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            {t('status.pending')}
          </Tag>
        );
      default:
        return null;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: t('table.user_group_column'),
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
                {record.type === 1
                  ? t('entity_types.user')
                  : t('entity_types.group')}
              </Tag>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('time.add_time')}
              {semDateTime(record.createtime)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: t('table.status_column'),
      dataIndex: 'invite_status',
      key: 'status',
      render: (status: number) => renderStatusTag(status),
    },
    {
      title: t('table.role_column'),
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
            { value: 'guest', label: t('roles.visitor') },
            { value: 'manager', label: t('roles.admin') },
          ]}
        />
      ),
    },
    {
      title: t('table.expire_column'),
      dataIndex: 'expiretime',
      key: 'expiretime',
      render: (expiretime: number) => (
        <div className="flex items-center space-x-2">
          <ClockCircleOutlined className="text-gray-400" />
          <span
            className={
              expiretime !== 0 && expiretime * 1000 < Date.now()
                ? 'text-red-500'
                : 'text-gray-700'
            }
          >
            {expiretime === 0
              ? t('time.never_expire')
              : semDateTime(expiretime)}
            {expiretime !== 0 && expiretime * 1000 < Date.now() && (
              <span className="ml-1 text-xs">{t('time.expired')}</span>
            )}
          </span>
        </div>
      ),
    },
    {
      title: t('table.action_column'),
      key: 'action',
      render: (_: any, record: any) => (
        <Tooltip title={t('table.delete_tooltip')}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteLoading === record.id}
            onClick={() => handleDelete(record.id, record.name, record.type)}
          >
            {t('table.delete_button')}
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
            {t('title')}
          </Title>
          <Text type="secondary">{t('description')}</Text>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setOpenUserDialog(true)}
          size="large"
        >
          {t('add_user_group_button')}
        </Button>
      </div>

      {/* 统计信息 */}
      {total > 0 && (
        <div className="mb-4 p-4 rounded-lg">
          <Space size="large">
            <div>
              <Text strong>{t('stats.total')}</Text>
              <Text className="text-blue-600 font-medium">{total}</Text>
            </div>
            <div>
              <Text strong>{t('stats.users')}</Text>
              <Text className="text-blue-600 font-medium">
                {list.filter((item) => item.type === 1).length}
              </Text>
            </div>
            <div>
              <Text strong>{t('stats.groups')}</Text>
              <Text className="text-green-600 font-medium">
                {list.filter((item) => item.type === 2).length}
              </Text>
            </div>
            <div>
              <Text strong>{t('stats.pending')}</Text>
              <Text className="text-orange-600 font-medium">
                {list.filter((item) => item.invite_status === 3).length}
              </Text>
            </div>
            <div>
              <Text strong>{t('stats.expired')}</Text>
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
            t('pagination.total', { start: range[0], end: range[1], total }),
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p>{t('empty.title')}</p>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setOpenUserDialog(true)}
                  >
                    {t('empty.button')}
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
