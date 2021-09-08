<template>
  <div>
    <div class="flex" style="padding-bottom:10px;">
      <q-select
        option-value="version"
        option-label="version"
        emit-value
        map-options
        dense
        outlined
        style="flex:1 1 0"
        v-model="leftversion"
        :options="ScriptList"
      />
      <q-select
        option-value="version"
        option-label="version"
        style="padding:0px 10px;flex:1 1 0"
        emit-value
        dense
        map-options
        outlined
        v-model="rightversion"
        :options="ScriptList"
      />
      <q-btn @click="ToGetScriptDiff" color="primary" label="比对" />
    </div>
    <div v-show="showeditor" style="position:relative">
      <textarea ref="textarea"></textarea>
    </div>
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
      diff: null,
      editor: null,
      differ: null,
      ScriptList: [],
      leftversion: null,
      rightversion: null,
      showeditor: true
    };
  },
  //离开当前页面后执行
  destroyed: function() {
    this.differ.destroy();
  },
  methods: {
    ToGetScriptDiff() {
      if (this.leftversion === this.rightversion) {
        this.$q.notify({
          position: "top-right",
          message: "不能比较相同的源码！",
          position: "top"
        });
        return;
      }
      this.showeditor = true;
      let one = this.get(
        "/scripts/" + this.id + "/versions/" + this.leftversion + "/code"
      );
      let two = this.get(
        "/scripts/" + this.id + "/versions/" + this.rightversion + "/code"
      );

      Promise.all([one, two])
        .then(result => {
          /*this.editor.left.setValue(result[0].data.data.script.code, -1);
          this.editor.right.setValue(result[1].data.data.script.code, -1);*/
          let diff= require("git-diff")
          let difftext = diff(
            "namestruct",
            result[0].data.data.script.code,
            result[1].data.data.script.code,
            { context: 1 }
          );
          this.editor.setValue(difftext);
          this.showeditor = true;
        })
        .catch(error => {
          console.log(error);
        });
    },
    GetScriptHistory() {
      this.get("/scripts/" + this.id + "/versions")
        .then(response => {
          if (response.data.msg === "ok") {

            if (process.env.CLIENT) {
              this.ScriptList = response.data.data;
              this.$nextTick(() => {
                /*let ace = require("ace-builds/src-noconflict/ace");
                ace.config.setModuleUrl(
                  "ace/mode/javascript_worker",
                  require("file-loader!ace-builds/src-noconflict/worker-javascript.js")
                    .default
                );
                let acediff = require("ace-diff");
                require("ace-diff/dist/ace-diff.min.css");
                require("ace-diff/dist/ace-diff-dark.min.css");
                var JavaScriptMode = require("ace-builds/src-noconflict/mode-javascript")
                  .Mode;
                let theme_github = require("ace-builds/src-noconflict/theme-twilight");

                this.differ = new acediff({
                  mode: new JavaScriptMode(),
                  theme: theme_github,

                  element: "#acediff",
                  left: {
                    content: "your first file content here"
                  },
                  right: {
                    content: "your second file content here"
                  }
                });
                this.editor = this.differ.getEditors();
                this.editor.left.getSession().setUseWorker(false);
                this.editor.right.getSession().setUseWorker(false);*/
                //this.Diff  = require('git-diff')
                //this.Diff = require('diff');
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
                /*this.editor.setValue(response.data.data.script.code);
                console.log(this.editor.getScrollInfo());
                let scollinfo = this.editor.getScrollInfo();
                if (scollinfo.height < 1400) {
                  this.editor.setSize(scollinfo.width, scollinfo.height + 100);
                } else {
                  this.editor.setSize(scollinfo.width, 1400);
                }*/
              });
            }
          }
        })
        .catch(error => {});
    }
  },
  created() {
    this.GetScriptHistory();
  }
};
</script>

<style lang="scss" scoped></style>
