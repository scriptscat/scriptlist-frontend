'use client';

import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileExclamationOutlined,
} from '@ant-design/icons';
import { Dropdown, Modal, Select, Space, Input } from 'antd';
import { useUser } from '@/contexts/UserContext';

const { Option } = Select;
const { TextArea } = Input;

export type MenuItemKey = 'delete';

export type DeleteLevel = 'admin' | 'super_moderator' | 'moderator';

export interface ActionMenuProps {
  children: React.ReactNode;
  uid: number | number[];
  deleteLevel: DeleteLevel; // 删除等级 管理员 超级版主 版主
  allowSelfDelete: boolean; // 允许自己删除
  onDeleteClick: () => void;
  // 处罚
  punish?: boolean;
  onPunishClick?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  children,
  deleteLevel,
  allowSelfDelete,
  uid,
  onDeleteClick,
  punish,
  onPunishClick,
}) => {
  const user = useUser();
  const authorMap = new Map<number, boolean>();

  const [modal, contextHolder] = Modal.useModal();

  if (uid instanceof Array) {
    uid.forEach((v) => authorMap.set(v, true));
  } else {
    authorMap.set(uid, true);
  }

  const items = [];

  if (user.user) {
    // 判断用户等级是否为管理员 或者 允许作者删除
    if (
      (user.user.is_admin > 0 &&
        (user.user.is_admin === 1 ||
          (deleteLevel === 'super_moderator' && user.user.is_admin <= 2) ||
          (deleteLevel === 'moderator' && user.user.is_admin <= 3))) ||
      (allowSelfDelete && authorMap.has(user.user.user_id))
    ) {
      items.push({
        label: (
          <Space className="anticon-middle">
            <DeleteOutlined />
            <span>删除</span>
          </Space>
        ),
        key: 'delete',
      });

      if (punish) {
        // items.push({
        //   label: (
        //     <Space className="anticon-middle">
        //       <ExclamationCircleOutlined />
        //       <span>处罚</span>
        //     </Space>
        //   ),
        //   key: 'punish',
        // });
      }
    }
  }

  items.push({
    label: (
      <Space className="anticon-middle">
        <FileExclamationOutlined />
        <span>举报</span>
      </Space>
    ),
    key: 'report',
  });

  return (
    <div>
      {contextHolder}
      <Dropdown
        menu={{
          items: items,
          onClick: (value) => {
            if (value.key === 'report') {
              window.open(
                'https://bbs.tampermonkey.net.cn/forum-75-1.html',
                '_blank',
              );
            } else if (value.key === 'punish') {
              modal.confirm({
                title: '确认处罚',
                content: (
                  <Space
                    direction="vertical"
                    style={{
                      width: '100%',
                    }}
                  >
                    <span>选择处罚选项</span>
                    <Select defaultValue="lucy" style={{ width: '100%' }}>
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                    <span>处罚原因</span>
                    <TextArea
                      rows={2}
                      style={{ width: '100%', border: '1px solid #444' }}
                    />
                  </Space>
                ),
                icon: <ExclamationCircleOutlined />,
                okText: '确认',
                cancelText: '取消',
                maskClosable: true,
                onOk: () => {
                  onPunishClick?.();
                },
              });
            } else {
              modal.confirm({
                title: '确认删除',
                content: '删除后无法恢复，确认删除吗？',
                icon: <ExclamationCircleOutlined />,
                okText: '确认',
                cancelText: '取消',
                maskClosable: true,
                onOk: () => {
                  onDeleteClick();
                },
              });
            }
          },
        }}
      >
        {children}
      </Dropdown>
    </div>
  );
};

export default ActionMenu;
