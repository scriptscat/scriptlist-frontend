import { Button, Table, Modal, message } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslations } from 'next-intl';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { InviteModal } from '@/components/ScriptInvite/InviteModal';
import { useInviteList } from '@/lib/api/hooks';
import type { InviteListItem } from '@/app/[locale]/script-show-page/[id]/types';

interface DataType extends InviteListItem {
  key: string;
}

interface InvitePageProps {
  id: number;
  groupID?: number;
}

export const InvitePage: React.FC<InvitePageProps> = ({ id, groupID }) => {
  const t = useTranslations('script.invite');
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [allowLoading, setAllowLoading] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ field: string; order: string }>({
    field: '',
    order: '',
  });

  const { data, isLoading, mutate } = useInviteList(id, page, groupID, sort);

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
      message.success(t('copy_success'));
    } else {
      message.warning(t('copy_failed'));
    }
  };

  const formatExpireTime = (expiretime: number) => {
    if (expiretime === 0) {
      return t('never_expire');
    }
    const date = new Date(expiretime * 1000);
    return date.toLocaleString('zh-CN') + t('expire_suffix');
  };

  const getStatusText = (
    invite_status: number,
    record: any,
  ): string | ReactElement => {
    switch (invite_status) {
      case 1:
        return t('status_unused');
      case 2:
        return (
          <>
            <a
              className="text-sm text-blue-500"
              href={`/users/${record.used}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`[${record.username}]`}
            </a>
            <span>{t('status_used')}</span>
          </>
        );
      case 3:
        return t('status_expired');
      case 4:
        return (
          <>
            <a
              className="text-sm text-blue-500"
              href={`/users/${record.used}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`[${record.username}]`}
            </a>
            <span>{t('status_pending_review')}</span>
          </>
        );
      case 5:
        return t('status_rejected');
      default:
        return t('status_unknown');
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
      title: t('invite_code'),
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
      title: t('expire_time'),
      dataIndex: 'expiretime',
      key: 'expiretime',
      align: 'center',
      sorter: true,
      render: (expiretime) => formatExpireTime(expiretime),
    },
    {
      title: t('status'),
      dataIndex: 'invite_status',
      key: 'invite_status',
      align: 'center',
      sorter: true,
      render: (invite_status, record) => getStatusText(invite_status, record),
    },
    {
      title: t('action'),
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      render: (_text, record, _index) => (
        <>
          {record.invite_status === 4 && (
            <Button
              loading={allowLoading}
              onClick={async () => {
                modal.confirm({
                  title: t('invite_confirmation'),
                  content: t('confirm_allow_invite'),
                  icon: <ExclamationCircleOutlined />,
                  maskClosable: true,
                  okText: t('confirm'),
                  cancelText: t('cancel'),
                  onOk: async () => {
                    setAllowLoading(true);
                    const result = await scriptAccessService.allowInviteCode(
                      id,
                      record.id,
                      1,
                    );
                    setAllowLoading(false);
                    if (result.code === 0) {
                      message.success(t('operation_success'));
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
              {t('allow')}
            </Button>
          )}
          <Button
            onClick={async () => {
              modal.confirm({
                title: t('confirm_delete'),
                content: t('confirm_delete_invite'),
                icon: <ExclamationCircleOutlined />,
                okText: t('confirm'),
                cancelText: t('cancel'),
                maskClosable: true,
                onOk: async () => {
                  setDeleteLoading(true);
                  try {
                    await scriptAccessService.deleteInvite(id, record.id);
                    setDeleteLoading(false);
                    message.success(t('delete_success'));
                    mutate();
                  } catch (error: any) {
                    setDeleteLoading(false);
                    message.error(error.message || t('delete_failed'));
                  }
                },
              });
            }}
            loading={deleteLoading}
            size="small"
            type="link"
            danger
          >
            {t('delete')}
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button type="primary" onClick={() => setOpenInviteModal(true)}>
          {t('create_invite_code')}
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
