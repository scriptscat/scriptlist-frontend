<template>
  <div class="code-wrap">
    <textarea ref="textarea"></textarea>
  </div>
</template>

<script>
export default {
  computed: {
    id() {
      return this.$route.params.id;
    }
  },
  data() {
    return {
      editor: null
    };
  },
  //离开当前页面后执行
  destroyed: function() {
    //this.editor.destroy();
    this.editor.setValue("");
    this.editor.clearHistory();
    this.editor.toTextArea();
    this.editor=null;
  },
  methods: {
    GetScriptCode() {
      this.get("/scripts/" + this.id + "/code")
        .then(response => {
          console.log(response, "response");
          if (response.data.msg === "ok") {
            if (process.env.CLIENT) {
              this.$nextTick(() => {
                /*let ace = require("ace-builds/src-noconflict/ace");
                ace.config.setModuleUrl(
                  "ace/mode/javascript_worker",
                  require("file-loader!ace-builds/src-noconflict/worker-javascript.js")
                    .default
                );
                this.editor = ace.edit("editor"); //创建
                this.editor.setValue(response.data.data.script.code, -1);
                let JavaScriptMode = require("ace-builds/src-noconflict/mode-javascript")
                  .Mode;
                this.editor.session.setMode(new JavaScriptMode());
                let theme_github = require("ace-builds/src-noconflict/theme-twilight");
                this.editor.setTheme(theme_github);
                this.editor;
                this.editor.setReadOnly(true); //只读
                let lines = this.editor
                  .getSession()
                  .getDocument()
                  .getLength(); //获取代码行数

                this.editor.setOption("maxLines", 100); //最大为100
                this.editor.setOption("highlightGutterLine", false);
                this.editor.setOption("wrap", true);
                this.editor.getSession().setUseWorker(false);
                this.editor.setOption("minLines", lines + 2); //最小为行数+2*/

                var codeMirror = require("codemirror");
                require("codemirror/lib/codemirror.css");
                require("codemirror/mode/javascript/javascript");
                require("codemirror/theme/darcula.css");
                this.editor = codeMirror.fromTextArea(this.$refs.textarea, {
                  readOnly: true,
                  lineWrapping: true,
                  mode: "javascript",
                  theme: "darcula", // 主日样式
                  styleActiveLine: true, // 当前行高亮
                  lineNumbers: true // 显示行号
                });
                this.editor.setValue(response.data.data.script.code);
                console.log(this.editor.getScrollInfo());
                let scollinfo = this.editor.getScrollInfo();
                if (scollinfo.height < 1400) {
                  this.editor.setSize(scollinfo.width, scollinfo.height + 100);
                } else {
                  this.editor.setSize(scollinfo.width, 1400);
                }
              });
            }
          }
        })
        .catch(error => {});
    }
  },
  created() {
    this.GetScriptCode();
  }
};
</script>

<style lang="scss" scoped>
.code-wrap {
  ::v-deep .CodeMirror {
    height: 0px;
  }
}
</style>
