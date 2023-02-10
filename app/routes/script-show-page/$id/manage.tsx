import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  message,
  Modal,
  Radio,
  Space,
  Switch,
} from 'antd';
import { useContext } from 'react';
import { useState } from 'react';
import GrayControl from '~/components/GrayControl';
import { ScriptContext } from '~/context-manager';
import {
  ArchiveScript,
  DeleteScript,
  GetScriptSetting,
  UpdateScriptGrayControls,
  UpdateScriptPublic,
  UpdateScriptSetting,
  UpdateScriptUnwell,
} from '~/services/scripts/api';
import type { ScriptSetting } from '~/services/scripts/types';

type LoaderData = {
  setting: ScriptSetting;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const resp = await GetScriptSetting(parseInt(params.id as string), request);
  if (resp.code !== 0) {
    throw new Response('没有权限访问此页面', {
      status: 403,
      statusText: 'Forbidden ',
    });
  }
  return json({ setting: resp.data } as LoaderData);
};

export default function Manage() {
  const data = useLoaderData<LoaderData>();
  const script = useContext(ScriptContext);
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();
  const [archive, setArchive] = useState(script.script!.archive);
  const [syncUrl, setSyncUrl] = useState(data.setting.sync_url);
  const [syncMode, setSyncMode] = useState<1 | 2>(data.setting.sync_mode);
  const [contentUrl, setContentUrl] = useState(data.setting.content_url);
  const [name, setName] = useState(script.script!.name);
  const [description, setDescription] = useState(script.script!.description);
  const [definitionUrl] = useState(data.setting.definition_url);
  const [loading, setLoading] = useState(false);
  const [enablePreRelease, setEnablePreRelease] = useState(
    script.script!.enable_pre_release || 2
  );
  const [grayControls, setGrayControls] = useState(
    data.setting.gray_controls || []
  );
  const [isPublic, setIsPublic] = useState(script.script!.public);
  const [unwell, setUnwell] = useState(script.script!.unwell);

  return (
    <Card>
      {contextHolder}
      <div className="flex flex-col items-start gap-1">
        {script.script!.type == 3 && (
          <>
            <h3 className="text-lg">库信息设置</h3>
            <Input
              placeholder="库名称"
              value={name}
              onChange={(value) => setName(value.target.value)}
            />
            <Input
              placeholder="库描述"
              value={description}
              onChange={(value) => setDescription(value.target.value)}
            />
          </>
        )}
        <h3 className="text-lg">源代码同步</h3>
        <span>自动从输入的地址中进行源代码同步操作。</span>
        <Input
          placeholder="脚本源代码同步 URL"
          value={syncUrl}
          onChange={(value) => setSyncUrl(value.target.value)}
        />
        <h3 className="text-lg">脚本同步方式</h3>
        <Radio.Group
          onChange={(value) => setSyncMode(value.target.value)}
          value={syncMode}
        >
          <Space direction="vertical">
            <Radio value={1}>自动，系统将在未来时间内定期进行更新检查</Radio>
            <Radio value={2}>手动，仅在你手动点击按钮的时候进行更新检查</Radio>
          </Space>
        </Radio.Group>
        <h3 className="text-lg">同步脚本附加信息</h3>
        <span>强制使用markdown语法</span>
        <Input
          placeholder="脚本README同步 URL"
          value={contentUrl}
          onChange={(value) => setContentUrl(value.target.value)}
        />
        {/* {script.script?.type == 3 && (
          <>
            <h3 className="text-lg">同步库描述文件</h3>
            <span>
              .d.ts文件,脚本猫支持(
              <a
                target="_blank"
                href="https://docs.scriptcat.org/dev/meta.html#definition"
                rel="noreferrer"
              >
                @definition
              </a>
              )
            </span>
            <Input
              placeholder="库描述文件同步 URL"
              value={definitionUrl}
              onChange={(value) => setDefinitionUrl(value.target.value)}
            />
          </>
        )} */}
        <Button
          type="primary"
          loading={loading}
          onClick={async () => {
            setLoading(true);
            let resp = await UpdateScriptSetting(script.script!.id, {
              name: name,
              description: description,
              definition_url: definitionUrl,
              sync_url: syncUrl,
              sync_mode: syncMode,
              content_url: contentUrl,
            });
            setLoading(false);
            if (resp.code === 0) {
              message.success('更新成功');
            } else {
              message.error(resp.msg);
            }
          }}
        >
          更新设置并且立刻同步
        </Button>
        <Divider />
        <h3 className="text-lg">脚本管理</h3>
        <h4 className="text-base">脚本访问权限</h4>
        <Switch
          checkedChildren="公开"
          unCheckedChildren="私有"
          checked={isPublic === 1 ? true : false}
          onChange={async (checked) => {
            let resp = await UpdateScriptPublic(
              script.script!.id,
              checked ? 1 : 2
            );
            if (resp.code === 0) {
              message.success('更新成功');
              setIsPublic(checked ? 1 : 2);
            } else {
              message.error(resp.msg);
            }
          }}
        />
        <h4 className="text-base">不适内容</h4>
        <Checkbox
          checked={unwell === 1 ? true : false}
          onChange={async (val) => {
            let resp = await UpdateScriptUnwell(
              script.script!.id,
              val.target.checked ? 1 : 2
            );
            if (resp.code === 0) {
              message.success('更新成功');
              setUnwell(val.target.checked ? 1 : 2);
            } else {
              message.error(resp.msg);
            }
          }}
        >
          该网站可能存在令人不适内容，包括但不限于红蓝闪光频繁闪烁、对视觉、精神有侵害的内容。
        </Checkbox>
        <Divider></Divider>
        <h3 className="text-lg">脚本发布</h3>
        <h4 className="text-base">开启预发布</h4>
        <span>
          开启预发布开关时, 当版本符合
          <a
            href="https://bbs.tampermonkey.net.cn/thread-3384-1-1.html"
            target="_blank"
            rel="noreferrer"
          >
            语义化版本
          </a>
          {'<pre-release>'}
          时更新脚本将会自动标记为预发布版本,并且会在脚本首页提供预发布版本的安装按钮.
        </span>
        <span>(首次开启会帮你新增一条预发布灰度规则)</span>
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={enablePreRelease === 1}
          onClick={(value) => {
            setGrayControls((prev) => {
              if (value) {
                let flag = false;
                prev.forEach((val) => {
                  val.controls.forEach((v) => {
                    if (v.type === 'pre-release') {
                      flag = true;
                    }
                  });
                });
                !flag &&
                  prev.push({
                    target_version: 'all-latest',
                    controls: [
                      {
                        type: 'pre-release',
                        params: {},
                      },
                    ],
                  });
              }
              return [...prev];
            });
            setEnablePreRelease(value ? 1 : 2);
          }}
        />
        <h3 className="text-lg">灰度发布</h3>
        <span>可配置一定的策略(策略有顺序性),使你的脚本用户更新到指定版本</span>
        <div className="flex flex-row flex-wrap gap-1">
          {grayControls.map((val, index) => (
            <GrayControl
              key={index}
              index={index}
              value={val}
              onClose={() => {
                setGrayControls((prev) => {
                  prev.splice(index, 1);
                  return [...prev];
                });
              }}
              onChange={(index, value) => {
                setGrayControls((prev) => {
                  prev[index] = value;
                  return [...prev];
                });
              }}
            />
          ))}
          <Button
            type="text"
            icon={<PlusOutlined />}
            size="large"
            style={{
              marginLeft: '8px',
            }}
            onClick={() => {
              setGrayControls((prev) => {
                prev.push({
                  target_version: 'latest',
                  controls: [
                    {
                      type: 'weight',
                      params: {
                        weight: 100,
                        weight_day: 10,
                      },
                    },
                  ],
                });
                return [...prev];
              });
            }}
          />
        </div>
        <Button
          type="primary"
          loading={loading}
          style={{ marginTop: '8px' }}
          onClick={async () => {
            setLoading(true);
            let resp = await UpdateScriptGrayControls(
              script.script!.id,
              enablePreRelease,
              grayControls
            );
            if (resp.code === 0) {
              message.success('更新成功');
            } else {
              message.error(resp.msg);
            }
            setLoading(false);
          }}
        >
          保存并生效策略
        </Button>
        <Divider></Divider>
        <h3 className="text-lg">脚本管理</h3>
        <Space>
          {archive == 2 && (
            <Button
              type="primary"
              className="!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300"
              loading={loading}
              onClick={() => {
                modal.confirm({
                  title: '确认是否归档',
                  content:
                    '归档后,脚本将不再支持更新,用户无法反馈,但是仍然可以使用',
                  icon: <ExclamationCircleOutlined />,
                  okText: '确认',
                  cancelText: '取消',
                  onOk: async () => {
                    setLoading(true);
                    const resp = await ArchiveScript(script.script!.id, true);
                    setLoading(false);
                    if (resp.code === 0) {
                      message.success('归档成功');
                      setArchive(1);
                    } else {
                      message.error(resp.msg);
                    }
                  },
                });
              }}
            >
              归档脚本
            </Button>
          )}
          {archive == 1 && (
            <Button
              type="primary"
              className="!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300"
              loading={loading}
              onClick={() => {
                modal.confirm({
                  title: '确认是否取消归档',
                  content: '取消归档后,脚本可以正常维护',
                  icon: <ExclamationCircleOutlined />,
                  okText: '确认',
                  cancelText: '取消',
                  onOk: async () => {
                    setLoading(true);
                    const resp = await ArchiveScript(script.script!.id, false);
                    setLoading(false);
                    if (resp.code === 0) {
                      message.success('取消归档成功');
                      setArchive(2);
                    } else {
                      message.error(resp.msg);
                    }
                  },
                });
              }}
            >
              取消归档
            </Button>
          )}
          <Button
            type="primary"
            loading={loading}
            danger
            onClick={() => {
              modal.confirm({
                title: '确认是否删除脚本',
                content:
                  '请注意这是不可逆的操作,删除脚本后,所有数据将清空,但之前已经安装了的用户可以正常使用',
                icon: <ExclamationCircleOutlined />,
                okText: '确认',
                cancelText: '取消',
                onOk: async () => {
                  setLoading(true);
                  const resp = await DeleteScript(script.script!.id);
                  setLoading(false);
                  if (resp.code === 0) {
                    message.success('删除成功');
                    navigate('/');
                  } else {
                    message.error(resp.msg);
                  }
                },
              });
            }}
          >
            删除脚本
          </Button>
        </Space>
        <Divider></Divider>
        <h3 className="text-lg">管理日志</h3>
        <span>暂未开放</span>
      </div>
    </Card>
  );
}
