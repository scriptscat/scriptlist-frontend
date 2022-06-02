import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileExclamationOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu, Modal, Space } from 'antd';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';

export type MenuItemKey = 'delete';

export type DeleteLevel = 'admin' | 'super_moderator' | 'moderator';
export type ActionMenuProps = {
  uid: number | number[];
  deleteLevel: DeleteLevel; // 删除等级 管理员 超级版主 版主
  allowSelfDelete: boolean; // 允许自己删除
  onDeleteClick: () => void;
};

const ActionMenu: React.FC<ActionMenuProps> = ({
  children,
  deleteLevel,
  allowSelfDelete,
  uid,
  onDeleteClick,
}) => {
  const user = useContext(UserContext);
  const authorMap = new Map<number, boolean>();
  const [modal, contextHolder] = Modal.useModal();
  if (uid instanceof Array) {
    uid.forEach((v) => authorMap.set(v, true));
  } else {
    authorMap.set(uid, true);
  }
  let items = [];
  if (user.user) {
    // 判断用户等级是否为管理员 或者 允许作者删除
    if (
      (user.user.is_admin > 0 &&
        (user.user.is_admin == 1 ||
          (deleteLevel == 'super_moderator' && user.user.is_admin <= 2) ||
          (deleteLevel == 'moderator' && user.user.is_admin <= 3))) ||
      (allowSelfDelete && authorMap.has(user.user.uid))
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
        overlay={
          <Menu
            items={items}
            onClick={(value) => {
              if (value.key === 'report') {
                window.open(
                  'https://bbs.tampermonkey.net.cn/forum-75-1.html',
                  '_blank'
                );
              } else {
                modal.confirm({
                  title: '确认是否删除?',
                  content: '请注意删除操作是不可逆的',
                  icon: <ExclamationCircleOutlined />,
                  okText: '确认',
                  cancelText: '取消',
                  onOk: () => {
                    onDeleteClick();
                  },
                });
              }
            }}
          ></Menu>
        }
        trigger={['click']}
      >
        {children}
      </Dropdown>
    </div>
  );
};

export default ActionMenu;
