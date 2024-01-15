import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { Button, DatePicker, Form, Modal, Select, Table, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import {
  CreateAccessGroup,
  CreateAccessUser,
  DeleteInvite,
  GetGroupAndUserList,
  GetInviteList,
} from '~/services/scripts/api';

import { DebounceSelect } from '~/components/DebounceSelect';
import { CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';

import { InviteModal } from './inviteModal';
interface User {
  label: React.ReactNode;
  value: string | number;
}
async function getSearchUserList(
  id: number,
  username: string
): Promise<User[]> {
  return GetGroupAndUserList(id, username);
}

export const InvitePage: React.FC<{ id: number }> = ({ id }) => {
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { t } = useTranslation();
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const copyInviteLink = () => {};
  interface DataType {
    key: string;
    invite_code: string;
    expiry_date: string;
    status: number;
  }
  const [list, setList] = useState<Array<any>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const getPageData = () => {
    GetInviteList(id, 1, page).then((res) => {
      if (res.code === 0) {
        setList(res.data.list);
        setTotal(res.data.total);
      }
    });
  };
  useEffect(() => {
    getPageData();
  }, []);
  const inviteColumns: ColumnsType<DataType> = [
    {
      title: t('invite_code'),
      dataIndex: 'invite_code',
      key: 'invite_code',
      align: 'center',
      render: (text) => (
        <span
          onClick={copyInviteLink}
          className="cursor-pointer  hover:!text-[#3388FF]"
        >
          {text}
          <CopyOutlined className="pl-1 !text-[#3388FF]" />
        </span>
      ),
    },
    {
      title: t('expiry_date'),
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      align: 'center',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
    },
    {
      title: t('action'),
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      render: (text, record, index) => (
        <>
          <Button size="small" type="link">
            {t('allow')}
          </Button>
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
                  const result = await DeleteInvite(id, record.invite_code);
                  setDeleteLoading(false);
                  if (result.code == 0) {
                    message.success(t('delete_success'));
                    //  getPageData();
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
        <Table columns={inviteColumns} dataSource={list} />
      </div>
      {openInviteModal && (
        <InviteModal
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
}> = ({ status, onChange, id }) => {
  const { t } = useTranslation();

  const handleOk = () => {
    form.validateFields().then((values) => {
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
        promise = CreateAccessUser(id, {
          expiretime: time,
          role: role,
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
    }).catch((err)=>{
      
    })
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
                  return getSearchUserList(id, username);
                }}
              ></DebounceSelect>
            </Form.Item>
            <Form.Item label={t('grant_permission')} name="role">
              <Select
                options={[
                  { value: 'guest', label: t('visitor') },
                  { value: 'manager', label: t('admin') },
                ]}
              />
            </Form.Item>
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
      children: <InvitePage id={id} />,
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
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Modal>
  );
};
