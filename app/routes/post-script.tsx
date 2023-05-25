import type { V2_MetaFunction} from '@remix-run/react';
import { useNavigate } from '@remix-run/react';
import { Card, message } from 'antd';
import UpdateScript from '~/components/UpdateScript';
import { CreateScript } from '~/services/scripts/api';

export const meta: V2_MetaFunction = () => [
  { title: '提交新的脚本 - ScriptCat' },
  { description: '脚本猫脚本站,在这里你可以与全世界分享你的用户脚' },
  { keyword: 'ScriptCat UserScript 用户脚本' },
];

export default function PostScript() {
  const navigate = useNavigate();
  return (
    <>
      <Card>
        <UpdateScript
          onSubmit={async (params) => {
            const resp = await CreateScript(params);
            if (resp.code !== 0) {
              message.error(resp.msg);
              return false;
            }
            message.success('提交成功');
            navigate({
              pathname: '/script-show-page/' + resp.data.id,
            });
            return true;
          }}
        />
      </Card>
    </>
  );
}
