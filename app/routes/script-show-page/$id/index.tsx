import { Card } from 'antd';
import { useContext } from 'react';
import MarkdownView from '~/components/MarkdownView';
import SearchItem from '~/components/Search/SearchList/item';
import { ScriptContext } from '~/context-manager';

export default function Index() {
  const context = useContext(ScriptContext);
  if (!context.script) {
    return <div>脚本不存在</div>;
  }
  return (
    <>
      <SearchItem script={context.script} action></SearchItem>
      <Card>
        <MarkdownView content={context.script.content || ''} id={'readme'} />
      </Card>
    </>
  );
}
