import { Line, Pie } from '@ant-design/plots';
import { Card, Divider, Input, Progress, Table } from 'antd';

export default function Advanced() {
  const origin = [
    {
      type: 'github',
      value: 27,
    },
    {
      type: 'scriptcat',
      value: 25,
    },
    {
      type: 'greasyfork',
      value: 18,
    },
    {
      type: '手动新建',
      value: 15,
    },
    {
      type: '其他',
      value: 5,
    },
  ];

  return (
    <>
      <div>
        <span>
          高级统计需要在脚本中引用统计库
          <Input
            readOnly
            value="// @require https://scriptcat.org/lib/1231/latest/statistic.js"
            style={{
              display: 'inline-block',
              width: '50%',
              margin: '0 10px',
            }}
          />
          才能获取数据
        </span>
      </div>
      <div className="text-center">
        <Progress percent={30} />
        <span>受限于服务器资源,暂时限额1000000条数据</span>
      </div>
      <Divider />
      <Card className="!p-0">
        <Card.Grid hoverable={false} className="!w-full !p-2">
          <div className="flex flex-row justify-between statistic">
            <div className="flex flex-col border-r pr-4 gap-1">
              <span></span>
              <span>今日</span>
              <span>昨日</span>
              <span>本周</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>脚本执行数(pv)</span>
              <span className="text-lg font-bold">1</span>
              <span>2</span>
              <span>3</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>脚本用户数(uv)</span>
              <span className="text-lg font-bold">1</span>
              <span>2</span>
              <span>3</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>平均使用时间</span>
              <span className="text-lg font-bold">1</span>
              <span>2</span>
              <span>3</span>
            </div>
            <div className="flex flex-col border-r p-4">
              <span>新老用户</span>
              <span className="text-lg font-bold">1|2</span>
              <span>2|3</span>
              <span>3|4</span>
            </div>
          </div>
        </Card.Grid>
      </Card>
      <Divider />
      <Card title="用户来源" size="small" bordered={false}>
        <div className="flex flex-row">
          <Pie
            className="flex-4"
            angleField="value"
            colorField="type"
            data={origin}
          />
          <Table
            className="flex-1"
            size="small"
            columns={[
              { title: '来源网站', dataIndex: 'origin', key: 'origin' },
              { title: 'pv', dataIndex: 'pv', key: 'pv' },
              { title: 'uv', dataIndex: 'uv', key: 'uv' },
              {
                title: '平均使用时长',
                dataIndex: 'useTime',
                key: 'useTime',
              },
            ]}
            dataSource={[
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },

              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
            ]}
          />
        </div>
      </Card>
      <Divider />
      <div className="flex flex-row w-full gap-4">
        <Card title="版本分布" className="flex-1" size="small" bordered={false}>
          <Pie
            angleField="value"
            colorField="type"
            data={[
              { value: 20, type: '1.0.1' },
              { value: 30, type: '1.0.9' },
              { value: 100, type: '1.2.1' },
            ]}
          />
        </Card>
        <Card title="操作域" className="flex-1" size="small" bordered={false}>
          <Pie
            angleField="value"
            colorField="type"
            data={[
              { value: 20, type: 'bbs.tampermonkey.net.cn' },
              { value: 30, type: 'github.com' },
              { value: 100, type: 'bilibili.com' },
            ]}
          />
        </Card>
        <Card title="系统环境" className="flex-1" size="small" bordered={false}>
          <div className="flex flex-row">
            <Pie
              className="flex-1"
              angleField="value"
              colorField="type"
              data={[
                { value: 20, type: 'windows' },
                { value: 30, type: 'mac' },
                { value: 100, type: 'linux' },
              ]}
            />
            <Pie
              className="flex-1"
              angleField="value"
              colorField="type"
              data={[
                { value: 20, type: 'chrome' },
                { value: 30, type: 'firefox' },
                { value: 100, type: '360' },
              ]}
            />
          </div>
        </Card>
      </div>
      <Divider />
      <Card title="实时用户" size="small" bordered={false}>
        <div className="flex flex-row gap-4">
          <Line
            className="flex-4"
            style={{ height: 300 }}
            renderer="canvas"
            animation={false}
            data={[
              {
                time: '2021-01-01 00:00:00',
                num: 10,
                name: 'uv',
              },
              {
                time: '2021-01-01 00:00:00',
                num: 17,
                name: 'pv',
              },
              {
                time: '2021-01-01 00:00:01',
                num: 10,
                name: 'uv',
              },
              {
                time: '2021-01-01 00:00:01',
                num: 17,
                name: 'pv',
              },
            ]}
            xField="time"
            yField="num"
            seriesField="name"
          />
          <Table
            className="flex-1"
            size="small"
            columns={[
              { title: '来源网站', dataIndex: 'origin', key: 'origin' },
              { title: 'pv', dataIndex: 'pv', key: 'pv' },
              { title: 'uv', dataIndex: 'uv', key: 'uv' },
              {
                title: '平均使用时长',
                dataIndex: 'useTime',
                key: 'useTime',
              },
            ]}
            dataSource={[
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },

              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
              {
                origin: '脚本猫',
                pv: 100,
                uv: 10,
                useTime: '00:08:00',
              },
            ]}
          />
        </div>
      </Card>
    </>
  );
}
