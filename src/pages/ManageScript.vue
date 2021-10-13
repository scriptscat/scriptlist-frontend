<template>
  <div class="page-padding padding-normal page-wrap">
    <div class="show-mess-page">
      <q-card>
        <q-card-section>
          <div style="font-size: 19px;">
            {{ user.username }}
          </div>
          <div style="font-size:18px;margin-top:15px;">
            控制台
          </div>
          <div>
            <div
              v-for="(item, index) in btnlist"
              :key="index"
              @click="JumpBtnToTarget(item)"
              style="margin-top:8px;margin-left:23px;"
            >
              <q-btn v-if="item.show===1" outline color="primary" :label="item.name" />
            </div>
          </div>
          <div
            v-if="ScriptList.length !== 0"
            style="font-size:18px;margin-top:15px;"
          >
            发布的脚本
          </div>
          <div v-if="ScriptList.length !== 0">
            <div>
              <div style="padding-left:25px;">
                <div
                  class="Script-Block"
                  v-for="(item, index) in ScriptList"
                  :key="index"
                >
                  <div class="Head">
                    <div>
                      <a
                        :href="'/script-show-page/' + item.id"
                        target="_black"
                        >{{ item.name }}</a
                      >
                      <q-avatar
                        v-if="
                          item.script.meta_json.background ||
                            item.script.meta_json.crontab
                        "
                        size="16px"
                        style="margin-left: 4px"
                      >
                        <img src="/icons/favicon-32x32.png" />
                      </q-avatar>
                    </div>
                    <a
                      style="float: right; text-decoration: none"
                      :href="
                        '/scripts/' +
                          encodeURIComponent(item.name) +
                          '/source' +
                          +item.id +
                          '.user.js'
                      "
                    >
                    </a>
                  </div>
                  <div class="Context">
                    <div class="text">
                      <span v-if="item.description !== ''">{{
                        item.description
                      }}</span>
                      <span v-else>暂无简介</span>
                    </div>
                    <div class="Deatil">
                      <div class="item">
                        <div class="Item-left-box">
                          <div>作者</div>
                          <div class="Author">
                            {{ item.username }}
                          </div>
                        </div>
                        <div class="Item-right-box">
                          <div>得分</div>
                          <div class="flex items-center justify-center">
                            <q-rating
                              v-model="item.score"
                              disable
                              size="1em"
                              :max="5"
                              color="primary"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="item">
                        <div class="Item-left-box">
                          <div>今日安装</div>
                          <div>
                            {{ item.today_install }}
                          </div>
                        </div>
                        <div class="Item-right-box">
                          <div>创建日期</div>
                          <div>
                            {{ item.createtime | formatDate }}
                          </div>
                        </div>
                      </div>

                      <div class="item">
                        <div class="Item-left-box">
                          <div>总安装量</div>
                          <div>
                            {{ item.total_install }}
                          </div>
                        </div>
                        <div class="Item-right-box">
                          <div>最近更新</div>
                          <div v-if="item.updatetime !== 0">
                            {{ item.updatetime | formatDate }}
                          </div>
                          <div v-else>暂无更新</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
//import TablePagination from "components/TablePagination.vue";

export default {
  components: {
    //  TablePagination
  },
  computed: {
    maxpage: function() {
      let max = Math.ceil(this.totalnums / this.count);
      if (max < 1) {
        max = 1;
      }
      return max;
    }
  },
  data() {
    return {
      page: 1,
      ScriptList: [],

      btnlist: [
        {
          id: 0,
          name: "发布你编写的脚本",
          href: "submitscript",
          show:1,
        },
        {
          id: 1,
          name: "发布你编写的样式",
          href: ""
        },
        {
          id: 2,
          name: "新建脚本收藏集",
          href: ""
        },
        {
          id: 3,
          name: "导入脚本",
          href: ""
        },
        {
          id: 4,
          name: "设置 webhook",
          href: "webhookpage",
                    show:1,
        },
        {
          id: 5,
          name: "编辑账号信息",
          href: ""
        }
      ]
    };
  },
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
    user() {
      return this.$store.state.user.user;
    }
  },
  methods: {
    JumpBtnToTarget(item){
            this.$router.push({
        path: item.href
      });
    },
    tolink(page) {
      let ret = "/search?page=" + (page || 1);
      if (this.$route.query.keyword) {
        ret += "&keyword=" + encodeURIComponent(this.$route.query.keyword);
      }
      if (this.$route.query.sort) {
        ret += "&sort=" + encodeURIComponent(this.$route.query.sort);
      }
      if (this.$route.query.category) {
        ret += "&category=" + encodeURIComponent(this.$route.query.category);
      }
      if (this.$route.query.domain) {
        ret += "&domain=" + encodeURIComponent(this.$route.query.domain);
      }
      return ret;
    },
    getmyscripts() {
      this.get(
        "/user/scripts/" +
          this.user.uid +
          "?page=1&count=20&keyword=&sort=&category=&domain="
      )
        .then(response => {
          if (response.data.msg === "ok") {
            if (process.env.CLIENT) {
              if (response.data.code === 0) {
                this.ScriptList = response.data.list;
              }
            }
          }
        })
        .catch(error => {});
    }
  },
  created() {
    if (process.env.CLIENT) {
      if (!this.islogin) {
        this.$q.notify({
          position: "top-right",
          message: "当前尚未登陆！",
          position: "top"
        });
        this.$router.push({ path: "/" });
        return;
      }
      //this.id = this.$route.query.id;
    }
    this.getmyscripts();
  }
};
</script>
<style lang="scss" scoped>
.page-wrap {
  margin-bottom: 20px;
  margin-top: 20px;
}
.Script-Block {
  padding: 16px;
  .Head {
    a {
      color: #1987E2;
      //text-decoration: none;
    }
    font-size: 18px;
    text-decoration: underline;
  }
  .Head:hover {
    cursor: pointer;
  }
  .Context {
    .text {
      margin: 7.5px 0;
    }
  }
}
</style>
