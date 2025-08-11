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
import { UserModal } from '@/components/UserModal';

const { Title, Text } = Typography;

// 管理用户组成员的模态框
const ManageModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID: number;
}> = ({ status, onChange, id, groupID }) => {
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
          {'等待确认'}
        </Tag>
      );
    }
    return (
      <Tag icon={<CheckCircleOutlined />} color="success">
        {'已加入'}
      </Tag>
    );
  };

  const getExpiryText = (expiretime: number) => {
    if (expiretime === 0) {
      return '永不过期';
    }
    const expiryDate = new Date(expiretime * 1000);
    const isExpired = expiryDate.getTime() < Date.now();
    return (
      <span className={isExpired ? 'text-red-500' : 'text-gray-600'}>
        {expiryDate.toLocaleDateString()} {'到期'}
        {isExpired && <span className="ml-1 text-xs">({'已过期'})</span>}
      </span>
    );
  };

  // 处理删除成员
  const handleDeleteMember = async (memberId: number, memberName: string) => {
    modal.confirm({
      title: '确认移除',
      content: (
        <div>
          <p>
            {'确认要移除用户'} <span className="font-medium">{memberName}</span>{' '}
            {'吗？'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {'移除后该用户将失去访问权限'}
          </p>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      maskClosable: true,
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleteLoading(memberId);
        try {
          await scriptAccessService.deleteGroupUser(id, groupID, memberId);
          message.success('移除成功');
          mutateMembers();
        } catch (error: any) {
          message.error(error.message || '移除失败');
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '用户',
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
      title: '状态',
      dataIndex: 'invite_status',
      key: 'status',
      render: (status: number) =>
        getStatusTag({ invite_status: status } as GroupMember),
    },
    {
      title: '过期时间',
      dataIndex: 'expiretime',
      key: 'expiretime',
      render: (expiretime: number) => (
        <div className="flex items-center space-x-2">
          <ClockCircleOutlined className="text-gray-400" />
          {getExpiryText(expiretime)}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: GroupMember) => (
        <Tooltip title={'移除成员'}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteLoading === record.id}
            onClick={() => handleDeleteMember(record.id, record.username)}
          >
            {'移除'}
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
            {'用户组成员管理'}
          </Space>
        }
        open={status}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            {'关闭'}
          </Button>,
        ]}
        width={900}
      >
        <div className="space-y-4">
          {/* 头部操作栏 */}
          <div className="flex justify-between items-center">
            <div>
              <Text strong>{'成员管理'}</Text>
              <div className="text-sm text-gray-500 mt-1">
                {'当前共有'}{' '}
                <Text className="text-blue-600 font-medium">
                  {data?.total || 0}
                </Text>{' '}
                {'名成员'}
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpenUserDialog(true)}
            >
              {'邀请用户'}
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
                `${'第'} ${range[0]}-${range[1]} ${'条，共'} ${total} ${'条'}`,
              onChange: (page) => setPage(page),
            }}
            locale={{
              emptyText: (
                <Empty
                  description="暂无成员"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenUserDialog(true)}
                  >
                    邀请第一个用户
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
          message.success('创建成功');
          onSuccess();
          handleCancel();
        } catch (error: any) {
          message.error(error.message || '创建失败');
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => {});
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          {'创建用户组'}
        </Space>
      }
      open={status}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelText={'取消'}
      okText={'创建'}
      confirmLoading={loading}
      width={500}
    >
      <Form layout="vertical" form={form} className="mt-4">
        <Form.Item
          rules={[
            { required: true, message: '请输入组名' },
            { max: 50, message: '组名不能超过50个字符' },
          ]}
          label={'组名'}
          name="name"
        >
          <Input
            placeholder={'请输入用户组名称'}
            prefix={<TeamOutlined className="text-gray-400" />}
          />
        </Form.Item>
        <Form.Item
          rules={[
            { required: true, message: '请输入组描述' },
            { max: 200, message: '描述不能超过200个字符' },
          ]}
          label={'组描述'}
          name="description"
        >
          <Input.TextArea
            rows={3}
            placeholder={'请详细描述该用户组的用途和权限范围'}
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
  const t = useTranslations();
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [manageGroupID, setManageGroupID] = useState(0);
  const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const {
    data,
    error,
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
      title: '确认删除',
      content: (
        <div>
          <p>
            {'确认要删除用户组'}{' '}
            <span className="font-medium">{`"${groupName}"`}</span> {'吗？'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {'删除后该用户组的所有成员将失去相关权限，此操作不可恢复'}
          </p>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      maskClosable: true,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleteLoading(groupId);
        try {
          await scriptAccessService.deleteScriptGroup(id, groupId);
          message.success('删除成功');
          mutateGroups();
        } catch (error) {
          message.error('删除失败');
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '用户组',
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
      title: '成员',
      dataIndex: 'member',
      key: 'member',
      render: (members: GroupMember[]) => (
        <Space size="small">
          {renderMemberAvatars(members)}
          <span className="text-sm text-gray-600">
            {members.length} {'名成员'}
          </span>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ScriptGroup) => (
        <Space size="small">
          <Tooltip title={'管理成员'}>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                setOpenManageDialog(true);
                setManageGroupID(record.id);
              }}
            >
              {'管理'}
            </Button>
          </Tooltip>
          <Tooltip title={'删除用户组'}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.id}
              onClick={() => handleDelete(record.id, record.name)}
            >
              {'删除'}
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
            {'用户组管理'}
          </Title>
          <Text type="secondary">
            {'管理脚本的用户组权限，控制不同用户的访问级别'}
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setOpenCreateGroupDialog(true)}
        >
          {'新建用户组'}
        </Button>
      </div>

      {/* 统计信息 */}
      {total > 0 && (
        <div className="mb-4 p-4 rounded-lg">
          <Space size="large">
            <div>
              <Text strong>{'总数'}：</Text>
              <Text className="text-blue-600 font-medium">{total}</Text>
            </div>
            <div>
              <Text strong>{'成员总数'}：</Text>
              <Text className="text-green-600 font-medium">
                {list.reduce((sum, group) => sum + group.member.length, 0)}
              </Text>
            </div>
            <div>
              <Text strong>{'活跃用户组'}：</Text>
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
            `${'第'} ${range[0]}-${range[1]} ${'条，共'} ${total} ${'条'}`,
          onChange: (page) => setPage(page),
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p>{'暂无用户组'}</p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenCreateGroupDialog(true)}
                  >
                    {'创建第一个用户组'}
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
