import {
  DownloadOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  StarOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Link } from '@remix-run/react';
import { Card, Avatar, Button, Divider, Tag } from 'antd';
import { formatDate } from 'utils/utils';
import type { Script } from '~/services/scripts/types';

const SearchItem: React.FC<{ script: Script }> = ({ script }) => {
  const gridStyle = {
    width: '100%',
    padding: '2px 8px',
  };
  const iconStyle = {
    height: '14px',
  };

  return (
    <>
      <Card
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card.Grid hoverable={false} style={gridStyle}>
          <div className="flex flex-row items-center gap-1">
            <div>
              <Avatar src={script.avatar} />
            </div>
            <div className="flex flex-col flex-auto">
              <Link className="text-xs" to={''}>
                {script.username}
              </Link>
              <span className="text-lg">{script.name}</span>
            </div>
            <div>
              <Button type="link" className="!p-0">
                操作
              </Button>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid hoverable={false} style={gridStyle}>
          {script.description}
        </Card.Grid>
        <Card.Grid hoverable={false} style={gridStyle}>
          <div className="flex flex-row gap-4 py-2">
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">总安装量</span>
              <div className="text-xs font-semibold">
                <DownloadOutlined className="!align-middle" style={iconStyle} />
                <span>{script.total_install}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">今日安装</span>
              <div className="text-xs font-semibold">
                <DownloadOutlined className="!align-middle" style={iconStyle} />
                <span>{script.today_install}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">创建日期</span>
              <div className="text-xs font-semibold">
                <CalendarOutlined className="!align-middle" style={iconStyle} />
                <span>{formatDate(script.createtime)}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">更新日期</span>
              <div className="text-xs font-semibold">
                <CarryOutOutlined className="!align-middle" style={iconStyle} />
                <span>{formatDate(script.updatetime)}</span>
              </div>
            </div>
            <div className="flex flex-col text-center px-5">
              <span className="text-gray-500 text-sm">用户评分</span>
              <div className="text-xs font-semibold">
                <StarOutlined className="!align-middle" style={iconStyle} />
                <span>
                  {script.score
                    ? ((script.score * 2) / 10).toFixed(1)
                    : '暂无评分'}
                </span>
              </div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid hoverable={false} style={gridStyle}>
          <div className="flex flex-row justify-between py-[2px]">
            <div className="flex flex-row items-center text-sm">
              <Button icon={<StarFilled />} type="text" size="small"></Button>
              <Divider type="vertical" />
              <Button
                icon={<ExclamationCircleOutlined />}
                type="text"
                size="small"
              ></Button>
              <Divider type="vertical" />
              <Button
                icon={<ShareAltOutlined />}
                type="text"
                size="small"
              ></Button>
            </div>
            <div className="flex flex-row items-center">
              {script.category.map((category) => (
                <Tag key={category.id} color="green">{category.name}</Tag>
              ))}
            </div>
          </div>
        </Card.Grid>
      </Card>
    </>
  );
};
export default SearchItem;
