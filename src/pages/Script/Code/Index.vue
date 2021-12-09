<template>
  <div>
    <q-card flat class="my-card">
      <q-card-section>
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="'https://scriptcat.org/api/v1/user/avatar/' + author.uid"
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
              <a class="text-black">
                <b>{{ author.name }}</b>
              </a>
            </div>
          </q-item-section>
          <q-btn
            flat
            type="a"
            class="text-caption"
            style="font-size: 10px; height: 30px"
            text-color="primary"
            :href="'/script-show-page/' + id + '/comment'"
            outline
          >
            <q-rating
              size="10px"
              :value="author.score / 10"
              :max="5"
              color="primary"
            />
            {{ ((author.score * 2) / 10).toFixed(1) }}分
          </q-btn>
        </q-item>

        <q-separator />

        <q-card-section class="q-pt-none text-caption" style="margin-top: 10px">
          {{ author.description }}
        </q-card-section>
        <q-separator />

        <q-card-section>
          <div class="install">
            <q-btn
              class="text-caption"
              type="a"
              :href="
                '/scripts/' + author.name + '/source/' + id + '.user.js'
              "
              color="primary"
              :label="install"
            />
            <q-btn
              class="text-caption"
              type="a"
              target="_blank"
              href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
              color="primary"
              label="如何安装脚本？"
            />
          </div>
        </q-card-section>

        <q-separator />
        <q-card-section class="text-caption text-grey-7">
          <div v-if="author.updatetime !== 0">
            当前版本:{{ author.script.version }} <br />创建日期:{{
              formatDate(author.createtime)
            }}今日安装:{{ author.today_install }} <br />最近更新:{{
              formatDate(author.updatetime)
            }}总安装量:{{ author.total_install }}
          </div>
          <div v-else class="text-grey-7">
            创建日期:{{ formatDate(author.createtime) }}今日安装:{{
              author.today_install
            }}
            <br />最近更新:{{ formatDate(author.updatetime) }}总安装量:{{
              author.total_install
            }}
          </div>
        </q-card-section>

        <q-separator />
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
    formatDate: () => {
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