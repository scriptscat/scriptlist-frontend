import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Avatar,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Empty,
  Flex,
  List,
  message,
  Rate,
  Skeleton,
  Space,
  theme,
  Typography,
} from 'antd';
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  cheakAdminRole,
  checkScriptManageRole,
  formatDate,
  useDark,
} from '~/utils/utils';
import MarkdownView, { markdownViewLinks } from '~/components/MarkdownView';
import {
  DeleteScore,
  GetMyScore,
  ScoreList,
  submitCommentReply,
  SubmitScore,
} from '~/services/scripts/api';
import type { ScoreItem } from '~/services/scripts/types';
import { ScriptContext, UserContext } from '~/context-manager';
import ActionMenu from '~/components/ActionMenu';
import { useTranslation } from 'react-i18next';
import TextArea from '~/components/TextArea';
import { CloseOutlined, MessageOutlined } from '@ant-design/icons';

export const links: LinksFunction = () => [...markdownViewLinks()];

type LoaderData = {
  id: number;
  list: ScoreItem[];
  total: number;
  myScore: ScoreItem;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const id = parseInt(params.id as string);
  const list = await ScoreList(id, undefined, request);
  const my = await GetMyScore(id, request);
  return json({
    id: id,
    list: list.data.list,
    total: list.data.total,
    myScore: my,
  } as LoaderData);
};

