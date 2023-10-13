import React, { useImperativeHandle, useState } from 'react';
import { useEffect } from 'react';

let script: HTMLScriptElement;
let codeScript: HTMLScriptElement;
if (typeof document !== 'undefined') {
  const initCode = document.createElement('script');
  initCode.innerHTML = `
    window.callbacks=[];
    window.onInitCodeEditor=(callbacks)=>{
      window.callbacks.push(callbacks);
    }
  `;
  document.head.append(initCode);
  script = document.createElement('script');
  script.src = '/assets/monaco-editor/min/vs/loader.js';
  script.onload = () => {
    codeScript = document.createElement('script');
    codeScript.innerHTML = `const dark = document.querySelector("body.dark") ? true : false;
  require.config({ paths: { vs: "/assets/monaco-editor/min/vs" } });
  window.initCodeEditor = function (id, code, readOnly, diff, diffCode) {
    return new Promise((resolve, reject) => {
      require(["vs/editor/editor.main"], function () {
        let el = document.getElementById("container-" + id);
        if (!el) {
          return;
        }
        el.innerHTML = "";
        el.style.display = "block";
        if(!diff){
        let editor = monaco.editor.create(el, {
          value: code,
          language: "javascript",
          readOnly: readOnly,
          theme: dark ? "vs-dark" : "vs",
        });
        resolve(editor);
      }else{
        let diffEditor = monaco.editor.createDiffEditor(el,{
          readOnly: true,
          theme: dark ? "vs-dark" : "vs",
        });
        let originalModel = monaco.editor.createModel(code, "javascript");
        let modifiedModel = monaco.editor.createModel(diffCode, "javascript");
        diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
        resolve(diffEditor);
      }
      });
    });
  };
  window.callbacks.forEach((callback) => {
    callback();
  });
  window.callbacks = [];
  `;
    document.head.append(codeScript);
  };

  document.head.append(script);
}

type Props = {
  id: string;
  code?: string;
  diffCode?: string;
  readOnly?: boolean;
  diff?: boolean;
};

// 因为服务端渲染的原因,remix不能配置,这里直接加载相关js文件进行导入.需要将monaco-editor的js文件存放在./public/assets/monaco-editor下
const CodeEditor: React.ForwardRefRenderFunction<
  { editor: monaco.editor.IEditor },
  Props
> = ({ id, code, diffCode, readOnly, diff }, ref) => {
  const [_editor, setEditor] = useState<any>(null);
  useImperativeHandle(ref, () => ({
    editor: _editor,
  }));

  useEffect(() => {
    let editor: monaco.editor.ICodeEditor | null = null;
    if (
      typeof window === 'undefined' ||
      typeof (
        window as unknown as {
          initCodeEditor: any;
        }
      ).initCodeEditor === 'undefined'
    ) {
      (
        window as unknown as {
          onInitCodeEditor: (callback: () => void) => void;
        }
      ).onInitCodeEditor(async () => {
        editor = await (
          window as unknown as {
            initCodeEditor: (
              id: string,
              code: string,
              readOnly?: boolean,
              diff?: boolean,
              diffCode?: string
            ) => Promise<monaco.editor.ICodeEditor>;
          }
        ).initCodeEditor(id, code || '', readOnly || false, diff, diffCode);
        setEditor(editor);
      });
    } else {
      (
        window as unknown as {
          initCodeEditor: (
            id: string,
            code: string,
            readOnly: boolean,
            diff?: boolean,
            diffCode?: string
          ) => Promise<monaco.editor.ICodeEditor>;
        }
      )
        .initCodeEditor(id, code || '', readOnly || false, diff, diffCode)
        .then((ret) => {
          editor = ret;
          setEditor(editor);
        });
    }
    return () => {
      editor && editor.dispose();
    };
  }, []);
  return (
    <>
      <div className="h-full">
        <div
          id={'container-' + id}
          className="overflow-hidden"
          style={{ width: '100%', height: '100%', display: 'none' }}
        >
          {code}
        </div>
      </div>
    </>
  );
};
export default React.forwardRef(CodeEditor);
