import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  ConfigProvider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Select,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useLocale } from 'remix-i18next';
import {
  CreateGroup,
  DeleteScriptGroup,
  GetScriptGroupList,
} from '~/services/scripts/api';
import { Link } from '@remix-run/react';
import { ScriptGroup } from '~/services/scripts/types';
import { ExclamationCircleOutlined } from '@ant-design/icons';
export const ManageModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
}> = ({ status, onChange }) => {
  const { t } = useTranslation();
  const handleOk = () => {};
  const handleCancel = () => {
    onChange(false);
  };
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([
    {
      avatar: 'string',
      content: 'string',
      createtime: 0,
      id: 0,
      is_admin: 0,
      issue_id: 0,
      status: 0,
      type: 1,
      updatetime: 0,
      user_id: 0,
      username: 'string',
    },
  ]);
  const [page, setPage] = useState(1);
  const locale = '/' + useLocale();
  return (
    <Modal
      title={t('manange_user_group')}
      open={status}
      onCancel={handleCancel}
      footer={[
        <Button type="primary" onClick={handleCancel}>
          {t('disable')}
        </Button>,
      ]}
    >
      <div className="mt-[20px]">
        <div className="flex justify-end items-center mb-2">
          <Button type="primary">{t('add_user')}</Button>
        </div>
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
      </div>
    </Modal>
  );
};
export const CreateGroupModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
}> = ({ status, onChange, id }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const handleCancel = () => {
    onChange(false);
  };
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        CreateGroup(id, {
          name: values.name,
          description: values.description,
        }).then((resp) => {
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
  return (
    <Modal
      title={t('manange_user_group')}
      open={status}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelText={t('cancel')}
      okText={t('create')}
    >
      <Form
        className="!mt-8"
        labelCol={{ span: 4 }}
        layout="horizontal"
        form={form}
        initialValues={{ layout: 'horizontal' }}
      >
        <Form.Item
          rules={[{ required: true, message: t('please_input_content') }]}
          label={t('group_name')}
          name="name"
        >
          <Input />
        </Form.Item>
        <Form.Item label={t('group_description')} name="description">
          <Input.TextArea rows={6} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export const UserGroup: React.FC<{ id: number }> = ({ id }) => {
  const { t } = useTranslation();
  const [total, setTotal] = useState(0);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState(false);
  const [list, setList] = useState<ScriptGroup[]>([]);
  const [page, setPage] = useState(1);
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const getPageData = () => {
    GetScriptGroupList(id, page).then((res) => {
      if (res.code === 0) {
        setList(res.data.list);
        setTotal(res.data.total);
      }
    });
  };
  useEffect(() => {
    getPageData();
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg">{t('user_group_manage')}</span>
        <Button
          onClick={() => setOpenCreateGroupDialog(true)}
          type="primary"
          className="min-w-[100px]"
        >
          {t('add_group')}
        </Button>
      </div>
      <div>
        <ConfigProvider
          renderEmpty={() => <Empty description={t('no_user_group')} />}
        >
          <List
            dataSource={list}
            renderItem={(script, index) => (
              <div className="mb-3 flex">
                <div className="flex grow">{script.name}</div>
                <div className="flex items-center">
                  <Avatar.Group
                    className="mr-3"
                    maxCount={2}
                    maxPopoverTrigger="click"
                    maxStyle={{
                      display: 'none',
                    }}
                  >
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
                  </Avatar.Group>
                  <Button
                    onClick={() => {
                      setOpenManageDialog(true);
                    }}
                    type="link"
                  >
                    {t('manage')}
                  </Button>
                  <Button
                    type="link"
                    danger
                    loading={deleteLoading}
                    onClick={async () => {
                      modal.confirm({
                        title: t('confirm_delete'),
                        content: t('delete_confirm'),
                        icon: <ExclamationCircleOutlined />,
                        okText: t('confirm'),
                        cancelText: t('cancel'),
                        onOk: async () => {
                          setDeleteLoading(true);
                          const result = await DeleteScriptGroup(id, script.id);
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
                  >
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
      {openManageDialog && (
        <ManageModal
          status={openManageDialog}
          onChange={(status) => {
            setOpenManageDialog(status);
          }}
        ></ManageModal>
      )}
      {openCreateGroupDialog && (
        <CreateGroupModal
          status={openCreateGroupDialog}
          onChange={(status) => {
            setOpenCreateGroupDialog(status);
          }}
          id={id}
        />
      )}
      {contextHolder}
    </div>
  );
};
