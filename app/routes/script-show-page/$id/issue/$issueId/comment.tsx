import {
  InfoCircleTwoTone,
  CheckCircleTwoTone,
  UserOutlined,
} from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Card, Tag, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { formatDate } from 'utils/utils';
import MarkdownView from '~/components/MarkdownView';
import { GetIssue, IssueCommentList } from '~/services/scripts/issues/api';
import type { Issue, IssueComment } from '~/services/scripts/issues/types';

type LoaderData = {
  issue: Issue;
  comments: IssueComment[];
};

export const loader: LoaderFunction = async ({ params }) => {
  const issue = await GetIssue(
    parseInt(params.id as string),
    parseInt(params.issueId as string)
  );
  if (!issue) {
    throw new Response('反馈不存在', { status: 404, statusText: 'Not Found' });
  }
  const commentList = await IssueCommentList(
    parseInt(params.id as string),
    parseInt(params.issueId as string)
  );
  return json({
    issue: issue,
    comments: commentList,
  } as LoaderData);
};

export default function Comment() {
  const data = useLoaderData<LoaderData>();
  return (
    <Card>
      <div className="flex flex-col gap-2">
        <span className="text-2xl">{data.issue.title}</span>
        <div className="flex flex-row items-center">
          {data.issue.status === 1 ? (
            <Tag
              icon={<InfoCircleTwoTone className="!align-baseline" />}
              color="blue"
            >
              待处理
            </Tag>
          ) : (
            <Tag
              icon={
                <CheckCircleTwoTone
                  className="!align-baseline"
                  twoToneColor="#52c41a"
                />
              }
              color="green"
            >
              已处理
            </Tag>
          )}
          <Tooltip title="点击复制链接">
            <Tag>#{data.issue.id}</Tag>
          </Tooltip>
          <UserOutlined className="mr-1 !text-gray-400 " />
          <Link
            to={'/users/' + data.issue.uid}
            target="_blank"
            className="text-gray-400 hover:text-gray-500 mr-1"
          >
            {data.issue.username}
          </Link>
          <span className="text-sm text-gray-400">
            创建于 {formatDate(data.issue.createtime)}
          </span>
        </div>
        <MarkdownView id="issue" content={data.issue.content}></MarkdownView>
      </div>
    </Card>
  );
}
