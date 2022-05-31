import {
  DownloadOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  StarOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  ShareAltOutlined,
  QuestionCircleOutlined,
  MoneyCollectOutlined,
} from '@ant-design/icons';
import { Link } from '@remix-run/react';
import { Card, Avatar, Button, Divider, Tag, Tooltip, message } from 'antd';
import { RiMessage2Line } from 'react-icons/ri';
import { formatDate } from '~/utils/utils';
import type { Script } from '~/services/scripts/types';
import ClipboardJS from 'clipboard';

const antifeatures: {
  [key: string]: { color: string; title: string; description: string };
} = {
  'referral-link': {
    color: '#9254de',
    title: '推荐链接',
    description: '该脚本会修改或重定向到作者的返佣链接',
  },
  ads: {
    color: '#faad14',
    title: '附带广告',
    description: '该脚本会在你访问的页面上插入广告',
  },
  payment: {
    color: '#eb2f96',
    title: '付费脚本',
    description: '该脚本需要你付费才能够正常使用',
  },
  miner: {
    color: '#fa541c',
    title: '挖矿',
    description: '该脚本存在挖坑行为',
  },
  membership: {
    color: '#1890ff',
    title: '会员功能',
    description: '该脚本需要注册会员才能正常使用',
  },
  tracking: {
    color: '#722ed1',
    title: '信息追踪',
    description: '该脚本会追踪你的用户信息',
  },
};

const SearchItem: React.FC<{
  script: Script;
  action?: boolean;
}> = ({ script, action }) => {
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
              <Link
                className="text-xs"
                to={'/users/' + script.uid}
                target="_blank"
              >
                {script.username}
              </Link>
              <Link
                className="text-lg text-black dark:text-white"
                to={'/script-show-page/' + script.id}
                target="_blank"
              >
                {script.name}
              </Link>
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
        {action && (
          <Card.Grid hoverable={false} style={gridStyle}>
            <div className="flex flex-row script-info-item px-2 py-1 gap-2">
              <Button.Group>
                <Button
                  className="!rounded-none"
                  type="primary"
                  href={
                    '/scripts/code/' +
                    script.id +
                    '/' +
                    encodeURIComponent(script.name) +
                    '.user.js'
                  }
                  icon={<DownloadOutlined />}
                >
                  安装脚本
                </Button>
                <Tooltip placement="bottom" title="如何安装?">
                  <Button
                    className="!rounded-none"
                    type="primary"
                    href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
                    target="_blank"
                    icon={<QuestionCircleOutlined />}
                    color="#3874cb"
                  ></Button>
                </Tooltip>
              </Button.Group>
              {(script.post_id ||
                script.script.meta_json['contributionurl']) && (
                <Divider type="vertical" className="!h-auto" />
              )}
              {script.script.meta_json['contributionurl'] && (
                <Button
                  className="!rounded-none !bg-transparent !border-orange-400 !text-orange-400"
                  href={script.script.meta_json['contributionurl'][0]}
                  target="_blank"
                  icon={<MoneyCollectOutlined />}
                >
                  捐赠脚本
                </Button>
              )}
              {script.post_id && (
                <Button
                  className="!rounded-none !bg-transparent !border-blue-400 !text-blue-400"
                  icon={<RiMessage2Line className="!inline-block !m-0 !mr-2" />}
                  href={`https://bbs.tampermonkey.net.cn/thread-${script.post_id}-1-1.html`}
                  target="_blank"
                >
                  论坛帖子
                </Button>
              )}
            </div>
          </Card.Grid>
        )}
        <Card.Grid hoverable={false} style={gridStyle}>
          <div className="flex flex-row justify-between py-[2px]">
            <div className="flex flex-row items-center text-sm">
              <Tooltip title="评分" placement="bottom">
                <Button
                  icon={<StarFilled className="!text-yellow-300" />}
                  type="text"
                  size="small"
                  className="anticon-middle"
                  href={'/script-show-page/' + script.id + '/comment'}
                  target={action ? '_self' : '_blank'}
                ></Button>
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title="反馈问题" placement="bottom">
                <Button
                  icon={
                    <ExclamationCircleOutlined className="!text-cyan-500" />
                  }
                  type="text"
                  size="small"
                  className="anticon-middle"
                  href={'/script-show-page/' + script.id + '/issue'}
                  target={action ? '_self' : '_blank'}
                ></Button>
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title="分享链接" placement="bottom">
                <Button
                  icon={<ShareAltOutlined className="!text-blue-500" />}
                  type="text"
                  size="small"
                  className="anticon-middle"
                  onClick={() => {
                    new ClipboardJS('.share-script-btn', {
                      text: () => {
                        return (
                          script.name +
                          '\n' +
                          window.location.origin +
                          '/script-show-page/' +
                          script.id
                        );
                      },
                    });
                    message.success('复制成功');
                  }}
                ></Button>
              </Tooltip>
            </div>
            <div className="flex flex-row items-center">
              <Tooltip
                title={'脚本最新版本为:v' + script.script.version}
                color="red"
                placement="bottom"
              >
                <Tag color="red">{'v' + script.script.version}</Tag>
              </Tooltip>
              {script.category.map((category) => (
                <Tooltip
                  title={'该脚本属于' + category.name + '分类'}
                  color="green"
                  placement="bottom"
                  key={category.id}
                >
                  <Tag color="green">{category.name}</Tag>
                </Tooltip>
              ))}
              {action &&
                script.script.meta_json['antifeature'] &&
                script.script.meta_json['antifeature'].map((antifeature) =>
                  antifeatures[antifeature] ? (
                    <Tooltip
                      title={antifeatures[antifeature].description}
                      color={antifeatures[antifeature].color}
                      placement="bottom"
                      key={antifeature}
                    >
                      <Tag color={antifeatures[antifeature].color}>
                        {antifeatures[antifeature].title}
                      </Tag>
                    </Tooltip>
                  ) : (
                    <></>
                  )
                )}
            </div>
          </div>
        </Card.Grid>
      </Card>
    </>
  );
};
export default SearchItem;
