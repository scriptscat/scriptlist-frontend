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
import { StateInterface, useStore } from '@App/store';
import { goToLoginUrl } from '@App/utils/utils';
import { useRoute } from 'vue-router';

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
  preFetch({ store, currentRoute, ssrContext }) {
    if (!(<StateInterface>store.state).user.islogin) {
      return ssrContext?.res.redirect(goToLoginUrl(currentRoute.path));
    }
  },
  setup() {
    useMeta({
      title: '创建新反馈',
    });
    const store = useStore();
    if (process.env.CLIENT) {
      if (!store.state.user.islogin) {
        window.location.href = goToLoginUrl(useRoute().path);
      }
    }
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
            this.$q.notify({
              color: 'primary',
              icon: 'done',
              message: '提交成功',
              position: 'center',
            });
            const { href } = this.$router.resolve({
              name: 'issue-comment',
              params: {
                id: this.scriptId,
                issue: response.data.data.id,
              },
            });
            window.open(href, '_self');
          } else {
            this.$q.notify({
              color: 'orange',
              icon: 'warning',
              message: response.data.msg,
              position: 'center',
            });
          }
        })
        .catch((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (error.response && error.response.data.msg !== undefined) {
            this.$q.notify({
              color: 'orange',
              icon: 'warning',
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              message: error.response.data.msg,
              position: 'center',
            });
          } else {
            this.$q.notify({
              message: '系统错误!',
              position: 'center',
            });
          }
        });
    },
  },
});
</script>
