<template>
  <q-card flat class="row" style="padding: 8px">
    <div class="col">
      <q-input
        outlined
        dense
        v-model="title"
        placeholder="输入标题"
        style="width: 80%; margin-bottom: 8px"
      />
      <div class="flex">
        <div ref="mkedite"></div>
      </div>
      <q-btn-group flat>
        <q-btn color="primary" @click="submitIssue" style="margin-top: 8px">
          创建反馈
        </q-btn>
      </q-btn-group>
    </div>
    <div class="col-3">
      <q-select
        outlined
        multiple
        v-model="label"
        :options="labelOptions"
        borderless
        dense
        options-dense
        label="反馈类型"
        style="width: 100%"
        class="no-shadow"
      />
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { uploadImage as uploadImageApi } from 'src/apis/resource';
import { submitIssue } from 'src/apis/issue';
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
  computed: {
    scriptId() {
      return parseInt(<string>this.$route.params.id);
    },
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
      labelOptions: [
        { label: '反馈BUG', value: 'bug' },
        { label: '请求新功能', value: 'feature' },
        { label: '提出问题', value: 'question' },
      ],
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
      console.log(this.label);
      let labels: string[] = [];
      this.label.forEach((val: { label: string; value: string }) => {
        labels.push(val.value);
      });
      submitIssue(
        this.scriptId,
        this.title,
        editor.mkedit?.getMarkdown() || '',
        labels
      )
        .then((response) => {
          if (response.data.code === 0) {
            this.$q.notify('提交成功');
            setTimeout(() => {
              void this.$router.push({
                name: 'issue-comment',
                params: {
                  id: this.scriptId,
                  issue: response.data.data.id,
                },
              });
            }, 3000);
          } else {
            this.$q.notify({
              message: response.data.msg,
              position: 'top',
            });
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
        });
    },
  },
});
</script>
