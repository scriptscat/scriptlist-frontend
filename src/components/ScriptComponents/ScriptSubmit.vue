<template>
  <div>
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
    <div v-if="id !== undefined">
      <div style="margin:10px 0">
        <span class="title-wrap">更新记录</span>
      </div>
      <q-input
        outlined
        v-model="changelog"
        label="更新记录"
        style="margin-bottom:10px"
        counter
        maxlength="128"
        dense
      >
      </q-input>
    </div>
    <div v-show="id === undefined">
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
            label="订阅脚本，仅会在安装时弹出安装界面由用户确认订阅，后续的更新采用静默更新的方式"
          />
        </div>

        <div>
          <q-radio
            v-model="scripttype"
            val="3"
            label="库脚本，只允许被其他脚本进行引用，不允许被用户安装"
          />
        </div>
      </div>
    </div>
    <div v-show="scripttype === '3'">
      <div style="margin:10px 0">
        <span class="title-wrap">库声明文件</span>
      </div>
      <q-input
        outlined
        v-model="dtsname"
        label="库名字"
        style="margin-bottom:10px"
        counter
        maxlength="128"
        dense
      >
      </q-input>
      <q-input
        outlined
        v-model="dtsdescription"
        label="库描述"
        counter
        maxlength="256"
        dense
      >
      </q-input>
      <div style="margin:10px 0">
        <span class="title-wrap">启用库编辑框</span>
      </div>
      <div>
        <span>关闭</span>
        <q-toggle
          @input="ChangeDtsEditor"
          v-model="startdefined"
          label="启用"
        />
      </div>
      <div v-if="startdefined">
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
          :false-value="2"
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
        <q-btn
          color="primary"
          :loading="loading.publicloading"
          @click="SubmitScript"
          label="发布脚本"
        >
        </q-btn>
      </div>
    </div>
        <q-dialog v-model="control.success" @hide="CloseThisPage">
      <q-card style="width:90%;">
        <q-card-section>
          <div class="text-h6">提示</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          您的脚本已发布成功！
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="确定" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { baseURL } from 'src/utils/axios';
export default {
  props: {
    id: {
      type: String | Number,
      default: undefined
    }
  },
  data() {
    return {
      control: {
        success: false
      },
      loading: {
        publicloading: false
      },
      changelog: "",
      editor: null,
      mkedit: null,
      scripttype: "1",
      righttext: 2,
      publiccontrol: "1",
      startdefined: false,
      dtseditor: null,
      dtsvalue: "",
      codeMirror: null,
      dtsname: "",
      dtsdescription: "",
      publicid: ""
    };
  },
  destroyed: function() {
    //this.editor.destroy();
    this.editor.setValue("");
    this.editor.clearHistory();
    this.editor.toTextArea();
    this.editor = null;
    if (this.dtseditor !== null) {
      this.dtseditor.setValue("");
      this.dtseditor.clearHistory();
      this.dtseditor.toTextArea();
      this.dtseditor = null;
    }
    this.mkedit.remove();
  },
  created() {
    if (process.env.CLIENT) {
      this.id = this.$route.query.id;
      this.$nextTick(() => {
        this.codeMirror = require("codemirror");
        require("codemirror/lib/codemirror.css");
        require("codemirror/mode/javascript/javascript");
        // require("codemirror/theme/darcula.css");
        require("codemirror/theme/base16-light.css");
        this.editor = this.codeMirror.fromTextArea(this.$refs.textarea, {
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
        if (this.id !== undefined) {
          this.GetScriptData();
        }
      });
    }
    if (process.env.CLIENT) {
      this.$nextTick(() => {
        require("@toast-ui/editor/dist/toastui-editor.css");
        const Editor = require("@toast-ui/editor").default;
        this.mkedit = new Editor({
          el: document.querySelector("#editor"),
          previewStyle: "tab",
          height: "400px",
          hooks: {
            addImageBlobHook: async (blob, callback) => {
              const uploadedImageURL = await this.uploadImage(blob);
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
    GetScriptData() {
      this.get("/scripts/" + this.id + "/code")
        .then(response => {
          console.log(response, "response");
          if (response.data.code === 0) {
            this.editor.setValue(response.data.data.script.code);
            this.mkedit.setMarkdown(response.data.data.content);
            //this.dtseditor.setValue();
            this.scripttype = response.data.data.type + ""; //脚本类型
            this.publiccontrol = response.data.data.public + ""; //公开/非公开
            this.righttext = response.data.data.unwell;
            this.dtsname = response.data.data.name;
            let define = response.data.data.description;
            if (define !== undefined) {
              this.dtsvalue = define;
              this.startdefined = true;
              this.ChangeDtsEditor(true);
            }
            this.dtsdescription = response.data.data.description;
          }
        })
        .catch(error => {});
    },
    uploadImage(blob) {
      return new Promise((resolve, reject) => {
        console.log("blob", blob);
        var formData = new FormData();
        formData.append("image", blob);
        formData.append("comment", "script");

        this.post("/resource/image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
          .then(response => {
            if (response.data.code === 0) {
              resolve(
                baseURL + "/resource/image/" +
                  response.data.data.id
              );
            }
          })
          .catch(error => {
            if (error.response.data.msg !== undefined) {
              this.$q.notify({
                position: "top-right",
                message: error.response.data.msg,
                position: "top"
              });
            } else {
              this.$q.notify({
                position: "top-right",
                message: "系统错误！",
                position: "top"
              });
            }
            resolve("error");
          });
      });
    },
    CloseThisPage() {
      window.location.pathname = "/script-show-page/" + this.publicid;
    },
    ChangeDtsEditor(event) {
      // console.log('ChangeDtsEditor',event)
      this.$nextTick(() => {
        if (event === true) {
          this.dtseditor = this.codeMirror.fromTextArea(this.$refs.dtstext, {
            //readOnly: true,//只读
            lineWrapping: true,
            mode: "javascript",
            theme: "base16-light", // 主日样式
            styleActiveLine: true, // 当前行高亮
            lineNumbers: true // 显示行号
          });
          this.dtseditor.setValue(this.dtsvalue);
          let dtscollinfo = this.dtseditor.getScrollInfo();
          this.dtseditor.setSize(dtscollinfo.width, 400);
        } else {
          this.dtsvalue = this.dtseditor.getValue();
          this.dtseditor.setValue("");
          this.dtseditor.clearHistory();
          this.dtseditor.toTextArea();
          this.dtseditor = null;
        }
      });

      // console.log('this.dtseditor',this.dtseditor)
    },
    SubmitScript() {
      let codetext = this.editor.getValue();
      let marktext = this.mkedit.getMarkdown();
      let typetext = "";
      if (this.scripttype === "3") {
        typetext = this.dtseditor.getValue();
      }
      if (this.id !== undefined) {
        this.loading.publicloading = true;

        this.put("/scripts/" + this.id + "/code", {
          content: marktext,
          code: codetext,
          definition: typetext,
          changelog: this.changelog,
          public: this.publiccontrol,
          unwell: this.righttext,

          name: this.dtsname,
          description: this.dtsdescription
        })
          .then(response => {
            this.loading.publicloading = false;
            console.log(response, "response");
            if (response.data.code === 0) {
              this.publicid = this.id;
              this.control.success = true;
            }
          })
          .catch(error => {
            this.loading.publicloading = false;
            console.log("error", error);
            if (error.response.data.msg !== undefined) {
              this.$q.notify({
                position: "top-right",
                message: error.response.data.msg,
                position: "top"
              });
            } else {
              this.$q.notify({
                position: "top-right",
                message: "系统错误！",
                position: "top"
              });
            }
          });
      } else {
        this.loading.publicloading = true;

        this.post("/scripts", {
          content: marktext,
          code: codetext,
          type: this.scripttype,
          public: this.publiccontrol,
          unwell: this.righttext,

          definition: typetext,
          name: this.dtsname,
          description: this.dtsdescription
        })
          .then(response => {
            this.loading.publicloading = false;
            console.log(response, "response");
            if (response.data.code === 0) {
              this.publicid = response.data.data.id;
              this.control.success = true;
            }
          })
          .catch(error => {
            this.loading.publicloading = false;
            console.log("error", error);
            if (error.response.data.msg !== undefined) {
              this.$q.notify({
                position: "top-right",
                message: error.response.data.msg,
                position: "top"
              });
            } else {
              this.$q.notify({
                position: "top-right",
                message: "系统错误！",
                position: "top"
              });
            }
          });
      }
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
.title-wrap {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
