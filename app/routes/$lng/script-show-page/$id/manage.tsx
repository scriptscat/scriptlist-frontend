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
  theme,
} from 'antd';
import { useContext } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GrayControl from '~/components/GrayControl';
import TextArea from '~/components/TextArea';
import { ScriptContext } from '~/context-manager';
import i18next from '~/i18next.server';
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
import { getLocale } from '~/utils/i18n';

type LoaderData = {
  setting: ScriptSetting;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const lng = getLocale(request, 'en')!;
  let t = await i18next.getFixedT(lng);

  const resp = await GetScriptSetting(parseInt(params.id as string), request);
  if (resp.code !== 0) {
    throw new Response(t('no_permission_access'), {
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
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <Card>
      {contextHolder}
      <div className="flex flex-col items-start gap-1">
        {script.script!.type === 3 && (
          <>
            <h3 className="text-lg">{t('library_info_setting')}</h3>
            <Input
              placeholder={t('library_name')}
              value={name}
              onChange={(value) => setName(value.target.value)}
            />
            <TextArea
              placeholder={t('library_description')}
              value={description}
              onChange={(value) => setDescription(value.target.value)}
            />
          </>
        )}
        <h3 className="text-lg">{t('souce_code_sync')}</h3>
        <span>{t('source_code_sync_description')}</span>
        <Input
          placeholder={t('script_sync_url')}
          value={syncUrl}
          onChange={(value) => setSyncUrl(value.target.value)}
        />
        <h3 className="text-lg">{t('script_sync_method')}</h3>
        <Radio.Group
          onChange={(value) => setSyncMode(value.target.value)}
          value={syncMode}
        >
          <Space direction="vertical">
            <Radio value={1}>{t('auto_sync')}</Radio>
            <Radio value={2}>{t('manual_sync')}</Radio>
          </Space>
        </Radio.Group>
        <h3 className="text-lg">{t('sync_script_info')}</h3>
        <span>{t('use_markdown_syntax')}</span>
        <Input
          placeholder={t('script_readme_sync_url')}
          value={contentUrl}
          onChange={(value) => setContentUrl(value.target.value)}
        />
        {/* {script.script?.type === 3 && (
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
              message.success(t('update_success'));
            } else {
              message.error(resp.msg);
            }
          }}
        >
          {t('update_settings_and_sync_immediately')}
        </Button>
        <Divider />
        <h3 className="text-lg">{t('script_manage')}</h3>
        <h4 className="text-base">{t('script_public')}</h4>
        <span>{t('script_public_describe')}</span>
        <Switch
          checkedChildren={t('public')}
          unCheckedChildren={t('unpublic')}
          checked={isPublic === 1 ? true : false}
          onChange={async (checked) => {
            let resp = await UpdateScriptPublic(
              script.script!.id,
              checked ? 1 : 2
            );
            if (resp.code === 0) {
              message.success(t('update_success'));
              setIsPublic(checked ? 1 : 2);
            } else {
              message.error(resp.msg);
            }
          }}
        />
        <h4 className="text-base">{t('inappropriate_content')}</h4>
        <Checkbox
          checked={unwell === 1 ? true : false}
          onChange={async (val) => {
            let resp = await UpdateScriptUnwell(
              script.script!.id,
              val.target.checked ? 1 : 2
            );
            if (resp.code === 0) {
              message.success(t('update_success'));
              setUnwell(val.target.checked ? 1 : 2);
            } else {
              message.error(resp.msg);
            }
          }}
        >
          {t('potentially_inappropriate_content')}
        </Checkbox>
        {script.script!.type === 1 && (
          <>
            <Divider></Divider>
            <h3 className="text-lg">{t('script_release')}</h3>
            <h4 className="text-base">{t('enable_pre_release')}</h4>
            <span>
              {t('enable_pre_release_description')}
              <a
                href="https://bbs.tampermonkey.net.cn/thread-3384-1-1.html"
                target="_blank"
                rel="noreferrer"
              >
                {t('semantic_versioning')}
              </a>
              {'<pre-release>'}
              {t('pre_release_version_auto_mark')}
            </span>
            <span>{t('first_time_enable_pre_release')}</span>
            <Switch
              checkedChildren={t('enable')}
              unCheckedChildren={t('disable')}
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
                      prev.push(
                        {
                          target_version: 'all-latest',
                          controls: [
                            {
                              type: 'pre-release',
                              params: {},
                            },
                          ],
                        },
                        {
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
                        },
                        {
                          target_version: 'latest^1',
                          controls: [
                            {
                              type: 'weight',
                              params: {
                                weight: 100,
                                weight_day: 0,
                              },
                            },
                          ],
                        }
                      );
                  }
                  return [...prev];
                });
                setEnablePreRelease(value ? 1 : 2);
              }}
            />
            <h3 className="text-lg">{t('gray_release')}</h3>
            <span>{t('configure_strategies')}</span>
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
                  message.success(t('update_success'));
                } else {
                  message.error(resp.msg);
                }
                setLoading(false);
              }}
            >
              {t('save_and_apply_strategies')}
            </Button>
          </>
        )}
        <Divider></Divider>
        <h3 className="text-lg">{t('script_manage')}</h3>
        <Space>
          {archive == 2 && (
            <Button
              type="primary"
              className="!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300"
              loading={loading}
              onClick={() => {
                modal.confirm({
                  title: t('confirm_archive'),
                  content: t('archive_content'),
                  icon: <ExclamationCircleOutlined />,
                  okText: t('confirm'),
                  cancelText: t('cancel'),
                  onOk: async () => {
                    setLoading(true);
                    const resp = await ArchiveScript(script.script!.id, true);
                    setLoading(false);
                    if (resp.code === 0) {
                      message.success(t('archive_success'));
                      setArchive(1);
                    } else {
                      message.error(resp.msg);
                    }
                  },
                });
              }}
            >
              {t('archive_script')}
            </Button>
          )}
          {archive == 1 && (
            <Button
              type="primary"
              className="!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300"
              loading={loading}
              onClick={() => {
                modal.confirm({
                  title: t('confirm_unarchive'),
                  content: t('unarchive_content'),
                  icon: <ExclamationCircleOutlined />,
                  okText: t('confirm'),
                  cancelText: t('cancel'),
                  onOk: async () => {
                    setLoading(true);
                    const resp = await ArchiveScript(script.script!.id, false);
                    setLoading(false);
                    if (resp.code === 0) {
                      message.success(t('unarchive_success'));
                      setArchive(2);
                    } else {
                      message.error(resp.msg);
                    }
                  },
                });
              }}
            >
              {t('unarchive_script')}
            </Button>
          )}
          <Button
            type="primary"
            loading={loading}
            danger
            onClick={() => {
              modal.confirm({
                title: t('confirm_delete_script'),
                content: t('delete_script_content'),
                icon: <ExclamationCircleOutlined />,
                okText: t('confirm'),
                cancelText: t('cancel'),
                onOk: async () => {
                  setLoading(true);
                  const resp = await DeleteScript(script.script!.id);
                  setLoading(false);
                  if (resp.code === 0) {
                    message.success(t('delete_success'));
                    navigate('/');
                  } else {
                    message.error(resp.msg);
                  }
                },
              });
            }}
          >
            {t('delete_script')}
          </Button>
        </Space>
        <Divider></Divider>
        <h3 className="text-lg">{t('manage_log')}</h3>
        <span>{t('no_open')}</span>
      </div>
    </Card>
  );
}
