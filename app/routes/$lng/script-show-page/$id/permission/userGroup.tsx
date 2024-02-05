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
  DeleteGroupUser,
  DeleteScriptGroup,
  GetGroupMemberList,
  GetScriptGroupList,
  GroupMember,
} from '~/services/scripts/api';
import { Link } from '@remix-run/react';
import { ScriptGroup } from '~/services/scripts/types';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { InviteModal } from './inviteModal';
import { UserModal } from './userModal';
import { timestampToDateObj } from '~/utils/utils';
export const ManageModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID: number;
}> = ({ status, onChange, id, groupID }) => {
  const [listLoading, setListLoading] = useState(false);
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const [openUserDialog, setopenUserDialog] = useState(false);

  const handleCancel = () => {
    onChange(false);
  };
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<Array<GroupMember>>([]);
  const [page, setPage] = useState(1);
  const getPageData = () => {
    setListLoading(true);
    GetGroupMemberList(id, groupID, page)
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
    getPageData();
  }, [page]);
  const locale = '/' + useLocale();
  const [deleteLoading, setDeleteLoading] = useState(false);
  return (
    <Modal
      title={t('manange_user_group')}
      open={status}
      onCancel={handleCancel}
      footer={[
        <Button key="back" type="primary" onClick={handleCancel}>
          {t('disable')}
        </Button>,
      ]}
    >
      <div className="mt-[20px]">
        <div className="flex justify-end items-center mb-2">
          <Button type="primary" onClick={() => setopenUserDialog(true)}>
            {t('add_user')}
          </Button>
        </div>
        <List
          loading={listLoading}
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
                  {/* <div>{script.updatetime}</div> */}
                </div>
              </div>
              <div className="flex items-center">
                {script.invite_status === 3 ? (
                  <div className="text-red-400 mr-5">{t('wait_confirm')}</div>
                ) : (
                  <></>
                )}

                <div>
                  {script.expiretime !== 0
                    ? t('format_date', timestampToDateObj(script.expiretime)) +
                      t('expire')
                    : t('no_expire')}
                </div>

                <Button
                  loading={deleteLoading}
                  type="link"
                  onClick={async () => {
                    modal.confirm({
                      title: t('confirm_delete'),
                      content: t('delete_confirm'),
                      icon: <ExclamationCircleOutlined />,
                      okText: t('confirm'),
                      cancelText: t('cancel'),
                      onOk: async () => {
                        setDeleteLoading(true);
                        const result = await DeleteGroupUser(
                          id,
                          groupID,
                          script.id
                        );
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
                  danger
                >
                  {t('delete')}
                </Button>
              </div>
            </div>
          )}
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
        ></List>
        {openUserDialog && (
          <UserModal
            status={openUserDialog}
            groupID={groupID}
            hideGroup={true}
            onChange={(status) => {
              if (status === false) {
                getPageData();
              }
              setopenUserDialog(status);
            }}
            id={id}
          ></UserModal>
        )}
      </div>
      {contextHolder}
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
        <Form.Item
          rules={[{ required: true, message: t('please_input_content') }]}
          label={t('group_description')}
          name="description"
        >
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
  const [manageGroupID, setManageGroupID] = useState(0);
  const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState(false);
  const [list, setList] = useState<ScriptGroup[]>([]);
  const [page, setPage] = useState(1);
  const [modal, contextHolder] = Modal.useModal();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const getPageData = () => {
    setListLoading(true);
    GetScriptGroupList(id, page)
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
    getPageData();
  }, [page]);
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
            loading={listLoading}
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
                    {script.member.length >= 1 ? (
                      <Avatar src={script.member[0].avatar} />
                    ) : (
                      <></>
                    )}
                    {script.member.length >= 2 ? (
                      <Avatar src={script.member[1].avatar} />
                    ) : (
                      <></>
                    )}
                  </Avatar.Group>
                  <Button
                    onClick={() => {
                      setOpenManageDialog(true);
                      setManageGroupID(script.id);
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
          ></List>
        </ConfigProvider>
      </div>
      {openManageDialog && (
        <ManageModal
          status={openManageDialog}
          id={id}
          groupID={manageGroupID}
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
            getPageData();
          }}
          id={id}
        />
      )}
      {contextHolder}
    </div>
  );
};
