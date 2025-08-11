import { Button, Table, Modal, message } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { ReactElement, useState } from 'react';
import { CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { InviteModal } from '@/components/InviteModal';
import { useInviteList } from '@/lib/api/hooks';
import { InviteListItem } from '@/app/[locale]/script-show-page/[id]/types';

interface DataType extends InviteListItem {
  key: string;
}

interface InvitePageProps {
  id: number;
  groupID?: number;
}

export const InvitePage: React.FC<InvitePageProps> = ({ id, groupID }) => {
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [allowLoading, setAllowLoading] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ field: string; order: string }>({
    field: '',
    order: '',
  });

  const { data, error, isLoading, mutate } = useInviteList(
    id,
    page,
    groupID,
    sort,
  );

  // 转换数据格式以添加key属性
  const tableData: DataType[] =
    data?.list?.map((item) => ({
      ...item,
      key: item.id.toString(),
    })) || [];

  // 处理邀请模态框关闭后刷新数据
  const handleInviteModalChange = (status: boolean) => {
    setOpenInviteModal(status);
    if (!status) {
      // 模态框关闭时刷新数据
      mutate();
    }
  };

  // 复制成功回调
  const onCopySuccess = (text: string, result: boolean) => {
    if (result) {
      message.success('复制成功');
    } else {
      message.warning('复制失败');
    }
  };

  const formatExpireTime = (expiretime: number) => {
    if (expiretime === 0) {
      return '永不过期';
    }
    const date = new Date(expiretime * 1000);
    return date.toLocaleString('zh-CN') + ' 过期';
  };

  const getStatusText = (
    invite_status: number,
    record: any,
  ): string | ReactElement => {
    switch (invite_status) {
      case 1:
        return '未使用';
      case 2:
        return (
          <>
            <a
              className="text-sm text-blue-500"
              href={`/users/${record.used}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              [{record.username}]
            </a>
            <span>已使用</span>
          </>
        );
      case 3:
        return '已过期';
      case 4:
        return (
          <>
            <a
              className="text-sm text-blue-500"
              href={`/users/${record.used}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              [{record.username}]
            </a>
            <span>待审核</span>
          </>
        );
      case 5:
        return '已拒绝';
      default:
        return '未知状态';
    }
  };

  const handleTableChange: TableProps<DataType>['onChange'] = (
    pagination,
    filters,
    sorter,
  ) => {
    const sorterItem = sorter as any;
    const field = sorterItem.field as string;
    const order = sorterItem.order as string;
    setSort({
      field,
      order,
    });
  };

  const inviteColumns: ColumnsType<DataType> = [
    {
      title: '邀请码',
      dataIndex: 'code',
      key: 'code',
      align: 'center',
      render: (text) => {
        const inviteBaseURL = window.location.origin + '/scripts/invite?code=';
        const fullLink = inviteBaseURL + text;

        return (
          <CopyToClipboard text={fullLink} onCopy={onCopySuccess}>
            <span className="cursor-pointer hover:!text-[#3388FF] flex items-center justify-center">
              {text}
              <CopyOutlined className="pl-1 !text-[#3388FF]" />
            </span>
          </CopyToClipboard>
        );
      },
    },
    {
      title: '过期时间',
      dataIndex: 'expiretime',
      key: 'expiretime',
      align: 'center',
      sorter: true,
      render: (expiretime) => formatExpireTime(expiretime),
    },
    {
      title: '状态',
      dataIndex: 'invite_status',
      key: 'invite_status',
      align: 'center',
      sorter: true,
      render: (invite_status, record) => getStatusText(invite_status, record),
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      render: (text, record, index) => (
        <>
          {record.invite_status === 4 && (
            <Button
              loading={allowLoading}
              onClick={async () => {
                modal.confirm({
                  title: '邀请码确认',
                  content: '确认允许此邀请？',
                  icon: <ExclamationCircleOutlined />,
                  maskClosable: true,
                  okText: '确认',
                  cancelText: '取消',
                  onOk: async () => {
                    setAllowLoading(true);
                    const result = await scriptAccessService.allowInviteCode(
                      id,
                      record.id,
                      1,
                    );
                    setAllowLoading(false);
                    if (result.code === 0) {
                      message.success('操作成功');
                      mutate();
                    } else {
                      message.error(result.msg);
                    }
                  },
                });
              }}
              size="small"
              type="link"
            >
              允许
            </Button>
          )}
          <Button
            onClick={async () => {
              modal.confirm({
                title: '确认删除',
                content: '确定要删除此邀请码吗？',
                icon: <ExclamationCircleOutlined />,
                okText: '确认',
                cancelText: '取消',
                maskClosable: true,
                onOk: async () => {
                  setDeleteLoading(true);
                  try {
                    await scriptAccessService.deleteInvite(id, record.id);
                    setDeleteLoading(false);
                    message.success('删除成功');
                    mutate();
                  } catch (error) {
                    setDeleteLoading(false);
                    message.error('删除失败，请稍后重试');
                  }
                },
              });
            }}
            loading={deleteLoading}
            size="small"
            type="link"
            danger
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button type="primary" onClick={() => setOpenInviteModal(true)}>
          创建邀请码
        </Button>
      </div>

      <Table<DataType>
        showSorterTooltip={false}
        rowKey="id"
        loading={isLoading}
        columns={inviteColumns}
        dataSource={tableData}
        pagination={{
          onChange: (page) => {
            setPage(page);
          },
          showSizeChanger: false,
          hideOnSinglePage: true,
          defaultCurrent: page,
          current: page,
          pageSize: 20,
          total: data?.total || 0,
        }}
        onChange={handleTableChange}
      />

      {openInviteModal && (
        <InviteModal
          groupID={groupID}
          id={id}
          status={openInviteModal}
          onChange={handleInviteModalChange}
        />
      )}

      {contextHolder}
    </div>
  );
};