const AuthorReply: React.FC<{
  setReplayOpen: (id: number, status: boolean) => void;
  defaultText: string;
  id: number;
  commentID: number;
  setData: (commentID: number, authorMessage: string) => void;
}> = function ({ setData, setReplayOpen, defaultText, id, commentID }) {
  const { t } = useTranslation();
  const [text, setText] = useState(defaultText);
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    submitCommentReply(id, commentID, text)
      .then((resp) => {
        setLoading(false);
        if (resp.code === 0) {
          setData(commentID, text);
          message.success(t('reply_success'));
          setReplayOpen(commentID, false);
        } else {
          message.error(resp.msg);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <div className="mt-2">
        <TextArea
          maxLength={200}
          showCount
          style={{
            height: 80,
          }}
          value={text}
          onChange={(v) => {
            setText(v.target.value);
          }}
          placeholder={t('write_commene_reply')}
        />
      </div>
      <div className="flex justify-end mt-6">
        <Space>
          <Button
            onClick={() => setReplayOpen(commentID, false)}
            icon={<CloseOutlined />}
            size="small"
          >
            {t('cancel')}
          </Button>
          <Button
            loading={loading}
            size="small"
            onClick={() => submit()}
            icon={<MessageOutlined />}
            type="primary"
          >
            {t('reply')}
          </Button>
        </Space>
      </div>
    </>
  );
};

export default function Comment() {
  const loaderData = useLoaderData<LoaderData>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(loaderData.list);
  const [total, setTotal] = useState(loaderData.total);
  const [page, setPage] = useState(1);
  const user = useContext(UserContext);
  const script = useContext(ScriptContext);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [score, setScore] = useState(
    (loaderData.myScore && loaderData.myScore.score / 10) || 5
  );
  const [scoreMessage, setScoreMessage] = useState(
    loaderData.myScore && loaderData.myScore.message
  );
  const [replyListObj, setReplyListObj] = useState<{
    [key: number]: boolean;
  }>({});
  //换页清空回复选中项
  useEffect(() => {
    setReplyListObj({});
  }, [page]);
  const setReplyDialog = (id: number, status: boolean) => {
    setReplyListObj(prevState =>({
      ...prevState,
      [id]: status,
    }));
  };
  const { t } = useTranslation();
  const replyRole =
    cheakAdminRole(user.user) ||
    checkScriptManageRole(user.user, script.script);
  const setReplyData = (commentID: number, authorMessage: string) => {
    const item = data.find((item) => item.id == commentID);
    if (item == undefined) {
      return;
    }
    setData((preData)=>[
      ...preData.map((item) => {
        if (item.id != commentID) {
          return {
            ...item,
          };
        }
        return {
          ...item,
          author_message: authorMessage,
        };
      }),
    ]);
  };
  const onSubmit = async () => {
    setSubmitLoading(true);
    const resp = await SubmitScore(loaderData.id, scoreMessage, score * 10);
    setSubmitLoading(false);
    if (resp.code === 0) {
      message.success(t('comment_success'));
      for (let i = 0; i < data.length; i++) {
        if (data[i].user_id === user.user?.user_id) {
          data[i].score = score * 10;
          data[i].message = scoreMessage;
          setData([...data]);
          return;
        }
      }
      setData([
        {
          id: 0,
          user_id: user.user!.user_id,
          username: user.user!.username,
          avatar: user.user!.avatar,
          score: score * 10,
          message: scoreMessage,
          createtime: new Date().getTime() / 1000,
          author_message: '',
        },
        ...data,
      ]);
    } else {
      message.error(resp.msg);
    }
    setSubmitLoading(false);
  };

  const loadMoreData = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const list = await ScoreList(loaderData.id, { page: page + 1 });
    setData([...data, ...list.list]);
    setLoading(false);
    setPage((page) => page + 1);
  };

  return (
    <Card>
      <Space className="w-full" direction="vertical">
        <Card title={t('write_comment')}>
          {user.user && (
            <TextArea
              showCount
              maxLength={100}
              style={{
                height: 120,
              }}
              value={scoreMessage}
              onChange={(v) => {
                setScoreMessage(v.target.value);
              }}
              placeholder={t('write_comment_placeholder')}
            />
          )}
          {!user.user && (
            <Empty className="border-t" description={t('login_to_comment')}>
              <Button
                type="primary"
                onClick={() => {
                  const btn = document.querySelector(
                    '#go-to-login'
                  ) as HTMLButtonElement;
                  btn.click();
                }}
              >
                {t('login')}
              </Button>
            </Empty>
          )}
          <Card.Meta
            className="!mt-2 justify-end"
            title={
              <Rate
                defaultValue={score}
                onChange={(value) => setScore(value)}
                tooltips={[
                  t('rate_1'),
                  t('rate_2'),
                  t('rate_3'),
                  t('rate_4'),
                  t('rate_5'),
                ]}
              />
            }
          />
          <Card.Meta
            className="!mt-2 justify-end"
            title={
              <Button
                type="primary"
                loading={submitLoading}
                onClick={onSubmit}
                disabled={user.user ? false : true}
              >
                {t('commit_comment')}
              </Button>
            }
          />
        </Card>
        <Card title={t('user_scores')}>
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreData}
            hasMore={data.length < total}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={<Divider plain>{t('all_comments_loaded')}</Divider>}
            scrollableTarget="scrollableDiv"
          >
            <ConfigProvider
              renderEmpty={() => <Empty description={t('no_scores_yet')} />}
            >
              <List
                dataSource={data}
                renderItem={(item, index) => (
                  <List.Item key={item.id} className="!block !px-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-row items-center gap-2">
                          <Link to={'/users/' + item.user_id} target="_blank">
                            <Avatar src={item.avatar} />
                          </Link>
                          <div className="flex flex-col">
                            <Link to={'/users/' + item.user_id} target="_blank">
                              {item.username}
                            </Link>
                            <span className="text-xs text-gray-400">
                              {formatDate(item.createtime)}
                            </span>
                          </div>
                          <Rate
                            value={item.score / 10}
                            disabled
                            allowHalf
                          ></Rate>
                        </div>
                        <ActionMenu
                          uid={item.user_id}
                          deleteLevel="super_moderator"
                          allowSelfDelete={false}
                          onDeleteClick={async () => {
                            const resp = await DeleteScore(
                              script.script!.id,
                              item.id
                            );
                            if (resp.code == 0) {
                              message.success('删除成功');
                              data.splice(index, 1);
                              setData([...data]);
                              setTotal((total) => total - 1);
                            } else {
                              message.error(resp.msg);
                            }
                          }}
                        >
                          <Button type="link">{t('action')}</Button>
                        </ActionMenu>
                      </div>
                      <MarkdownView
                        id={'score-' + item.id}
                        content={item.message}
                      ></MarkdownView>
                    </div>
                    {replyListObj[item.id] != true &&
                    (item?.author_message ?? '') !== '' ? (
                      <div className="ml-4 mt-2">
                        <span>{t('author_reply')} : </span>
                        <span>{item.author_message}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-end">
                      {replyRole && replyListObj[item.id] !== true ? (
                        <Button
                          onClick={() => setReplyDialog(item.id, true)}
                          icon={<MessageOutlined />}
                          type="link"
                        >
                          {t('reply')}
                        </Button>
                      ) : null}
                    </div>
                    {replyListObj[item.id] ? (
                      <div>
                        <AuthorReply
                          setData={setReplyData}
                          setReplayOpen={setReplyDialog}
                          defaultText={item.author_message}
                          id={loaderData.id}
                          commentID={item.id}
                        ></AuthorReply>
                      </div>
                    ) : null}
                  </List.Item>
                )}
              />
            </ConfigProvider>
          </InfiniteScroll>
        </Card>
      </Space>
    </Card>
  );
}
