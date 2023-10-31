import {
  CopyOutlined,
  DeleteOutlined,
  DiffOutlined,
  DownloadOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  Button,
  Card,
  Checkbox,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { useContext, useState } from 'react';
import { formatDate } from '~/utils/utils';
import MarkdownView, { markdownViewLinks } from '~/components/MarkdownView';
import { ScriptContext, UserContext } from '~/context-manager';
import {
  ScriptCodeDelete,
  ScriptVersionList,
  UpdateCodeSetting,
} from '~/services/scripts/api';
import type { ScriptCode } from '~/services/scripts/types';
import { useTranslation } from 'react-i18next';

export const links: LinksFunction = () => [...markdownViewLinks()];

type LoaderData = {
  list: ScriptCode[];
  total: number;
};

export const loader: LoaderFunction = async ({ params }) => {
  const resp = await ScriptVersionList(parseInt(params.id as string));
  return json({
    list: resp.data.list,
    total: resp.data.total,
  } as LoaderData);
};
export default function Version() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [diff, setDiff] = useState(-1);
  const script = useContext(ScriptContext);
  const user = useContext(UserContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [list, setList] = useState(data.list);
  const [edit, setEdit] = useState({
    index: 0,
    id: 0,
    changelog: '',
    is_pre_release: 2,
  });
  const { t } = useTranslation();

  return (
    <Card>
      <Modal
        title={t('version_setting')}
        open={isModalOpen}
        okText={t('save')}
        cancelText={t('cancel')}
        onOk={() => {
          UpdateCodeSetting(
            script.script!.id,
            edit.id,
            edit.changelog,
            edit.is_pre_release
          ).then((resp) => {
            if (resp.code === 0) {
              message.success(t('update_success'));
              setModalOpen(false);
              setList((prev) => {
                prev[edit.index].changelog = edit.changelog;
                prev[edit.index].is_pre_release = edit.is_pre_release;
                return [...prev];
              });
            } else {
              message.error(resp.msg);
            }
          });
        }}
        onCancel={() => {
          setModalOpen(false);
        }}
      >
        <span>{t('changelog')}</span>
        <Input.TextArea
          title={t('changelog')}
          rows={6}
          value={edit.changelog}
          onChange={(val) => {
            setEdit({ ...edit, changelog: val.target.value });
          }}
        ></Input.TextArea>
        <Tooltip title={t('version_pre_release_tooltip')}>
          <Checkbox
            checked={edit.is_pre_release === 1 ? true : false}
            onChange={(val) => {
              setEdit({ ...edit, is_pre_release: val.target.checked ? 1 : 2 });
            }}
          >
            {t('set_pre_release')}
          </Checkbox>
        </Tooltip>
      </Modal>
      <List
        dataSource={list}
        renderItem={(item, index) => (
          <Card className={index != 0 ? '!mt-3' : ''}>
            <Card.Grid
              hoverable={false}
              style={{
                padding: '8px 8px',
                width: '100%',
              }}
              className="script-info-item"
            >
              <div className="flex flex-col">
                <div className="flex flex-row justify-between">
                  <Space>
                    <span className="text-2xl">{item.version}</span>
                    {index === 0 && <Tag color="green">{t('latest')}</Tag>}
                    {item.is_pre_release === 1 && (
                      <Tag color="orange">{t('pre_release_version')}</Tag>
                    )}
                  </Space>
                  <Button.Group size="small">
                    <Button
                      className="!rounded-none"
                      icon={<EditOutlined />}
                      style={{
                        border: 0,
                      }}
                      onClick={() => {
                        setEdit({
                          index: index,
                          id: item.id,
                          changelog: item.changelog,
                          is_pre_release: item.is_pre_release || 2,
                        });
                        setModalOpen(true);
                      }}
                    />
                    {user.user &&
                      (script.script!.user_id == user.user.user_id ||
                        user.user.is_admin > 0) && (
                        <Popconfirm
                          title={t('delete_confirm')}
                          onConfirm={() => {
                            ScriptCodeDelete(script.script!.id, item.id)
                              .then((resp) => {
                                if (resp.code === 0) {
                                  message.success(t('delete_success'));
                                  setList((prev) => {
                                    prev.splice(index, 1);
                                    return [...prev];
                                  });
                                } else {
                                  message.error(resp.msg);
                                }
                              })
                              .catch((e) => {
                                message.error(t('delete_failed'));
                              });
                          }}
                          okText={t('confirm')}
                          cancelText={t('cancel')}
                        >
                          <Button
                            className="!rounded-none"
                            icon={<DeleteOutlined />}
                            style={{
                              border: 0,
                            }}
                          />
                        </Popconfirm>
                      )}
                  </Button.Group>
                </div>
                <div className="py-2">
                  <MarkdownView
                    id={'version-' + item.id}
                    content={item.changelog || t('no_changelog')}
                  />
                </div>
              </div>
            </Card.Grid>
            <Card.Grid
              hoverable={false}
              style={{
                padding: '8px 8px',
                width: '100%',
              }}
              className="script-info-item"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">{formatDate(item.createtime)}</span>
                {(script.script?.type == 1 || script.script?.type == 2) && (
                  <Button.Group size="small">
                    <Button
                      className="!rounded-none"
                      type="primary"
                      href={
                        '/scripts/code/' +
                        script.script?.id +
                        '/' +
                        script.script?.name +
                        '.user.js?version=' +
                        item.version
                      }
                      icon={<DownloadOutlined />}
                    >
                      {t('install')}
                      {item.version}
                    </Button>
                    <Tooltip placement="bottom" title={t('how_to_install')}>
                      <Button
                        className="!rounded-none"
                        type="primary"
                        icon={<QuestionCircleOutlined />}
                        color="#3874cb"
                        href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
                        target="_blank"
                      ></Button>
                    </Tooltip>
                    <Tooltip
                      placement="bottom"
                      title={t('compare_code_changes')}
                    >
                      <Button
                        className="!rounded-none"
                        icon={<DiffOutlined />}
                        danger={diff == index}
                        onClick={() => {
                          if (diff == index) {
                            setDiff(-1);
                          }
                          if (diff != -1) {
                            navigate({
                              pathname: '../diff',
                              search:
                                '?version1=' +
                                list[diff].version +
                                '&version2=' +
                                item.version,
                            });
                            return;
                          }
                          setDiff(index);
                        }}
                      ></Button>
                    </Tooltip>
                  </Button.Group>
                )}
                {script.script?.type == 3 && (
                  <>
                    <Input.Group
                      compact
                      style={{
                        width: 'auto',
                      }}
                    >
                      <Input
                        style={{
                          width: '500px',
                          borderStartStartRadius: 0,
                          borderEndStartRadius: 0,
                        }}
                        defaultValue={
                          '// @require https://scriptcat.org/lib/' +
                          script.script.id +
                          '/' +
                          item.version +
                          '/' +
                          encodeURIComponent(script.script.name) +
                          '.js'
                        }
                        readOnly
                      />
                      <Tooltip placement="bottom" title={t('copy_link')}>
                        <Button
                          type="default"
                          icon={<CopyOutlined />}
                          className="copy-require-link"
                          require-link={
                            '// @require https://scriptcat.org/lib/' +
                            script.script.id +
                            '/' +
                            item.version +
                            '/' +
                            encodeURIComponent(script.script.name) +
                            '.js'
                          }
                        ></Button>
                      </Tooltip>
                      <Tooltip placement="bottom" title={t('how_to_install')}>
                        <Button
                          className="!rounded-none"
                          type="primary"
                          href="https://bbs.tampermonkey.net.cn/thread-249-1-1.html"
                          target="_blank"
                          icon={<QuestionCircleOutlined />}
                          color="#3874cb"
                        ></Button>
                      </Tooltip>
                      <Tooltip
                        placement="bottom"
                        title={t('compare_code_changes')}
                      >
                        <Button
                          className="!rounded-none"
                          icon={<DiffOutlined />}
                          danger={diff == index}
                          onClick={() => {
                            if (diff == index) {
                              setDiff(-1);
                            }
                            if (diff != -1) {
                              navigate({
                                pathname:
                                  '/script-show-page/' +
                                  script.script?.id +
                                  '/diff',
                                search:
                                  '?version1=' +
                                  list[diff].version +
                                  '&version2=' +
                                  item.version,
                              });
                              return;
                            }
                            setDiff(index);
                          }}
                        ></Button>
                      </Tooltip>
                    </Input.Group>
                  </>
                )}
              </div>
            </Card.Grid>
          </Card>
        )}
      ></List>
    </Card>
  );
}
