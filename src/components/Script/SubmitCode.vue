<template>
  <div>
    <div>
      <span
        >提交的代码应该准确并详细的描述其脚本功能，不得混淆、加密、尊重版权、并有限制的选择可信任，无危害的外部代码。</span
      >
    </div>
    <div>
      <div class="title-wrap">代码</div>
      <div>
        <textarea ref="textarea"></textarea>
      </div>
      <div style="margin: 10px 0">
        <span>或本地上传代码:</span>
        <input
          type="file"
          @change="uploadCode($event)"
          accept="text/javascript,application/javascript"
          id="fileInput"
        />
      </div>
    </div>
    <div>
      <div style="margin: 10px 0">
        <span class="title-wrap">附加信息</span
        ><span> 更详细的描述，或者操作说明等</span>
      </div>
      <div>
        <div ref="mkedite"></div>
      </div>
    </div>
    <div v-if="id">
      <div style="margin: 10px 0">
        <span class="title-wrap">更新记录</span>
      </div>
      <q-input
        outlined
        v-model="changelog"
        type="textarea"
        label="更新记录"
        style="margin-bottom: 10px"
        rows="7"
        dense
      >
      </q-input>
    </div>
    <div v-show="!id">
      <div style="margin: 10px 0">
        <span class="title-wrap">脚本类型</span>
      </div>
      <div>
        <div>
          <q-radio
            v-model="scripttype"
            :val="1"
            label="脚本，允许被用户所安装并使用"
          />
        </div>
        <div>
          <q-radio
            v-model="scripttype"
            :val="2"
            label="订阅脚本，仅会在安装时弹出安装界面由用户确认订阅，后续的更新采用静默更新的方式"
          />
        </div>

        <div>
          <q-radio
            v-model="scripttype"
            :val="3"
            label="库脚本，只允许被其他脚本进行引用，不允许被用户安装"
          />
        </div>
      </div>
    </div>
    <div v-show="scripttype === 3">
      <div style="margin: 10px 0">
        <span class="title-wrap">库声明文件</span>
      </div>
      <q-input
        outlined
        v-model="dtsname"
        label="库名字"
        style="margin-bottom: 10px"
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
      <div style="margin: 10px 0">
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
      <div style="margin: 10px 0">
        <span class="title-wrap">脚本访问权限</span>
      </div>
      <div>
        <span>公开</span>
        <q-toggle
          v-model="publiccontrol"
          :false-value="1"
          :true-value="2"
          label="非公开"
        />
      </div>
    </div>
    <div>
      <div style="margin: 10px 0">
        <span class="title-wrap">不适内容</span>
      </div>
      <div>
        <q-checkbox
          v-model="unwell"
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
      <q-card style="width: 90%">
        <q-card-section>
          <div class="text-h6">提示</div>
        </q-card-section>

        <q-card-section class="q-pt-none"> 您的脚本已发布成功! </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="确定" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  getScriptInfo,
  submitScript,
  updateScriptCode,
} from 'src/apis/scripts';
import { uploadImage as uploadImageApi } from 'src/apis/resource';
import http from 'src/utils/http';
import { AxiosError } from 'axios';
import { useMeta } from 'quasar';
import { toastui } from '@toast-ui/editor';
const CodeMirror = async () => await import('codemirror');
const Editor = async () => await import('@toast-ui/editor');
const codeSyntaxHighlight = async () =>
  await import('@toast-ui/editor-plugin-code-syntax-highlight');
import Prism from 'prismjs';

if (process.env.CLIENT) {
  require('prismjs/themes/prism.css');
  require('@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css');

  require('codemirror/lib/codemirror.css');
  require('codemirror/mode/javascript/javascript');
  require('codemirror/theme/base16-light.css');
  require('@toast-ui/editor/dist/toastui-editor.css');
}

const editor = <
  {
    editor?: CodeMirror.EditorFromTextArea;
    dtseditor?: CodeMirror.EditorFromTextArea;
    mkedit?: toastui.Editor;
  }
>{
  editor: undefined,
  dtseditor: undefined,
  mkedit: undefined,
};

