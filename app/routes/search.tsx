import { RiseOutlined, TagsOutlined } from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { Card, Radio, Select, Space } from 'antd';
import { search } from '~/services/scripts/api';
import type { SearchResponse } from '~/services/scripts/types';

// 加载热门脚本与分类等不希望重新加载的数据
export const unstable_shouldReload = () => false;

// 脚本列表使用嵌套路由实现
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const resp = await search({
    keyword: url.searchParams.get('keyword') || '',
  });
  return json({
    resp: resp,
  });
};

export default function Search() {
  const loader = useLoaderData<{ resp: SearchResponse }>();

  return (
    <>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col !gap-3 basis-full md:basis-3/4">
          <Card>
            <div className="flex flex-col !gap-3">
              <div>
                <Space>
                  <TagsOutlined />
                  <span>分类</span>
                  <Select
                    mode="multiple"
                    allowClear
                    size="small"
                    className="w-48"
                    placeholder="分类标签"
                  ></Select>
                </Space>
              </div>
              <div>
                <Space>
                  <RiseOutlined />
                  <span>排序</span>
                  <Radio.Group value="day" size="small">
                    <Radio.Button value="day">日安装</Radio.Button>
                    <Radio.Button value="total">总安装</Radio.Button>
                    <Radio.Button value="score">评分</Radio.Button>
                  </Radio.Group>
                </Space>
              </div>
            </div>
          </Card>
          <Outlet />
        </div>
        <div className="flex-col gap-3 hidden basis-1/4 md:flex">
          <Card>
            <Card.Meta
              title="学油猴脚本"
              description="就来油猴中文网"
            ></Card.Meta>
          </Card>
        </div>
      </div>
    </>
  );
}
