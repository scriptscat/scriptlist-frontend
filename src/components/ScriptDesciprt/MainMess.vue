<template>
  <div>
    <div v-if="this.author !== null">
      <div>
        <span class="title">{{ author.name }}</span>
      </div>
      <div>
        <span>{{ author.description }}</span>
      </div>
      <div style="margin:20px 0">
        <q-btn
          type="a"
          :href="
            'http://scriptcat.org/scripts/' +
              this.author.name +
              '/source/' +
              this.id +
              '.user.js'
          "
          style="margin:5px 10px 5px 0px;"
          outline
          color="primary"
          label="安装此脚本"
        />
        <q-btn
          type="a"
          style="margin:5px 10px 5px 0px;"
          href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
          target="_blank"
          outline
          color="primary"
          label="如何安装脚本？"
        />
      </div>
      <div style="max-width:600px">
        <div class="Deatil Small-Detail-Item-Padding">
          <div class="item">
            <div class="Item-left-box">
              <div>
                作者
              </div>
              <div class="Author">
                <div class="Author">
                  {{ this.author.username }}
                </div>
              </div>
            </div>
            <div class="Item-right-box">
              <div>
                版本
              </div>
              <div class="flex items-center justify-center">
                {{ this.author.latest.version }}
              </div>
            </div>
          </div>
          <div class="item">
            <div class="Item-left-box">
              <div>
                今日安装
              </div>
              <div>
                {{ this.author.today_install }}
              </div>
            </div>
            <div class="Item-right-box">
              <div>
                创建日期
              </div>
              <div>
                {{ this.author.createtime | formatDate }}
              </div>
            </div>
          </div>

          <div class="item">
            <div class="Item-left-box">
              <div>
                总安装量
              </div>
              <div>
                {{ this.author.total_install }}
              </div>
            </div>
            <div class="Item-right-box">
              <div>
                最近更新
              </div>
              <div v-if="this.author.updatetime !== 0">
                {{ this.author.updatetime | formatDate }}
              </div>
              <div v-else>
                暂无更新
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
          <div>
        <div id="editor"></div>
      </div>
  </div>
</template>

<script>
//import Editor from "tui-editor"; /* ES6 */

export default {
  props: {
    id: {
      type: Number | String
    }
  },
  data() {
    return {
      author: null,
      viewr: null
    };
  },
  methods: {
    JumpToInstall() {},
    JumpToLearn() {},
    GetScriptMess() {
      this.get("/scripts/" + this.id)
        .then(response => {
          console.log(response, "response");
          if (response.data.msg === "ok") {
            this.author = response.data.data;
            if (process.env.CLIENT) {
              this.viewr.setMarkdown(this.author.content);
            }
          }
        })
        .catch(error => {});
    }
  },
  created() {
    this.GetScriptMess();
    if (process.env.CLIENT) {
      this.$nextTick(() => {
        require("@toast-ui/editor/dist/toastui-editor-viewer.css");
        const Viewer = require("@toast-ui/editor/dist/toastui-editor-viewer");
        this.viewr = new Viewer({
          el: document.querySelector("#editor")
        });

        //editor.getHtml();
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
