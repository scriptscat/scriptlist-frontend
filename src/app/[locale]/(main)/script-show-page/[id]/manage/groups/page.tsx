'use client';

import { useTranslations } from 'next-intl';
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Table,
  message,
  Card,
  Space,
  Typography,
  Tag,
  Tooltip,
} from 'antd';
import { useState } from 'react';
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  UserOutlined,
  SettingOutlined,
  DeleteOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import type { GroupMember, ScriptGroup } from '@/types/api';
import { useScriptGroupList, useGroupMemberList } from '@/lib/api/hooks';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { UserModal } from '@/components/ScriptInvite/UserModal';

const { Title, Text } = Typography;

// 管理用户组成员的模态框
const ManageModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID: number;
}> = ({ status, onChange, id, groupID }) => {
  const t = useTranslations('script.manage.groups');
  const [modal, contextHolder] = Modal.useModal();
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const {
    data,
    isLoading,
    mutate: mutateMembers,
  } = useGroupMemberList(id, groupID, page);

  const handleCancel = () => {
    onChange(false);
  };

  const getStatusTag = (member: GroupMember) => {
    if (member.invite_status === 3) {
      return (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          {t('status.waiting_confirm')}
        </Tag>
      );
    }
    return (
      <Tag icon={<CheckCircleOutlined />} color="success">
        {t('status.joined')}
      </Tag>
    );
  };

  const getExpiryText = (expiretime: number) => {
    if (expiretime === 0) {
      return t('time.never_expire');
    }
    const expiryDate = new Date(expiretime * 1000);
    const isExpired = expiryDate.getTime() < Date.now();
    return (
      <span className={isExpired ? 'text-red-500' : 'text-gray-600'}>
        {expiryDate.toLocaleDateString()} {t('time.expire_on')}
        {isExpired && (
          <span className="ml-1 text-xs">{`(${t('time.expired')})`}</span>
        )}
      </span>
    );
  };

  // 处理删除成员
  const handleDeleteMember = async (memberId: number, memberName: string) => {
    modal.confirm({
      title: t('remove_member_confirm_title'),
      content: (
        <div>
          <p>{t('remove_member_confirm_content', { userName: memberName })}</p>
          <p className="text-gray-500 text-sm mt-2">
            {t('remove_member_confirm_description')}
          </p>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      maskClosable: true,
      okText: t('confirm_button'),
      cancelText: t('cancel_button'),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleteLoading(memberId);
        try {
          await scriptAccessService.deleteGroupUser(id, groupID, memberId);
          message.success(t('remove_success'));
          mutateMembers();
        } catch (error: any) {
          message.error(error.message || t('remove_failed'));
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: t('table.user_column'),
      dataIndex: 'username',
      key: 'username',
      render: (_: any, record: GroupMember) => (
        <Space size="middle">
          <Avatar size="large" src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.username}</div>
            <div className="text-sm text-gray-500">{getStatusTag(record)}</div>
          </div>
        </Space>
      ),
    },
    {
      title: t('table.status_column'),
      dataIndex: 'invite_status',
      key: 'status',
      render: (status: number) =>
        getStatusTag({ invite_status: status } as GroupMember),
    },
    {
      title: t('table.expire_time_column'),
      dataIndex: 'expiretime',
      key: 'expiretime',
      render: (expiretime: number) => (
        <div className="flex flex-row gap-2 items-center">
          <ClockCircleOutlined />
          {getExpiryText(expiretime)}
        </div>
      ),
    },
    {
      title: t('table.action_column'),
      key: 'action',
      render: (_: any, record: GroupMember) => (
        <Tooltip title={t('table.remove_member_tooltip')}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteLoading === record.id}
            onClick={() => handleDeleteMember(record.id, record.username)}
          >
            {t('remove_member_button')}
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <TeamOutlined />
            {t('manage_members_title')}
          </Space>
        }
        open={status}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            {t('close_button')}
          </Button>,
        ]}
        width={900}
      >
        <div className="space-y-4">
          {/* 头部操作栏 */}
          <div className="flex justify-between items-center">
            <div>
              <Text strong>{t('member_management_title')}</Text>
              <div className="text-sm text-gray-500 mt-1">
                {t('stats.current_member_count', { count: data?.total || 0 })}
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpenUserDialog(true)}
            >
              {t('invite_user_button')}
            </Button>
          </div>

          {/* 成员列表表格 */}
          <Table
            columns={columns}
            dataSource={data?.list || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: page,
              total: data?.total || 0,
              pageSize: 20,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                t('pagination.total', {
                  start: range[0],
                  end: range[1],
                  total,
                }),
              onChange: (page) => setPage(page),
            }}
            locale={{
              emptyText: (
                <Empty
                  description={t('empty.no_members')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenUserDialog(true)}
                  >
                    {t('invite_first_user_button')}
                  </Button>
                </Empty>
              ),
            }}
          />
        </div>
        {contextHolder}
      </Modal>

      <UserModal
        status={openUserDialog}
        onChange={(status) => {
          if (status === false) {
            mutateMembers();
          }
          setOpenUserDialog(status);
        }}
        id={id}
        groupID={groupID}
        hideGroup={true}
      />
    </>
  );
};

