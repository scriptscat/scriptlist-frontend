import { Button, Card, Divider, Input, Radio, Space } from 'antd';

export default function Manage() {
  return (
    <Card>
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-lg">源代码同步</h3>
        <span>自动从输入的地址中进行源代码同步操作。</span>
        <Input placeholder="脚本源代码同步 URL" />
        <h3 className="text-lg">脚本同步方式</h3>
        <Radio>自动，系统将在未来时间内定期进行更新检查</Radio>
        <Radio>手动，仅在你手动点击按钮的时候进行更新检查</Radio>
        <h3 className="text-lg">同步脚本附加信息</h3>
        <span>强制使用markdown语法</span>
        <Input placeholder="脚本README同步 URL" />
        <Button type="primary">更新设置并且立刻同步</Button>
        <Divider></Divider>
        <h3 className="text-lg">脚本管理</h3>
        <Space>
          <Button
            type="primary"
            className="!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300"
          >
            归档脚本
          </Button>
          <Button type="primary" danger>
            删除脚本
          </Button>
        </Space>
        <Divider></Divider>
        <h3 className='text-lg'>管理日志</h3>
        <span>暂未开放</span>
      </div>
    </Card>
  );
}
