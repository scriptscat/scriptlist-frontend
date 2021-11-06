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
    <div v-if="showtext!==''" class="border" v-html="showtext">

    </div>
  </div>
</template>

<script>
export default {
    meta() {
    return {
      title: '历史',
    };
  },
  computed: {
    id() {
      return this.$route.params.id;
    }
  },
  data() {
    return {
      diff: null,
      showtext:'',
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
      console.log('this.leftversion',this.leftversion,this.rightversion);
      this.showeditor = true;
            this.get("/scripts/"+this.id+"/diff/"+this.leftversion+"/"+this.rightversion)
        .then(response => {
          if (response.data.msg === "ok") {
            if (process.env.CLIENT) {
              
              let text=response.data.data.diff
              text=text.replace(/style="background:#ffe6e6;"/g,'class="Red-Diff"')
              text=text.replace(/style="background:#e6ffe6;"/g,'class="Green-Diff"')
              text=text.replace(/<strong>/g,'<span>')
              text=text.replace(/<\/strong>/g,'</span>')
              this.showtext=text
            }
          }
        })
        .catch(error => {});

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

<style lang="scss" scoped>
::v-deep .Red-Diff{
  color: #BB0000;
  background-color: #FFEEEE;
}
::v-deep .Green-Diff{
    color: #008800;
    background-color: #DDFFDD;
    text-decoration: none;

}
.border{
  background-color: #F6F6F6;
border-width: 1px;
border-style: solid;
padding: 4.7px;
border-color: #cbcbcb;
border-radius: 5px;
}
</style>
