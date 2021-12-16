<template>
  <q-card flat>
    <q-input
      outlined
      dense
      v-model="title"
      placeholder="输入标题"
      style="width: 300px; margin: 10px"
    />
    <q-select
      outlined
      multiple
      v-model="label"
      :options="['提出BUG','反馈问题','希望新功能']"
      borderless
      dense
      options-dense
      label="反馈类型"
      style="width: 300px; margin: 10px"
      class="no-shadow"
    />
    <div class="flex" style="margin: 10px">
      <div ref="mkedite"></div>
    </div>
    <q-btn-group flat>
      <q-btn
        color="primary"
        @click="submitIssue"
        style="margin: 0px 0px 10px 10px"
      >
        创建反馈
      </q-btn>
    </q-btn-group>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { uploadImage as uploadImageApi } from 'src/apis/resource';
import http from 'src/utils/http';
import { useMeta } from 'quasar';
import { toastui } from '@toast-ui/editor';
const codeSyntaxHighlight = async () =>
  await import('@toast-ui/editor-plugin-code-syntax-highlight');
const Editor = async () => await import('@toast-ui/editor');
import Prism from 'prismjs';

if (process.env.CLIENT) {
  require('prismjs/themes/prism.css');
  require('@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css');
  require('@toast-ui/editor/dist/toastui-editor.css');
}

const editor = <
  {
    mkedit?: toastui.Editor;
  }
>{
  mkedit: undefined,
};

export default defineComponent({
  name: 'NewIssue',
  setup() {
    useMeta({
      title: '创建新反馈',
    });

    return {};
  },
  unmounted() {
    // 释放编辑器资源
    if (editor.mkedit) {
      editor.mkedit = undefined;
    }
  },
  data() {
    return {
      title: '',
      content: '',
      label: [],
    };
  },
  created() {
    if (process.env.CLIENT) {
      void this.$nextTick(() => {
        let handler = async () => {
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
    submitIssue() {
      let submitLabel:Array<string> = []
      this.label.forEach((val:string)=>{
        if (val === '提出BUG') {
          submitLabel.push('BUG')
        }
        if (val === '反馈问题') {
          submitLabel.push('BUG')
        }
        if (val === '希望新功能') {
          submitLabel.push('BUG')
        }
      })
      console.log(submitLabel);
      console.log(editor.mkedit?.getMarkdown());
    },
  }
});
</script>
