import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  ConfigProvider,
  Empty,
  List,
  Modal,
  Select,
} from 'antd';
import { useEffect, useState } from 'react';
import {
  DeleteAccess,
  GetAccessRoleList,
  UpdateAccessRole,
} from '~/services/scripts/api';
import { Link } from '@remix-run/react';
import { useLocale } from 'remix-i18next';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { timestampToDateObj } from '~/utils/utils';
import { UserModal } from './userModal';

export const AccessRole: React.FC<{ id: number }> = ({ id }) => {
  const { t } = useTranslation();
  const [openUserDialog, setopenUserDialog] = useState(false);
  const [total, setTotal] = useState(0);
  const [modal, contextHolder] = Modal.useModal();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const locale = '/' + useLocale();
  const [list, setList] = useState<Array<any>>([]);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const getPageData = () => {
    setListLoading(true);
    GetAccessRoleList(id, page)
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
            loading={listLoading}
            dataSource={list}
            renderItem={(script, index) => (
              <div className="mb-3 flex">
                <div className="flex grow">
                  <Avatar className="!mr-3" size="large" src={script.avatar}>
                    {script.avatar === '' && script.name?.length > 1
                      ? script.name[0]
                      : ''}
                  </Avatar>
                  <div>
                    <Link
                      className="text-sm"
                      to={locale + '/users/' + script.link_id}
                      target="_blank"
                    >
                      {script.name || script.username}
                    </Link>
                    <div>{script.updatetime}</div>
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
                      ? t(
                          'format_date',
                          timestampToDateObj(script.expiretime)
                        ) + t('expire')
                      : t('no_expire')}
                  </div>
                  <Select
                    className="min-w-[110px] !mx-2"
                    value={script.role}
                    onChange={async (roleName: 'visitor' | 'admin') => {
                      const result = await UpdateAccessRole(id, script.id, {
                        expiretime: script.expiretime,
                        role: roleName,
                      });
                      if (result.code == 0) {
                        setList([
                          ...list.map((listItem) => {
                            if (listItem.id !== script.id) {
                              return {
                                ...listItem,
                              };
                            } else {
                              return {
                                ...listItem,
                                role: roleName,
                              };
                            }
                          }),
                        ]);
                        message.success(t('update_success'));
                      } else {
                        message.error(result.msg);
                      }
                    }}
                    options={[
                      { value: 'guest', label: t('visitor') },
                      { value: 'manager', label: t('admin') },
                    ]}
                  />
                  <Button
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
                          const result = await DeleteAccess(id, script.id);
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
                    type="link"
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
        </ConfigProvider>
      </div>
      {openUserDialog && (
        <UserModal
          status={openUserDialog}
          onChange={(status) => {
            if (status === false) {
              getPageData();
            }
            setopenUserDialog(status);
          }}
          id={id}
        ></UserModal>
      )}
      {contextHolder}
    </div>
  );
};
