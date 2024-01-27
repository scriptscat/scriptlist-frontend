import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { Button, DatePicker, Form, Modal, Select, Table, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import {
  CreateAccessGroup,
  CreateAccessUser,
  CreateGroupUser,
  DeleteInvite,
  GetGroupAndUserList,
  GetInviteList,
} from '~/services/scripts/api';

import { DebounceSelect } from '~/components/DebounceSelect';
import { CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';

import { InviteModal } from './inviteModal';
import { timestampToDateObj } from '~/utils/utils';
import ClipboardJS from 'clipboard';
interface User {
  label: React.ReactNode;
  value: string | number;
}
async function getSearchUserList(
  id: number,
  username: string,
  filterGroup: boolean
): Promise<User[]> {
  return GetGroupAndUserList(id, username, filterGroup);
}

export const InvitePage: React.FC<{ id: number; groupID?: number }> = ({
  id,
  groupID,
}) => {
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { t } = useTranslation();
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const copyInviteLink = () => {};
  interface DataType {
    id: string;
    key: string;
    expiretime: number;
    code: string;
    invite_status: number;
  }
  const [list, setList] = useState<Array<any>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const getPageData = () => {
    setListLoading(true);
    GetInviteList(id, page, groupID)
      .then((res) => {
        if (res.code === 0) {
          setList(res.data.list);
          setTotal(res.data.total);
        }
      })
      .finally(() => {
        setListLoading(false);
      });
  };
  useEffect(() => {
    if (openInviteModal === false) {
      getPageData();
    }
  }, [page, openInviteModal]);
  let clipboard: ClipboardJS | undefined = undefined;
  useEffect(() => {
    clipboard = new ClipboardJS('.copy-text');
    clipboard.on('success', function (e: any) {
      message.success(t('copy_success'));
    });
    clipboard.on('error', function (e: any) {
      message.warning(t('copy_fail'));
    });

    return () => {
      clipboard?.destroy && clipboard.destroy();
    };
  }, []);

  const inviteColumns: ColumnsType<DataType> = [
    {
      title: t('invite_code'),
      dataIndex: 'code',
      key: 'code',
      align: 'center',
      render: (text) => (
        <span
          onClick={copyInviteLink}
          className="cursor-pointer  hover:!text-[#3388FF] flex copy-text"
        >
          {text}
          <CopyOutlined className="pl-1 !text-[#3388FF]" />
        </span>
      ),
    },
    {
      title: t('expiry_date'),
      dataIndex: 'expiretime',
      key: 'expiretime',
      align: 'center',
      render: (expiretime) => (
        <span>
          {expiretime !== 0
            ? t('format_date', timestampToDateObj(expiretime)) + t('expire')
            : t('no_expire')}
        </span>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'invite_status',
      key: 'invite_status',
      align: 'center',
      render: (invite_status) => {
        let status_text = '';
        if (invite_status === 1) {
          status_text = t('un_used');
        }
        if (invite_status === 2) {
          status_text = t('used');
        }
        if (invite_status === 3) {
          status_text = t('expired');
        }
        if (invite_status === 4) {
          status_text = t('wait_pending');
        }
        if (invite_status === 5) {
          status_text = t('rejected');
        }
        return <span>{status_text}</span>;
      },
    },
    {
      title: t('action'),
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      render: (text, record, index) => (
        <>
          {record.invite_status === 4 ? (
            <Button size="small" type="link">
              {t('allow')}
            </Button>
          ) : (
            <></>
          )}
          <Button
            onClick={async () => {
              modal.confirm({
                title: t('confirm_delete'),
                content: t('delete_confirm'),
                icon: <ExclamationCircleOutlined />,
                okText: t('confirm'),
                cancelText: t('cancel'),
                onOk: async () => {
                  setDeleteLoading(true);
                  const result = await DeleteInvite(id, record.id);
                  setDeleteLoading(false);
                  if (result.code == 0) {
                    message.success(t('delete_success'));
                    getPageData();
                  } else {
                    message.error(result.msg);
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
      <div className="flex justify-end">
        <Button type="primary" onClick={() => setOpenInviteModal(true)}>
          {t('create_invite_code')}
        </Button>
      </div>
      <div>
        <Table
          rowKey="id"
          loading={listLoading}
          columns={inviteColumns}
          dataSource={list}
          pagination={{
            onChange: (page) => {
              setPage(page);
            },
            showSizeChanger: false,
            hideOnSinglePage: true,
            defaultCurrent: page,
            current: page,
            pageSize: 20,
            total: total,
          }}
        />
      </div>
      {openInviteModal && (
        <InviteModal
          groupID={groupID}
          id={id}
          status={openInviteModal}
          onChange={(status) => setOpenInviteModal(status)}
        ></InviteModal>
      )}
      {contextHolder}
    </div>
  );
};

export const UserModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID?: number;
}> = ({ status, onChange, id, groupID }) => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState('user');

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        debugger;
        const arr = values.user[0].split('-');
        const type = arr[0];
        const targetId = arr[1];
        const role = values.role;
        const time =
          values.time === undefined || values.time === null
            ? 0
            : values.time.unix();
        let promise = undefined;
        if (type === 'user') {
          promise =
            groupID === undefined
              ? CreateAccessUser(id, {
                  expiretime: time,
                  role: role,
                  user_id: parseInt(targetId),
                })
              : CreateGroupUser(id, groupID, {
                  expiretime: time,
                  user_id: parseInt(targetId),
                });
        } else {
          promise = CreateAccessGroup(id, {
            expiretime: time,
            role: role,
            group_id: parseInt(targetId),
          });
        }
        promise.then((resp) => {
          if (resp.code == 0) {
            message.success(t('submit_success'));
            handleCancel();
          } else {
            message.error(resp.msg);
          }
        });
      })
      .catch((err) => {});
  };
  const handleCancel = () => {
    onChange(false);
  };
  const [form] = Form.useForm();

  const items: TabsProps['items'] = [
    {
      key: 'user',
      label: t('invite_by_username'),
      children: (
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={form}
            initialValues={{ role: 'guest' }}
          >
            <Form.Item
              label={t('username')}
              name="user"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                {
                  type: 'array',
                  required: true,
                  len: 1,
                  message: t('un_select_user'),
                },
              ]}
            >
              <DebounceSelect
                maxCount={1}
                mode="multiple"
                fetchOptions={(username) => {
                  return getSearchUserList(id, username, groupID !== undefined);
                }}
              ></DebounceSelect>
            </Form.Item>
            {groupID === undefined ? (
              <Form.Item label={t('grant_permission')} name="role">
                <Select
                  options={[
                    { value: 'guest', label: t('visitor') },
                    { value: 'manager', label: t('admin') },
                  ]}
                />
              </Form.Item>
            ) : (
              <></>
            )}
            <Form.Item label={t('expire_time')} name="time">
              <DatePicker
                className="w-full"
                placeholder={t('please_select_date')}
              />
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'code',
      label: t('invite_by_code'),
      children: <InvitePage id={id} groupID={groupID} />,
    },
  ];
  return (
    <Modal
      title={t('please_select_user_or_group')}
      open={status}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelText={t('cancel')}
      okText={t('add')}
      width={700}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          {activeKey === 'user' ? <CancelBtn /> : <></>}
          {activeKey === 'user' ? <OkBtn /> : <></>}
        </>
      )}
    >
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        items={items}
      />
    </Modal>
  );
};
