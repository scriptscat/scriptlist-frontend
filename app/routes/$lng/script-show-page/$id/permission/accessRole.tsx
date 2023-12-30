import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import {
  Avatar,
  Button,
  ConfigProvider,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Switch,
  Table,
  Tabs,
} from 'antd';
import type { TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import { GetAccessRoleList } from '~/services/scripts/api';
import { Link } from '@remix-run/react';
import { useLocale } from 'remix-i18next';
import { DebounceSelect } from '~/components/DebounceSelect';
import { CheckCircleTwoTone, CopyOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
interface User {
  label: React.ReactNode;
  value: string | number;
}
async function getSearchUserList(username: string): Promise<User[]> {
  return fetch('https://randomuser.me/api/?results=5')
    .then((response) => response.json())
    .then((body) =>
      body.results.map(
        (user: {
          name: { first: string; last: string };
          login: { username: string };
        }) => ({
          label: `${user.name.first} ${user.name.last}`,
          value: user.login.username,
        })
      )
    );
}

export const InviteModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
}> = ({ status, onChange }) => {
  const { t } = useTranslation();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const handleOk = () => {
    setOpenSuccessModal(true);
  };
  const [inviteText, setInviteText] = useState(
    '11111\n22222\n11111\n22222\n11111\n22222\n11111\n22222\n11111\n22222\n'
  );
  const handleCancel = () => {
    onChange(false);
  };
  const [form] = Form.useForm();

  return (
    <>
      <Modal
        title={t('create_invite_code')}
        open={status}
        onOk={handleOk}
        onCancel={handleCancel}
        cancelText={t('cancel')}
        okText={t('create')}
      >
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={form}
            
            initialValues={{ layout: 'horizontal' }}
          >
            <Form.Item label={t('create_number')} name="create_number">
              <InputNumber
                className="!w-full"
                min={1}
                precision={0}
                defaultValue={1}
              />
            </Form.Item>
            <Form.Item label={t('expiry_date')} name="expiry_date">
              <Select
                defaultValue=""
                options={[
                  { value: '1', label: 1 + t('days') },
                  { value: '3', label: 3 + t('days') },
                  { value: '7', label: 7 + t('days') },
                  { value: '15', label: 15 + t('days') },
                  { value: 'no_limit', label: t('no_limit') },
                ]}
              />
            </Form.Item>
            <Form.Item
              label={t('administrator_review')}
              name="administrator_review"
            >
              <Switch></Switch>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title={
          <div className="flex items-center">
            <CheckCircleTwoTone className="mr-1" twoToneColor="#52c41a" />
            <span>{t('create_success')}</span>
          </div>
        }
        onCancel={() => setOpenSuccessModal(false)}
        style={{ top: 10 }}
        open={openSuccessModal}
        footer={[
          <Button type="primary" onClick={() => setOpenSuccessModal(false)}>
            {t('enter')}  
          </Button>,
        ]}
      >
        <div>
          <div className='mb-3'>{t('create_invite_list_as_follows')}:</div>
          <TextArea
            value={inviteText}
            onChange={(e) => setInviteText(e.target.value)}
            autoSize={{ minRows: 5, maxRows: 10 }}
          />
        </div>
      </Modal>
    </>
  );
};

export const UserModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
}> = ({ status, onChange }) => {
  const { t } = useTranslation();
  const handleOk = () => {};
  const handleCancel = () => {
    onChange(false);
  };
  const [form] = Form.useForm();
  const [openInviteModal, setOpenInviteModal] = useState(false);
  interface DataType {
    key: string;
    invite_code: string;
    expiry_date: string;
    status: number;
  }
  const data: DataType[] = [
    {
      key: '1',
      invite_code: '851100',
      expiry_date: '2023年7月4日',
      status: 0,
    },
  ];
  const copyInviteLink = () => {};
  const columns: ColumnsType<DataType> = [
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
      render: () => (
        <>
          <Button size="small" type="link">
            {t('allow')}
          </Button>
          <Button size="small" type="link" danger>
            {t('delete')}
          </Button>
        </>
      ),
    },
  ];
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
            initialValues={{ layout: 'horizontal' }}
          >
            <Form.Item label={t('username')} name="user">
              <DebounceSelect
                maxCount={1}
                mode="multiple"
                fetchOptions={getSearchUserList}
              ></DebounceSelect>
            </Form.Item>
            <Form.Item label={t('grant_permission')} name="role">
              <Select
                defaultValue="read"
                options={[
                  { value: 'read', label: '可读' },
                  { value: 'write', label: '可写' },
                  { value: 'admin', label: '管理员' },
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
      children: (
        <div>
          <div className="flex justify-end">
            <Button type="primary" onClick={() => setOpenInviteModal(true)}>
              {t('create_invite_code')}
            </Button>
            ,
          </div>
          <div>
            <Table columns={columns} dataSource={data} />
          </div>
          {openInviteModal && (
            <InviteModal
              status={openInviteModal}
              onChange={(status) => setOpenInviteModal(status)}
            ></InviteModal>
          )}
        </div>
      ),
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
export const AccessRole: React.FC<{ id: number }> = ({ id }) => {
  const { t } = useTranslation();
  const [openUserDialog, setopenUserDialog] = useState(false);
  const [total, setTotal] = useState(0);
  const locale = '/' + useLocale();
  const [list, setList] = useState([
    {
      avatar: '/api/v2/users/2/avatar',
      content: 'string',
      createtime: 0,
      id: 0,
      is_admin: 0,
      issue_id: 0,
      status: 0,
      type: 1,
      updatetime: '一个月前',
      user_id: 0,
      username: '用户名',
    },
  ]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    GetAccessRoleList(id, 1).then((res) => {
      console.log('res', res);
    });
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg">{t('access_role_manage')}</span>
        <Button
          onClick={() => setopenUserDialog(true)}
          type="primary"
          className="min-w-[100px]"
        >
          {t('add_user')}
        </Button>
      </div>
      <div>
        <ConfigProvider
          renderEmpty={() => <Empty description={t('no_access_role')} />}
        >
          <List
            dataSource={list}
            renderItem={(script, index) => (
              <div className="mb-3 flex">
                <div className="flex grow">
                  <Avatar
                    className="!mr-3"
                    size="large"
                    src={script.avatar}
                  ></Avatar>
                  <div>
                    <Link
                      className="text-sm"
                      to={locale + '/users/' + script.user_id}
                      target="_blank"
                    >
                      {script.username}
                    </Link>
                    <div>{script.updatetime}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-red-400 mr-5">待确认</div>
                  <div>2023年01月02日到期</div>
                  <Select
                    className="min-w-[110px] !mx-2"
                    defaultValue="lucy"
                    options={[
                      { value: 'red', label: '可读' },
                      { value: 'write', label: '可写' },
                      { value: 'admin', label: '管理员' },
                    ]}
                  />
                  <Button type="link" danger>
                    {t('delete')}
                  </Button>
                </div>
              </div>
            )}
            pagination={{
              showSizeChanger: false,
              hideOnSinglePage: true,
              defaultCurrent: page,
              current: page,
              pageSize: 20,
              total: total,
            }}
          ></List>
        </ConfigProvider>
      </div>
      {openUserDialog && (
        <UserModal
          status={openUserDialog}
          onChange={(status) => {
            setopenUserDialog(status);
          }}
        ></UserModal>
      )}
    </div>
  );
};
