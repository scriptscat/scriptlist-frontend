import { Card } from 'antd';
import { useEffect } from 'react';
import { useContext, useState } from 'react';
import MarkdownView from '~/components/MarkdownView';
import SearchItem from '~/components/Search/SearchList/item';
import { ScriptContext } from '~/context-manager';
import { ScriptState } from '~/services/scripts/api';
import type { WatchLevel as WatchLevelType } from '~/services/scripts/types';

export default function Index() {
  const script = useContext(ScriptContext);
  const [watch, setWatch] = useState<WatchLevelType>(0);
  useEffect(() => {
    if (script.script) {
      ScriptState(script.script.id).then((resp) => {
        setWatch(resp.data.watch);
      });
    }
  }, [script.script]);
  if (!script.script) {
    return <div>脚本不存在</div>;
  }
  return (
    <>
      <SearchItem
        script={script.script}
        action
        watch={watch}
        onWatch={(level) => {
          setWatch(level);
        }}
      ></SearchItem>
      <Card>
        <MarkdownView content={script.script.content || ''} id={'readme'} />
      </Card>
    </>
  );
}