export default defineComponent({
  name: 'SubmitCode',
  props: {
    id: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      default: '',
    },
  },
  setup() {
    useMeta({
      title: '提交新的脚本',
    });
    return {};
  },
  data() {
    return {
      control: {
        success: false,
      },
      loading: {
        publicloading: false,
      },
      changelog: '',
      scripttype: <DTO.ScriptType>1,
      unwell: <DTO.ScriptUnwell>2,
      publiccontrol: <DTO.ScriptPublic>1,
      startdefined: false,
      dtsname: '',
      dtsvalue: '',
      codeMirror: null,
      dtsdescription: '',
      publicid: 0,
    };
  },
  unmounted() {
    // 释放编辑器资源
    if (editor.editor) {
      editor.editor.setValue('');
      editor.editor.toTextArea();
      editor.editor = undefined;
      if (editor.dtseditor) {
        editor.dtseditor.setValue('');
        editor.dtseditor.toTextArea();
        editor.dtseditor = undefined;
      }
      if (editor.mkedit) {
        editor.mkedit = undefined;
      }
    }
  },
  created() {
    if (process.env.CLIENT) {
      void this.$nextTick(() => {
        let handler = async () => {
          editor.editor = (await CodeMirror()).default.fromTextArea(
            <HTMLTextAreaElement>this.$refs.textarea,
            {
              //readOnly: true,//只读
              lineWrapping: true,
              mode: 'javascript',
              theme: 'base16-light', // 主日样式
              lineNumbers: true, // 显示行号
            }
          );
          let scollinfo = editor.editor.getScrollInfo();
          editor.editor.setSize(scollinfo.width, 400);
          if (this.id) {
            this.GetScriptData();
          }

          editor.mkedit = new (await Editor()).default({
            el: <HTMLElement>this.$refs.mkedite,
            initialValue: this.content,
            previewStyle: 'tab',
            height: '400px',
            hooks: {
              addImageBlobHook: async (blob, callback) => {
                const uploadedImageURL = await this.uploadImage(blob);
                callback(uploadedImageURL, 'alt text');
                return false;
              },
            },
            plugins: [
              [(await codeSyntaxHighlight()).default, { highlighter: Prism }],
            ],
            autofocus: false,
          });
        };
        void handler();
      });
    }
  },
  methods: {
    GetScriptData() {
      getScriptInfo(this.id, true)
        .then((response) => {
          if (response.data.code === 0 && editor.editor && editor.mkedit) {
            editor.editor.setValue(response.data.data.script.code);
            this.scripttype = response.data.data.type; //脚本类型
            this.publiccontrol = response.data.data.public; //公开/非公开
            this.unwell = response.data.data.unwell;
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
        .catch((error) => {
          console.log(error);
          this.$q.notify({
            message: '系统错误!',
            position: 'top',
          });
        });
    },
    uploadImage(blob: Blob | File): Promise<string> {
      return new Promise((resolve) => {
        uploadImageApi(blob, 'script')
          .then((response) => {
            if (response.data.code === 0) {
              resolve(
                http.baseURL + '/resource/image/' + response.data.data.id
              );
            }
          })
          .catch((error) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error.response && error.response.data.msg !== undefined) {
              this.$q.notify({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                message: error.response.data.msg,
                position: 'top',
              });
            } else {
              this.$q.notify({
                message: '系统错误!',
                position: 'top',
              });
            }
            resolve('error');
          });
      });
    },
    CloseThisPage() {
      window.location.pathname =
        '/script-show-page/' + this.publicid.toString();
    },
    ChangeDtsEditor(event: boolean) {
      // console.log('ChangeDtsEditor',event)
      void this.$nextTick(() => {
        const handler = async () => {
          if (editor) {
            if (event === true) {
              editor.dtseditor = (await CodeMirror()).default.fromTextArea(
                <HTMLTextAreaElement>this.$refs.dtstext,
                {
                  //readOnly: true,//只读
                  lineWrapping: true,
                  mode: 'javascript',
                  theme: 'base16-light', // 主日样式
                  //   styleActiveLine: true, // 当前行高亮
                  lineNumbers: true, // 显示行号
                }
              );
              editor.dtseditor.setValue(this.dtsvalue);
              let dtscollinfo = editor.dtseditor.getScrollInfo();
              editor.dtseditor.setSize(dtscollinfo.width, 400);
            } else if (editor.dtseditor) {
              this.dtsvalue = editor.dtseditor.getValue();
              editor.dtseditor.setValue('');
              editor.dtseditor.toTextArea();
              editor.dtseditor = undefined;
            }
          }
        };
        void handler();
      });
      // console.log('this.dtseditor',this.dtseditor)
    },
    SubmitScript() {
      if (!(editor && editor.editor && editor.mkedit)) {
        return;
      }
      let codetext = editor.editor.getValue();
      let marktext = editor.mkedit.getMarkdown();
      let typetext = '';
      if (this.scripttype === 3 && editor.dtseditor) {
        typetext = editor.dtseditor.getValue();
      }
      if (this.id) {
        this.loading.publicloading = true;
        updateScriptCode(
          this.id,
          marktext,
          codetext,
          typetext,
          this.changelog,
          this.publiccontrol,
          this.unwell
        )
          .then((response) => {
            this.loading.publicloading = false;
            if (response.data.code === 0) {
              this.publicid = this.id;
              this.control.success = true;
            }
          })
          .catch((error: AxiosError) => {
            this.loading.publicloading = false;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error.response && error.response.data.msg !== undefined) {
              this.$q.notify({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                message: error.response.data.msg,
                position: 'top',
              });
            } else {
              this.$q.notify({
                message: '系统错误!',
                position: 'top',
              });
            }
          });
      } else {
        this.loading.publicloading = true;
        submitScript(
          marktext,
          codetext,
          this.scripttype,
          this.publiccontrol,
          this.unwell,
          typetext,
          this.dtsname,
          this.dtsdescription
        )
          .then((response) => {
            this.loading.publicloading = false;
            console.log(response, 'response');
            if (response.data.code === 0) {
              this.publicid = response.data.data.id;
              this.control.success = true;
            }
          })
          .catch((error: AxiosError) => {
            this.loading.publicloading = false;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error.response && error.response.data.msg !== undefined) {
              this.$q.notify({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                message: error.response.data.msg,
                position: 'top',
              });
            } else {
              this.$q.notify({
                message: '系统错误!',
                position: 'top',
              });
            }
          });
      }
    },
    uploadCode(e: InputEvent) {
      if (!e.target) {
        return;
      }
      let files = (<HTMLInputElement>e.target).files;
      if (files && files.length > 0) {
        let file = files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = () => {
          if (!editor || !editor.editor) {
            return;
          }
          let result = reader.result;
          console.log('result', result);
          editor.editor.setValue(<string>result);
          (<HTMLInputElement>e.target).value = '';
        };
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.title-wrap {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
