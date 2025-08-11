import { Modal, Form, Select, DatePicker, Button, message, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useState } from 'react';
import { DebounceSelect } from '@/components/DebounceSelect';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { GetUserList } from '@/lib/api/services/user';
import { InvitePage } from '@/components/InvitePage';

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
          .then((resp: any) => {
            message.success('提交成功');
            handleCancel();
          })
          .catch((error) => {
            console.error('提交失败:', error);
            message.error(error.message || '提交失败');
          });
      })
      .catch((err) => {
        console.error('表单验证失败:', err);
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
      label: '通过用户名邀请',
      children: (
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={userForm}
            initialValues={{ role: 'guest' }}
          >
            <Form.Item
              label="用户名"
              name="user"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                {
                  type: 'array',
                  required: true,
                  len: 1,
                  message: '请选择用户',
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
              <Form.Item label="授予权限" name="role">
                <Select
                  options={[
                    { value: 'guest', label: '访客' },
                    { value: 'manager', label: '管理员' },
                  ]}
                />
              </Form.Item>
            ) : (
              <></>
            )}
            <Form.Item label="过期时间" name="time">
              <DatePicker
                className="w-full"
                placeholder="请选择过期时间"
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
      label: '通过用户组邀请',
      children: (
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={groupForm}
            initialValues={{ role: 'guest' }}
          >
            <Form.Item
              label="用户组"
              name="user"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                {
                  type: 'array',
                  required: true,
                  len: 1,
                  message: '请选择用户组',
                },
              ]}
            >
              <DebounceSelect
                maxCount={1}
                mode="multiple"
                fetchOptions={async (name: string) => {
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
            <Form.Item label="授予权限" name="role">
              <Select
                options={[
                  { value: 'guest', label: '访客' },
                  { value: 'manager', label: '管理员' },
                ]}
              />
            </Form.Item>
            <Form.Item label="过期时间" name="time">
              <DatePicker
                className="w-full"
                placeholder="请选择过期时间"
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
      label: '通过邀请码邀请',
      children: <InvitePage id={id} groupID={groupID} />,
    });
  }

  return (
    <Modal
      title="请选择用户或用户组"
      open={status}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelText="取消"
      okText="添加"
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
