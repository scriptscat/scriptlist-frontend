<template>
  <div>

    <div v-if="this.author !== null">
      <div>
        <span class="title">{{ author.name }}</span>
      </div>
      <div>
        <span>{{ author.description }}</span>
      </div>
      <div style="margin: 20px 0">
        <q-btn
          type="a"
          :href="
            'http://scriptcat.org/scripts/' +
              this.author.name +
              '/source/' +
              this.id +
              '.user.js'
          "
          style="margin: 5px 10px 5px 0px"
          outline
          color="primary"
          label="安装此脚本"
        />
        <q-btn
          type="a"
          style="margin: 5px 10px 5px 0px"
          href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
          outline
          color="primary"
          label="如何安装脚本？"
        />
                <q-btn
          type="a"
          v-if="isuserisauthor"
          @click="JumpToManage"
          style="margin: 5px 10px 5px 0px"

          outline
          color="primary"
          label="管理脚本"
        />
        
      </div>
      <div style="max-width: 600px">
        <div class="Deatil Small-Detail-Item-Padding">
          <div class="item">
            <div class="Item-left-box">
              <div>作者</div>
              <div class="Author">
                <div class="Author">
                  {{ this.author.username }}
                </div>
              </div>
            </div>
            <div class="Item-right-box">
              <div>版本</div>
              <div class="flex items-center justify-center">
                {{ this.author.script.version }}
              </div>
            </div>
          </div>
          <div class="item">
            <div class="Item-left-box">
              <div>今日安装</div>
              <div>
                {{ this.author.today_install }}
              </div>
            </div>
            <div class="Item-right-box">
              <div>创建日期</div>
              <div>
                {{ this.author.createtime | formatDate }}
              </div>
            </div>
          </div>

          <div class="item">
            <div class="Item-left-box">
              <div>总安装量</div>
              <div>
                {{ this.author.total_install }}
              </div>
            </div>
            <div class="Item-right-box">
              <div>最近更新</div>
              <div v-if="this.author.updatetime !== 0">
                {{ this.author.updatetime | formatDate }}
              </div>
              <div v-else>暂无更新</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div id="editor">{{ author.content }}</div>
    </div>
  </div>
</template>

<script>
export default {
  meta() {
    return {
      title: this.author.name,
      meta: {
        description: { name: "description", content: this.author.description }
      }
    };
  },
  preFetch({
    store,
    currentRoute,
    previousRoute,
    redirect,
    ssrContext,
    urlPath,
    publicPath
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
    isuserisauthor(){
      return this.$store.state.scripts.script.uid===this.$store.state.user.user.uid
    }
  },
  data() {
    return {
      viewr: null
    };
  },
  methods: {
    JumpToInstall() {},
    JumpToLearn() {},
    JumpToManage(){
      debugger;         
      this.$router.push({
        name: 'submitscript',
        query: { id:this.id },
      });
    },
    GetScriptMess() {
      this.get("/scripts/" + this.id)
        .then(response => {
          console.log(response, "response");
          if (response.data.code === 0) {
            this.author = response.data.data;
            if (process.env.CLIENT) {
              this.viewr.setMarkdown(this.author.content);
            }
          }
        })
        .catch(error => {});
    }
  },
  destroyed: function() {
    //this.editor.destroy();
    if(this.viewr!==null){
      console.log('this.viewr',this.viewr)
    this.viewr.destroy();
    this.viewr=null;
    }

  },
  created() {
    if (process.env.CLIENT) {
      this.$nextTick(() => {
        require("@toast-ui/editor/dist/toastui-editor-viewer.css");
        const Viewer = require("@toast-ui/editor/dist/toastui-editor-viewer");
        this.viewr = new Viewer({
          el: document.querySelector("#editor")
        });
        this.viewr.setMarkdown(this.author.content);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.title {
  font-size: 26px;
  font-weight: 400;
}
</style>