// 创建用户组的模态框
const CreateGroupModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  onSuccess: () => void;
}> = ({ status, onChange, id, onSuccess }) => {
  const t = useTranslations('script.manage.groups');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    onChange(false);
    form.resetFields();
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        setLoading(true);
        try {
          await scriptAccessService.createGroup(id, {
            name: values.name,
            description: values.description,
          });
          message.success(t('create_success'));
          onSuccess();
          handleCancel();
        } catch (error: any) {
          message.error(error.message || t('create_failed'));
        } finally {
          setLoading(false);
        }
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          {t('create_group_title')}
        </Space>
      }
      open={status}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelText={t('cancel_button')}
      okText={t('create_button')}
      confirmLoading={loading}
      width={500}
    >
      <Form layout="vertical" form={form} className="mt-4">
        <Form.Item
          rules={[
            { required: true, message: t('group_name_required') },
            { max: 50, message: t('group_name_max_length') },
          ]}
          label={t('group_name_label')}
          name="name"
        >
          <Input
            placeholder={t('group_name_placeholder')}
            prefix={<TeamOutlined className="text-gray-400" />}
          />
        </Form.Item>
        <Form.Item
          rules={[
            { required: true, message: t('group_description_required') },
            { max: 200, message: t('group_description_max_length') },
          ]}
          label={t('group_description_label')}
          name="description"
        >
          <Input.TextArea
            rows={3}
            placeholder={t('group_description_placeholder')}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function GroupsPage() {
  const params = useParams();
  const id = Number(params.id);
  const t = useTranslations('script.manage.groups');
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [manageGroupID, setManageGroupID] = useState(0);
  const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const {
    data,
    isLoading,
    mutate: mutateGroups,
  } = useScriptGroupList(id, page);

  // 转换数据
  const list = data?.list || [];
  const total = data?.total || 0;

  // 渲染成员头像组
  const renderMemberAvatars = (members: GroupMember[]) => {
    if (members.length === 0) {
      return (
        <Avatar icon={<UserOutlined />} size="small" className="bg-gray-300" />
      );
    }

    return (
      <Avatar.Group
        maxCount={3}
        maxPopoverTrigger="hover"
        maxPopoverPlacement="top"
        size="small"
        maxStyle={{
          color: '#1890ff',
          backgroundColor: '#e6f7ff',
          border: '1px solid #91d5ff',
        }}
      >
        {members.slice(0, 3).map((member, index) => (
          <Tooltip key={index} title={member.username}>
            <Avatar src={member.avatar} icon={<UserOutlined />} />
          </Tooltip>
        ))}
      </Avatar.Group>
    );
  };

  // 处理删除用户组
  const handleDelete = async (groupId: number, groupName: string) => {
    modal.confirm({
      title: t('delete_confirm_title'),
      content: (
        <div>
          <p>{t('delete_confirm_content', { groupName })}</p>
          <p className="text-gray-500 text-sm mt-2">
            {t('delete_confirm_description')}
          </p>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      maskClosable: true,
      okText: t('delete_confirm_button'),
      cancelText: t('cancel_button'),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleteLoading(groupId);
        try {
          await scriptAccessService.deleteScriptGroup(id, groupId);
          message.success(t('delete_success'));
          mutateGroups();
        } catch (error: any) {
          message.error(error.message || t('delete_failed'));
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: t('table.group_column'),
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: ScriptGroup) => (
        <Space size="middle">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <TeamOutlined className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-base">{record.name}</div>
            <div className="text-sm text-gray-500 mt-1 max-w-md">
              {record.description}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: t('table.member_column'),
      dataIndex: 'member',
      key: 'member',
      render: (members: GroupMember[]) => (
        <Space size="small">
          {renderMemberAvatars(members)}
          <span className="text-sm text-gray-600">
            {t('stats.member_count', { count: members.length })}
          </span>
        </Space>
      ),
    },
    {
      title: t('table.action_column'),
      key: 'action',
      render: (_: any, record: ScriptGroup) => (
        <Space size="small">
          <Tooltip title={t('table.manage_members_tooltip')}>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                setOpenManageDialog(true);
                setManageGroupID(record.id);
              }}
            >
              {t('manage_button')}
            </Button>
          </Tooltip>
          <Tooltip title={t('table.delete_group_tooltip')}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.id}
              onClick={() => handleDelete(record.id, record.name)}
            >
              {t('delete_button')}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-sm">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            <TeamOutlined className="mr-2" />
            {t('title')}
          </Title>
          <Text type="secondary">{t('description')}</Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setOpenCreateGroupDialog(true)}
        >
          {t('create_group_button')}
        </Button>
      </div>

      {/* 统计信息 */}
      {total > 0 && (
        <div className="mb-4 p-4 rounded-lg">
          <Space size="large">
            <div>
              <Text strong>{t('stats.total_label') + ':'}</Text>
              <Text className="text-blue-600 font-medium">{total}</Text>
            </div>
            <div>
              <Text strong>{t('stats.member_total_label') + ':'}</Text>
              <Text className="text-green-600 font-medium">
                {list.reduce((sum, group) => sum + group.member.length, 0)}
              </Text>
            </div>
            <div>
              <Text strong>{t('stats.active_groups_label') + ':'}</Text>
              <Text className="text-orange-600 font-medium">
                {list.filter((group) => group.member.length > 0).length}
              </Text>
            </div>
          </Space>
        </div>
      )}

      {/* 用户组列表表格 */}
      <Table
        columns={columns}
        dataSource={list}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          total,
          pageSize: 20,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            t('pagination.total', {
              start: range[0],
              end: range[1],
              total,
            }),
          onChange: (page) => setPage(page),
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p>{t('empty.no_groups')}</p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenCreateGroupDialog(true)}
                  >
                    {t('create_first_group_button')}
                  </Button>
                </div>
              }
            />
          ),
        }}
      />

      {/* 模态框 */}
      {openManageDialog && (
        <ManageModal
          status={openManageDialog}
          id={id}
          groupID={manageGroupID}
          onChange={setOpenManageDialog}
        />
      )}

      {openCreateGroupDialog && (
        <CreateGroupModal
          status={openCreateGroupDialog}
          onChange={setOpenCreateGroupDialog}
          id={id}
          onSuccess={mutateGroups}
        />
      )}

      {contextHolder}
    </Card>
  );
}
