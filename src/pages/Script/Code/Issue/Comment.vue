<template>
  <div style="padding: 8px">
    <div style="border-bottom: 1px solid #e4e4e4; padding-bottom: 15px">
      <q-item-label
        lines="1"
        class="text-h5 flex justify-between"
        style="padding: 6px"
      >
        <div>
          <span>{{ issue.title }}</span>
          <IssueLabel :labels="issue.labels" />
        </div>
      </q-item-label>
      <q-item-label caption lines="2">
        <div class="flex justify-start" style="line-height: 28px">
          <IssueStatus :status="issue.status" />
        </div>
      </q-item-label>
    </div>
    <q-card-section class="issue row">
      <div class="col">
        <div class="row">
          <div class="comment-item row">
            <div class="right col">
              <div
                :class="
                  issue.uid == selfUid ? 'comment-title self' : 'comment-title'
                "
              >
                <q-avatar size="25px">
                  <img
                    :src="
                      'https://scriptcat.org/api/v1/user/avatar/' + issue.uid
                    "
                  />
                </q-avatar>
                <a :href="'/users/' + issue.uid" class="username">{{
                  issue.username
                }}</a>
                <span class="description">{{
                  dateformat(issue.createtime * 1000)
                }}</span>
              </div>
              <div class="comment-content">
                <MarkdownView
                  :id="'issue-' + issue.id"
                  :content="issue.content"
                />
              </div>
            </div>
          </div>
          <div
            class="comment-item row"
            v-for="(comment, index) in commentList"
            :key="index"
            :id="`commit-` + comment.id"
          >
            <div v-if="comment.type == 1" class="right col">
              <div
                :class="
                  issue.uid == selfUid ? 'comment-title self' : 'comment-title'
                "
              >
                <q-avatar size="25px">
                  <img
                    :src="
                      'https://scriptcat.org/api/v1/user/avatar/' + comment.uid
                    "
                  />
                </q-avatar>
                <a :href="'/users/' + comment.uid" class="username">{{
                  comment.username
                }}</a>
                <span class="description">{{
                  dateformat(comment.createtime * 1000)
                }}</span>
              </div>
              <div class="comment-content">
                <MarkdownView
                  :id="'comment-' + comment.id"
                  :content="comment.content"
                />
              </div>
            </div>
            <div v-else-if="comment.type >= 4" class="right col comment-icon">
              <div class="flex justify-start items-center">
                <div class="icon">
                  <q-btn
                    v-if="comment.type == 4"
                    round
                    color="red"
                    icon="restart_alt"
                    size="sm"
                  />
                  <q-btn v-else round color="secondary" icon="done" size="sm" />
                </div>
                <div class="icon-description">
                  <a
                    :href="'/users/' + comment.uid"
                    class="username"
                    target="_blank"
                  >
                    <q-avatar size="25px">
                      <img
                        :src="
                          'https://scriptcat.org/api/v1/user/avatar/' +
                          comment.uid
                        "
                      />
                    </q-avatar>
                  </a>
                  <a :href="'/users/' + comment.uid" class="username">{{
                    comment.username
                  }}</a>
                  <span class="description">{{
                    dateformat(comment.createtime * 1000)
                  }}</span>
                  <span class="description">{{ comment.content }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <q-card flat bordered>
            <div>
              <div ref="mkedite"></div>
            </div>
            <div class="flex justify-end" style="padding: 8px">
              <q-btn
                outline
                color="secondary"
                size="sm"
                v-if="issue.status == 1"
                @click="closeIssue"
              >
                关闭反馈
              </q-btn>
              <q-btn
                outline
                color="red"
                size="sm"
                v-if="issue.status == 3"
                @click="openIssue"
                style="margin-left: 10px"
              >
                重新打开
              </q-btn>
              <q-btn
                outline
                color="primary"
                size="sm"
                @click="submitComment"
                style="margin-left: 10px"
              >
                评论
              </q-btn>
            </div>
          </q-card>
        </div>
      </div>
      <div class="col-3" style="padding: 10px">
        <div class="info-item">
          <div class="info-title">标签</div>
          <div class="info-content">
            <q-select
              disable
              outlined
              multiple
              v-model="label"
              :options="labelOptions"
              borderless
              dense
              options-dense
              label="标签(建设中)"
              style="width: 100%"
              class="no-shadow"
            />
          </div>
        </div>
        <div class="info-item">
          <div class="info-title">关注</div>
          <div class="info-content">
            <q-btn color="primary" size="sm" style="width: 70%" disable
              >关注</q-btn
            >
          </div>
        </div>
        <div class="info-item">
          <div class="info-title">参与人</div>
          <div class="info-content flex justify-start">
            <span v-for="(value, key) in joinMember" :key="key">
              <a :href="'/users/' + value.uid" class="username" target="_blank">
                <q-avatar size="25px">
                  <img
                    :src="
                      'https://scriptcat.org/api/v1/user/avatar/' + value.uid
                    "
                  />
                </q-avatar>
              </a>
            </span>
          </div>
        </div>
      </div>
    </q-card-section>
  </div>
</template>

<script lang="ts">
import { Cookies, useMeta } from 'quasar';
import { defineComponent } from 'vue';
import { toastui } from '@toast-ui/editor';
const codeSyntaxHighlight = async () =>
  await import('@toast-ui/editor-plugin-code-syntax-highlight');
const Editor = async () => await import('@toast-ui/editor');
import Prism from 'prismjs';
import http from 'src/utils/http';
import { uploadImage as uploadImageApi } from 'src/apis/resource';
import IssueLabel from '@Components/IssueLabel.vue';
import IssueStatus from '@Components/IssueStatus.vue';
import MarkdownView from '@Components/MarkdownView.vue';
import { formatDate, handleResponseError } from '@App/utils/utils';
import { useStore } from '@App/store';
import { AxiosResponse } from 'axios';

if (process.env.CLIENT) {
  require('prismjs/themes/prism.css');
  require('@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css');
  require('@toast-ui/editor/dist/toastui-editor.css');
}

export default defineComponent({
  components: { IssueLabel, IssueStatus, MarkdownView },
  async preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    await store.dispatch('issues/fetchIssue', {
      scriptId: currentRoute.params.id,
      issueId: currentRoute.params.issue,
    });
    return store.dispatch('issues/fetchCommentList', {
      scriptId: currentRoute.params.id,
      issueId: currentRoute.params.issue,
      cookies: cookies,
    });
  },
  computed: {
    selfUid() {
      return this.$store.state.user.user && this.$store.state.user.user.uid;
    },
    commentList() {
      return this.$store.state.issues.commentList;
    },
    total() {
      return this.$store.state.issues.total;
    },
    issueId() {
      return parseInt(<string>this.$route.params.issue);
    },
    scriptId() {
      return parseInt(<string>this.$route.params.id);
    },
  },
  setup() {
    const store = useStore();
    const script = store.state.scripts.script || <DTO.Script>{};
    const issue = store.state.issues.issue;
    if (!issue) {
      return {
        editor: <
          {
            mkedit?: toastui.Editor;
          }
        >{
          mkedit: undefined,
        },
      };
    }
    useMeta({
      title: issue.title,
      titleTemplate: (title) =>
        title + ' · 反馈 #' + issue.id.toString() + ' · ' + script.name,
      meta: {
        description: { name: 'description', content: issue.title },
      },
    });
    return {
      script,
      issue,
      editor: <
        {
          mkedit?: toastui.Editor;
        }
      >{
        mkedit: undefined,
      },
    };
  },
  data() {
    return {
      dateformat: formatDate,
      joinMember: <{ [key: number]: DTO.IssueComment }>{},
    };
  },
  unmounted() {
    void this.$store.commit('issues/resetPreFetch');
  },
  created() {
    if (process.env.CLIENT) {
      this.commentList.forEach((val) => {
        this.joinMember[val.uid] = val;
      });
      this.$watch(
        () => {
          return this.commentList;
        },
        () => {
          this.commentList.forEach((val) => {
            this.joinMember[val.uid] = val;
          });
        }
      );
      void this.$nextTick(() => {
        let handler = async () => {
          this.editor.mkedit = new (await Editor()).default({
            el: <HTMLElement>this.$refs.mkedite,
            previewStyle: 'tab',
            height: '400px',
            placeholder: '输入回复反馈内容（友善的反馈是交流的起点）',
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
            } else {
              this.$q.notify({
                message: response.data.msg,
                position: 'top',
              });
            }
          })
          .catch(() => {
            this.$q.notify({
              message: '系统错误!',
              position: 'top',
            });
            resolve('error');
          });
      });
    },
    submitComment() {
      this.$store
        .dispatch('issues/submitComment', {
          script: this.scriptId,
          issue: this.issueId,
          content: this.editor.mkedit?.getMarkdown() || '',
        })
        .then((response: AxiosResponse<API.OkResponse>) => {
          if (response.data.code === 0) {
            this.editor.mkedit?.setMarkdown('');
          } else {
            this.$q.notify({
              message: response.data.msg,
              position: 'top',
            });
          }
          // this.$q.notify('评论成功');
        })
        .catch(() => {
          this.$q.notify({
            message: '系统错误!',
            position: 'top',
          });
        });
    },
    closeIssue() {
      this.$store
        .dispatch('issues/closeIssue', {
          script: this.scriptId,
          issue: this.issueId,
        })
        .then((response: AxiosResponse<API.OkResponse>) => {
          if (response.data.code !== 0) {
            this.$q.notify({
              message: response.data.msg,
              position: 'top',
            });
          }
        })
        .catch(() => {
          this.$q.notify({
            message: '系统错误!',
            position: 'top',
          });
        });
    },
    openIssue() {
      void handleResponseError(
        this.$q,
        this.$store.dispatch('issues/openIssue', {
          script: this.scriptId,
          issue: this.issueId,
        })
      );
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

.comment-item {
  width: 100%;
  box-sizing: initial;
  position: relative;
  z-index: 10;
}

.comment-item .comment-title {
  padding: 4px 8px;
  background: #f6f8fa;
  height: 30px;
  line-height: 30px;

  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  border: 1px solid #d0d7de;
}

.comment-item .username {
  font-weight: 600;
  display: inline-block;
  margin-left: 10px;
  color: #252525;
}

.comment-item .description {
  color: #7c7c7c;
  margin-left: 4px;
}

.comment-item .comment-content {
  padding: 14px;

  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  border: 1px solid #d0d7de;
  border-top: unset;
}

.comment-item .right {
  background: #fff;
}

.comment-item {
  margin: 15px 0;
}

.comment-item:not(:first-child) .right::before {
  top: -15px;
}

.comment-item .right::before {
  content: ' ';
  width: 2px;
  background: #d0d7de;
  position: absolute;
  margin-left: 24px;
  top: 0px;
  bottom: -15px;
  z-index: -1;
}

.comment-item:last-child::before {
  bottom: 0;
}

.comment-item .comment-icon {
  width: 100%;
}

.comment-item .comment-icon .icon {
  margin-left: 10px;
}

.icon-description {
  padding-left: 10px;
}

.info-item {
  border-bottom: 1px solid #b8b8b8;
  padding: 10px;
}

.info-item .info-title {
  font-weight: 600;
}
.info-item .info-content {
  margin-top: 8px;
  text-align: center;
}
</style>
