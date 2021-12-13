<template>
  <div style="padding: 8px">
    <q-card flat class="my-card">
      <q-card class="single" flat bordered v-bind:key="index">
        <q-card bordered flat>
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img
                  :src="
                    'https://scriptcat.org/api/v1/user/avatar/' + author.uid
                  "
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <a
                  style="color: rgb(40, 86, 172)"
                  target="_blank"
                  :href="'/users/' + author.uid"
                >
                  {{ author.username }}
                </a>
              </q-item-label>
              <div class="text-body1">
                <a
                  class="text-black"
                  target="_blank"
                  :href="'/script-show-page/' + author.id"
                >
                  <b>{{ author.name }}</b>
                </a>
              </div>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section class="q-pt-none" style="margin: 10px 0px 0px 0px"
            >{{ author.description }}
          </q-card-section>
          <q-separator />
          <q-item class="block text-left">
            <q-item-label class="row" style="width: 600px" caption>
              <span class="col">今日安装</span>
              <span class="col">总安装量</span>
              <span class="col">创建日期</span>
              <span class="col">最近更新</span>
              <span class="col">评分</span>
            </q-item-label>
            <q-item-label
              class="row text-caption text-black"
              style="font-weight: bold; width: 600px"
            >
              <span class="col">{{ author.today_install }}</span>
              <span class="col">{{ author.total_install }}</span>
              <span class="col">{{
                dateformat(author.createtime * 1000)
              }}</span>
              <span v-if="author.updatetime !== 0" class="col">{{
                dateformat(author.updatetime * 1000)
              }}</span>
              <span v-else class="col">{{
                dateformat(author.createtime * 1000)
              }}</span>
              <span v-if="author.score != 0" class="col"
                >{{ ((author.score * 2) / 10).toFixed(1) }} 分</span
              >
              <span v-else class="col">暂无评分</span>
            </q-item-label>
          </q-item>
          <q-separator />
          <q-item-label style="margin: 5px 5px 5px 0px">
            <q-btn-group flat>
              <q-btn
                flat
                icon="star"
                size="sm"
                color="light-blue-10"
                type="a"
                href="/comment/1"
              >
                <q-tooltip>评分</q-tooltip>
              </q-btn>
              <q-separator vertical inset="1" />
              <q-btn flat icon="chat" size="sm" color="light-blue-10">
                <q-tooltip>反馈</q-tooltip>
              </q-btn>
              <q-separator vertical inset="1" />
              <q-btn flat icon="share" size="sm" color="light-blue-10">
                <q-tooltip>分享</q-tooltip>
              </q-btn>
              <q-separator vertical inset="1" />
              <q-btn flat icon="more_horiz" size="sm" color="light-blue-10">
                <q-tooltip>更多</q-tooltip>
              </q-btn>
              <q-separator vertical inset="2" />
            </q-btn-group>
          </q-item-label>
        </q-card>
      </q-card>
      <q-card-section>
        <q-card-section>
          <div class="editor" id="editor">{{ author.content }}</div>
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import format from 'date-fns/format';

export default defineComponent({
  computed: {
    dateformat: () => {
      return (value: number | Date) => {
        return format(value, 'yyyy-MM-dd');
      };
    },
    id() {
      return this.$route.params.id;
    },
    author() {
      return this.$store.state.scripts.script || <DTO.Script>{};
    },
  },
  data(): { viewr?: { remove: () => void }; install: string } {
    return {
      install: '安装此脚本',
      viewr: undefined,
    };
  },
  methods: {
    to_score(id: number) {
      window.open('/script-show-page/' + id.toString() + '/comment');
    },
    JumpToManage() {
      debugger;
      void this.$router.push({
        name: 'submitscript',
        query: { id: this.id },
      });
    },
  },
  unmounted() {
    //this.editor.destroy();
    if (this.viewr) {
      console.log('this.viewr', this.viewr);
      this.viewr.remove();
      this.viewr = undefined;
    }
  },
  created() {
    if (process.env.CLIENT) {
      void this.$nextTick(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Prism = require('prismjs');
        require('prismjs/components/prism-clojure.js');
        require('prismjs/components/prism-javascript.js');
        require('prismjs/themes/prism.css');
        require('@toast-ui/editor/dist/toastui-editor-viewer.css');
        require('@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Viewer = require('@toast-ui/editor/dist/toastui-editor-viewer');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const codeSyntaxHighlight = require('@toast-ui/editor-plugin-code-syntax-highlight');
        let el = document.querySelector('#editor');
        if (!el) {
          return;
        }
        el.innerHTML = '';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.viewr = new Viewer({
          el: el,
          initialValue: this.author.content,
          plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
          linkAttributes: {
            target: '_blank',
          },
        });
      });
    }
  },
  mounted() {
    var api = <
        {
          isInstalled: (
            name: string,
            namespace: string,
            callback: (res: any, rej: any) => void
          ) => void;
        } // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      >(<any>window.external).Scriptcat || (<any>window.external).Tampermonkey;
    if (api != undefined) {
      api.isInstalled(
        this.author.name,
        this.author.namespace,
        (res: { installed: boolean; version: string }) => {
          if (res.installed === true) {
            if (res.version == this.author.script.version) {
              this.install = '重新安装此脚本（版本' + res.version + '）';
            } else {
              this.install = '更新到' + this.author.script.version + '版本';
            }
          } else this.install = '安装此脚本';
        }
      );
    }
  },
});
</script>

<style lang="scss" scoped>
.my-card {
  a {
    text-decoration: none;
  }
}
.install {
  .text-caption {
    color: 'primary';
    font-size: 13px;
    margin-right: 5px;
  }
}
.title {
  font-size: 26px;
  font-weight: 400;
}
</style>
