<template>
  <q-card-section class="issue">
    <q-card bordered flat style="margin-bottom: 20px">
      <q-item-section>
        <q-item-label lines="1" class="text-h5" style="padding: 6px"
          >反馈标题
          <q-chip color="red" text-color="white" size="xs"> BUG </q-chip>
          <q-btn color="white" text-color="black" size="sm" label="编辑" />
        </q-item-label>
        <q-item-label caption lines="2">
          <q-chip>打开</q-chip>
          <a href="/123" style="color: rgba(0, 0, 0, 0.54)" target="_blank"
            >用户名</a
          >
          创建1天前 打开 · 10 评论
        </q-item-label>
      </q-item-section>
    </q-card>
    <div class="row">
      <div class="col-8">
        <q-timeline color="secondary">
          <q-timeline-entry avatar="https://cdn.quasar.dev/img/avatar5.jpg">
            <template v-slot:title> 用户名 </template>
            <template v-slot:subtitle>评论在 10 天前 </template>
            <q-card class="my-card" flat bordered style="margin-bottom: 10px">
              <q-card-section horizontal>
                <q-card-section>
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                </q-card-section>
              </q-card-section>
            </q-card>
          </q-timeline-entry>

          <q-timeline-entry
            title="用户名"
            subtitle="评论在 10 天前"
            avatar="https://cdn.quasar.dev/img/avatar5.jpg"
          >
            <q-card class="my-card" flat bordered style="margin-bottom: 10px">
              <q-card-section horizontal>
                <q-card-section>
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                </q-card-section>
              </q-card-section>
            </q-card>
          </q-timeline-entry>
          <q-timeline-entry icon="check_circle">
            <template v-slot:subtitle> 用户名 在 11 天前 完成</template>
          </q-timeline-entry>
          <q-timeline-entry icon="local_offer">
            <template v-slot:subtitle> 用户名 在 10 天前 添加 xx 标签</template>
          </q-timeline-entry>
        </q-timeline>
      </div>
      <div class="col-4">
        <p>侧边栏内容（打标签、关注、删除反馈什么的）</p>
      </div>
    </div>
    <q-card>
      回复框什么的
      <br />
      <div ref="mkedite"></div>
      <br />
      <!-- // 需要判断是否为发布反馈的人或者是脚本管理员 -->
      <!-- 需要判断状态是否为关闭 -->
      <q-btn color="primary" @click="submitIssue"> 关闭反馈 </q-btn>
      <q-btn color="primary" @click="submitIssue"> 创建反馈 </q-btn>
    </q-card>
  </q-card-section>
</template>

<script lang="ts">
import { Cookies } from 'quasar';
import { defineComponent } from 'vue';
import { toastui } from '@toast-ui/editor';
const codeSyntaxHighlight = async () =>
  await import('@toast-ui/editor-plugin-code-syntax-highlight');
const Editor = async () => await import('@toast-ui/editor');
import Prism from 'prismjs';
import http from 'src/utils/http';
import { uploadImage as uploadImageApi } from 'src/apis/resource';

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
  preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch('issues/fetchCommentList', {
      scriptId: currentRoute.params.id,
      issueId: currentRoute.params.issue,
      page: 1,
      count: 20,
      cookies: cookies,
    });
  },

  components: {
    // commentList() {
    //   return this.$store.state.issues.commentList;
    // },
    // total() {
    //   return this.$store.state.issues.total;
    // },
  },
  created() {
    if (process.env.CLIENT) {
      void this.$nextTick(() => {
        let handler = async () => {
          editor.mkedit = new (await Editor()).default({
            el: <HTMLElement>this.$refs.mkedite,
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
      console.log(editor.mkedit?.getMarkdown());
    },
  },
});
</script>

<style>
.issue a {
  text-decoration: none;
}

.issue a:hover {
  text-decoration: underline;
}

.chat .q-icon:hover {
  color: rgb(95, 164, 255);
}
</style>
