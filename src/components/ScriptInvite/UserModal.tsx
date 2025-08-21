import { Modal, Form, Select, DatePicker, message, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DebounceSelect } from '@/components/DebounceSelect';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { GetUserList } from '@/lib/api/services/user';
import { InvitePage } from '@/components/ScriptInvite/InvitePage';

interface UserModalProps {
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID?: number;
  hideUser?: boolean;
  hideGroup?: boolean;
  hideInvite?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  status,
  onChange,
  id,
  groupID,
  hideUser = false,
  hideGroup = false,
  hideInvite = false,
}) => {
  const t = useTranslations('script.user_modal');
  const [activeKey, setActiveKey] = useState('user');
  const [userForm] = Form.useForm();
  const [groupForm] = Form.useForm();

  const handleOk = () => {
    const form = activeKey === 'user' ? userForm : groupForm;
    form
      .validateFields()
      .then((values) => {
        const type = activeKey;
        const targetId = values.user[0];
        const role = values.role;
        const time =
          values.time === undefined || values.time === null
            ? 0
            : values.time.unix();

        let promise = undefined;
        if (type === 'user') {
          promise =
            groupID === undefined
              ? scriptAccessService.createAccessUser(id, {
                  expiretime: time,
                  role: role,
                  user_id: parseInt(targetId),
                })
              : scriptAccessService.createGroupUser(id, groupID, {
                  expiretime: time,
                  user_id: parseInt(targetId),
                });
        } else {
          promise = scriptAccessService.createAccessGroup(id, {
            expiretime: time,
            role: role,
            group_id: parseInt(targetId),
          });
        }

        promise
          .then((_resp: any) => {
            message.success(t('submit_success'));
            handleCancel();
          })
          .catch((error) => {
            console.error(t('submit_failed'), error);
            message.error(error.message || t('submit_failed'));
          });
      })
      .catch((err) => {
        console.error(t('form_validation_failed'), err);
      });
  };

  const handleCancel = () => {
    userForm.resetFields();
    groupForm.resetFields();
    onChange(false);
  };

  const items: TabsProps['items'] = [];

  if (!hideUser) {
    items.push({
      key: 'user',
      label: t('invite_by_username'),
      children: (
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={userForm}
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
                  message: t('please_select_user'),
                },
              ]}
            >
              <DebounceSelect
                maxCount={1}
                mode="multiple"
                fetchOptions={async (username: string) => {
                  const userList = await GetUserList(username);
                  return (userList?.users ?? []).map((item: any) => {
                    return {
                      label: item.username,
                      value: item.user_id,
                    };
                  });
                }}
              />
            </Form.Item>
            {groupID === undefined ? (
              <Form.Item label={t('grant_permission')} name="role">
                <Select
                  options={[
                    { value: 'guest', label: t('guest') },
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
                placeholder={t('please_select_expire_time')}
                showTime
              />
            </Form.Item>
          </Form>
        </div>
      ),
    });
  }

  if (!hideGroup) {
    items.push({
      key: 'group',
      label: t('invite_by_user_group'),
      children: (
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={groupForm}
            initialValues={{ role: 'guest' }}
          >
            <Form.Item
              label={t('user_group')}
              name="user"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                {
                  type: 'array',
                  required: true,
                  len: 1,
                  message: t('please_select_user_group'),
                },
              ]}
            >
              <DebounceSelect
                maxCount={1}
                mode="multiple"
                fetchOptions={async (_name: string) => {
                  if (id !== undefined) {
                    const groupList =
                      await scriptAccessService.getScriptGroupList(id, 1);
                    return (groupList.list ?? []).map((item: any) => {
                      return {
                        label: item.name,
                        value: item.id,
                      };
                    });
                  }
                  return [];
                }}
              />
            </Form.Item>
            <Form.Item label={t('grant_permission')} name="role">
              <Select
                options={[
                  { value: 'guest', label: t('guest') },
                  { value: 'manager', label: t('admin') },
                ]}
              />
            </Form.Item>
            <Form.Item label={t('expire_time')} name="time">
              <DatePicker
                className="w-full"
                placeholder={t('please_select_expire_time')}
                showTime
              />
            </Form.Item>
          </Form>
        </div>
      ),
    });
  }

  if (!hideInvite) {
    items.push({
      key: 'code',
      label: t('invite_by_code'),
      children: <InvitePage id={id} groupID={groupID} />,
    });
  }

  return (
    <Modal
      title={t('select_user_or_group')}
      open={status}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelText={t('cancel')}
      okText={t('add')}
      width={700}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          {activeKey !== 'code' ? <CancelBtn /> : <></>}
          {activeKey !== 'code' ? <OkBtn /> : <></>}
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
