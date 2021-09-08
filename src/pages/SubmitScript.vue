<template>
  <div class="page-padding padding-normal page-wrap">
    <div class="show-mess-page">
      <q-card>
        <q-card-section>
          <div>
            <span
              >提交的代码应该准确并详细的描述其脚本功能，不得混淆、加密、尊重版权、并有限制的选择可信任，无危害的外部代码。</span
            >
          </div>
          <div>
            <div class="title-wrap">
              代码
            </div>
            <div>
              <textarea ref="textarea"></textarea>
            </div>
            <div style="margin: 10px 0;">
              <span>或本地上传代码： </span>
              <input
                type="file"
                @change="uploadadded($event)"
                accept="text/javascript,application/javascript"
                id="fileInput"
              />
            </div>
          </div>
          <div>
            <div style="margin:10px 0">
              <span class="title-wrap">附加信息</span
              ><span> 更详细的描述，或者操作说明等</span>
            </div>
            <div>
              <div id="editor"></div>
            </div>
          </div>
          <div>
            <div style="margin:10px 0">
              <span class="title-wrap">脚本类型</span>
            </div>
            <div>
              <div>
                <q-radio
                  v-model="scripttype"
                  val="1"
                  label="脚本，允许被用户所安装并使用"
                />
              </div>

              <div>
                <q-radio
                  v-model="scripttype"
                  val="2"
                  label="库脚本，只允许被其他脚本进行引用，不允许被用户安装"
                />
              </div>
            </div>
          </div>
          <div v-show="scripttype === '2'">
            <div style="margin:10px 0">
              <span class="title-wrap">库声明文件</span>
            </div>
            <div>
              <span>关闭</span>
              <q-toggle @input='ChangeDtsEditor' v-model="startdefined" label="启用" />
            </div>
            <div v-show="startdefined">
              <div>
                <textarea ref="dtstext"></textarea>
              </div>
            </div>
          </div>
          <div>
            <div style="margin:10px 0">
              <span class="title-wrap">脚本访问权限</span>
            </div>
            <div>
              <span>公开</span>
              <q-toggle
                v-model="publiccontrol"
                false-value="1"
                true-value="2"
                label="非公开"
              />
            </div>
          </div>
          <div>
            <div style="margin:10px 0">
              <span class="title-wrap">不适内容</span>
            </div>
            <div>
              <q-checkbox
                v-model="righttext"
                :true-value="1"
                :false-value="0"
                label="该网站可能存在令人不适内容，包括但不限于红蓝闪光频繁闪烁、对视觉、精神有侵害的内容。"
              />
            </div>
          </div>
          <div>
            <!-- <div style="margin:10px 0">
              <span class="title-wrap">脚本语言</span>
              <span>将匹配 @name、@description 以及第一个附加信息的语言。</span>
            </div>
            <div>
                <q-select outlined v-model="model" :options="options" label="脚本语言" />

            </div>-->
            <div>
              <q-btn color="primary" @click="SubmitScript" label="发布脚本" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      editor: null,
      mkedit: null,
      scripttype: "1",
      righttext: 0,
      publiccontrol: "1",
      startdefined: false,
      dtseditor: null
    };
  },
  destroyed: function() {
    //this.editor.destroy();
    this.editor.setValue("");
    this.editor.clearHistory();
    this.editor.toTextArea();
    this.editor = null;
    this.dtseditor.setValue("");
    this.dtseditor.clearHistory();
    this.dtseditor.toTextArea();
    this.dtseditor = null;
    this.mkedit.destroy();
  },
  created() {
    if (process.env.CLIENT) {
      this.$nextTick(() => {
        var codeMirror = require("codemirror");
        require("codemirror/lib/codemirror.css");
        require("codemirror/mode/javascript/javascript");
        // require("codemirror/theme/darcula.css");
        require("codemirror/theme/base16-light.css");
        this.editor = codeMirror.fromTextArea(this.$refs.textarea, {
          //readOnly: true,//只读
          lineWrapping: true,
          mode: "javascript",
          theme: "base16-light", // 主日样式
          styleActiveLine: true, // 当前行高亮
          lineNumbers: true // 显示行号
        });
        //this.editor.setValue(response.data.data.script.code);
        //console.log(this.editor.getScrollInfo());
        let scollinfo = this.editor.getScrollInfo();
        this.editor.setSize(scollinfo.width, 400);

        this.dtseditor = codeMirror.fromTextArea(this.$refs.dtstext, {
          //readOnly: true,//只读
          lineWrapping: true,
          mode: "javascript",
          theme: "base16-light", // 主日样式
          styleActiveLine: true, // 当前行高亮
          lineNumbers: true // 显示行号
        });

        let dtscollinfo = this.dtseditor.getScrollInfo();
        this.dtseditor.setSize(dtscollinfo.width, 400);
      });
    }
    if (process.env.CLIENT) {
      this.$nextTick(() => {
        require("@toast-ui/editor/dist/toastui-editor.css");
        const Editor = require("@toast-ui/editor");
        this.mkedit = new Editor({
          el: document.querySelector("#editor"),
          previewStyle: "tab",
          height: "400px",
          hooks: {
            addImageBlobHook: (blob, callback) => {
              const uploadedImageURL = uploadImage(blob);
              callback(uploadedImageURL, "alt text");
              return false;
            }
          }
        });
        //this.viewr.setMarkdown(this.author.content);
      });
    }
  },
  methods: {
      ChangeDtsEditor(event){
         // console.log('ChangeDtsEditor',event)
          if(event===true){
              this.dtseditor.refresh()
          }
         // console.log('this.dtseditor',this.dtseditor)
      },
    SubmitScript() {
      let codetext = this.editor.getValue();
      let marktext = this.mkedit.getMarkdown();
      let typetext='';
      if(this.scripttype==='2'){
          typetext=this.dtseditor.getValue();
      }



      this.post("/scripts", {
        description: marktext,
        code: codetext,
        type: this.scripttype,
        definition: typetext,
        public:this.publiccontrol
      })
        .then(response => {
          console.log(response, "response");
          if (response.data.code === 0) {

          }
        })
        .catch(error => {});
    },
    uploadadded(e) {
      let files = e.target.files;
      if (files.length > 0) {
        let file = files[0];
        console.log("fileold", file);
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = () => {
          let result = reader.result;
          console.log("result", result);
          this.editor.setValue(result);
          e.target.value = "";

          // this.$refs.clearFile.removeQueuedFiles();
        };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  margin-bottom: 20px;
  margin-top: 20px;
}
.title-wrap {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
