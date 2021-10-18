<template>
  <div v-if="this.author !== null">
    <q-card flat class="my-card">
      <q-card-section>
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="
                  'https://scriptcat.org/api/v1/user/avatar/' + this.author.uid
                "
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <a style="color: rgb(40, 86, 172)" href="/" target="_blank">
                {{ author.name }}
              </a>
            </q-item-label>
            <div class="text-body1">
              <a
                class="text-black"
                target="_blank"
                :href="'/script-show-page/' + this.author.id"
              >
                <b>{{ this.author.name }}</b>
              </a>
            </div>
          </q-item-section>
          <q-btn
            flat
            type="a"
            class="text-caption"
            style="font-size: 10px;height:30px;"
            text-color="primary"
            :href="'/script-show-page/' + this.id + '/comment'"
            outline
          >
            <q-rating
              size="10px"
              :value="this.author.score / 10"
              :max="5"
              color="primary"
            />
            　{{ ((this.author.score * 2) / 10).toFixed(1) }}分
          </q-btn>
        </q-item>

        <q-separator />

        <q-card-section>
          <div class="install">
            <q-btn
              class="text-caption"
              type="a"
              :href="
                '/scripts/' +
                this.author.name +
                '/source/' +
                this.id +
                '.user.js'
              "
              color="primary"
              label="安装此脚本"
            />
            <q-btn
              class="text-caption"
              type="a"
              href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
              color="primary"
              label="如何安装脚本？"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="text-caption">
          <div v-if="this.author.updatetime !== 0" class="text-grey-7">
            创建日期：{{this.author.createtime | formatDate}}　　今日安装：{{ this.author.today_install }}
            <br />最近更新：{{this.author.updatetime | formatDate}}　　总安装量：{{ this.author.total_install }}　　
            </div>
          <div v-else class="text-grey-7">
            创建日期：{{this.author.createtime | formatDate}}　　今日安装：{{ this.author.today_install }}
            <br />最近更新：{{this.author.createtime | formatDate}}　　总安装量：{{ this.author.total_install }}　　
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none text-caption" style="margin-top: 10px">
          {{ author.description }}
        </q-card-section>

        <q-separator />
        <q-card-section>
          <div>
            <div id="editor">{{ author.content }}</div>
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  meta() {
    return {
      title: this.author.name,
      meta: {
        description: { name: "description", content: this.author.description },
      },
    };
  },
  preFetch({
    store,
    currentRoute,
    previousRoute,
    redirect,
    ssrContext,
    urlPath,
    publicPath,
  }) {
    return store.dispatch("scripts/fetchScriptInfo", currentRoute.params.id);
  },
  computed: {
    id() {
      return this.$route.params.id;
    },
    author() {
      return this.$store.state.scripts.script;
    },
  },
  data() {
    return {
      viewr: null,
    };
  },
  methods: {
    to_score(id) {
      window.open("/script-show-page/" + id + "/comment");
    },
    JumpToInstall() {},
    JumpToLearn() {},
    JumpToManage() {
      debugger;
      this.$router.push({
        name: "submitscript",
        query: { id: this.id },
      });
    },
  },
  destroyed: function () {
    //this.editor.destroy();
    if (this.viewr !== null) {
      console.log("this.viewr", this.viewr);
      this.viewr.remove();
      this.viewr = null;
    }
  },
  created() {
    if (process.env.CLIENT) {
      this.$nextTick(() => {
        const Prism = require("prismjs");
        require("prismjs/components/prism-clojure.js");
        require("prismjs/components/prism-javascript.js");
        require("prismjs/themes/prism.css");
        require("@toast-ui/editor/dist/toastui-editor-viewer.css");
        require("@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css");
        const Viewer = require("@toast-ui/editor/dist/toastui-editor-viewer");
        const codeSyntaxHighlight = require("@toast-ui/editor-plugin-code-syntax-highlight");
        let el = document.querySelector("#editor");
        el.innerHTML = "";
        this.viewr = new Viewer({
          el: el,
          initialValue: "",
          plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
        });
        this.viewr.setMarkdown(this.author.content);
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.my-card {
  a {
    text-decoration: none;
  }
}

.install {
  .text-caption {
    color: "primary";
    font-size: 13px;
    margin-right: 5px;
  }
}

.title {
  font-size: 26px;
  font-weight: 400;
}
</style>
