<template>
  <div class="page-padding padding-normal setting-wrap-status flex page-main">
    <div class="shadow-5 main-scrip-page">
      <div v-if="ScriptList.length !== 0">
        <div>
          <div
            class="Script-Block"
            v-for="(item, index) in ScriptList"
            :key="index"
          >
            <div class="Head">
              <div>
                <a :href="'/script-show-page/' + item.id" target="_black">{{
                  item.name
                }}</a>
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
                    '/source/' +
                    +item.id +
                    '.user.js'
                "
              >
                <q-btn
                  color="primary"
                  size="sm"
                  icon="file_download"
                  label="立刻安装"
                />
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
                        readonly
                        size="1em"
                        :max="5"
                        color="primary"
                      />
                    </div>
                    <a
                    class="Author"
                    style="text-decoration: none;"
                    :href="'/script-show-page/' + item.id+'/comment'" target="_black"
                    >(去评分)</a>
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
          <q-separator />
        </div>
        <div class="q-pa-lg flex flex-center">
          <TablePagination
            :currentpage.sync="page"
            :maxpage="maxpage"
            :maxlens="6"
            :tolink="tolink"
          />
        </div>
      </div>
      <div v-else>
        <div
          class="flex items-center justify-center column"
          style="margin-top:80px;"
        >
          <span style="font-size:20px;"
            >非常抱歉，你要搜索的内容和爱情一样没有结果！</span
          >
          <div>
            <q-btn
              style="margin:40px 0;"
              type="a"
              href="/"
              outline
              color="primary"
              label="返回上一页"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="show-mess-page">
      <q-card>
        <div class="bg-primary text-white" style="padding: 5px">
          <div class="text-subtitle2">今日下载</div>
        </div>
        <div style="padding:10px 10px;">
          <div v-for="(item, index) in recommondlist.download" :key="index">
            <span class="show-recommod-text"
              ><span
                :style="{ backgroundColor: iconcolorlist[index] }"
                class="recommond-icon"
                >{{ index + 1 }}</span
              ><a :href="'/script-show-page/'+item.id"> {{ item.name }}</a></span
            >
          </div>
        </div>
      </q-card>
      <q-card>
        <div class="bg-primary text-white" style="padding: 5px">
          <div class="text-subtitle2">评分推荐</div>
        </div>

        <div style="padding:10px 10px;">
          <div v-for="(item, index) in recommondlist.score" :key="index">
            <span class="show-recommod-text"
              ><span
                :style="{ backgroundColor: iconcolorlist[index] }"
                class="recommond-icon"
                >{{ index + 1 }}</span
              ><a :href="'/script-show-page/'+item.id"> {{ item.name }}</a></span
            >
          </div>
        </div>
      </q-card>
      <q-card>
        <div class="bg-primary text-white" style="padding: 5px">
          <div class="text-subtitle2">最近更新</div>
        </div>

        <div style="padding:10px 10px;">
          <div v-for="(item, index) in recommondlist.new" :key="index">
            <span class="show-recommod-text"
              ><span
                :style="{ backgroundColor: iconcolorlist[index] }"
                class="recommond-icon"
                >{{ index + 1 }}</span
              ><a :href="'/script-show-page/'+item.id"> {{ item.name }}</a></span
            >
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>
<script>
import TablePagination from "components/TablePagination.vue";

export default {
  meta: {
    title: "用户脚本列表"
  },
  components: {
    TablePagination
  },
  computed: {
    maxpage: function() {
      let max = Math.ceil(this.totalnums / this.count);
      if (max < 1) {
        max = 1;
      }
      return max;
    },
    ScriptList() {
      return this.$store.state.scripts.scripts;
    },
    totalnums() {
      return this.$store.state.scripts.total;
    }
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
    return store.dispatch(
      "scripts/fetchScriptList",
      "/scripts?page=" +
        (currentRoute.query.page || 1) +
        "&count=20&keyword=" +
        encodeURIComponent(currentRoute.query.keyword || "") +
        "&sort=" +
        (currentRoute.query.sort || "today_download") +
        "&category=" +
        (currentRoute.query.category || "") +
        "&domain=" +
        (currentRoute.query.domain || "")
    );
  },
  watch: {
    $route(currentRoute, from) {
      this.page = parseInt(this.$route.query.page);
      this.get(
        "/scripts?page=" +
          (currentRoute.query.page || 1) +
          "&count=20&keyword=" +
          encodeURIComponent(currentRoute.query.keyword || "") +
          "&sort=" +
          (currentRoute.query.sort || "today_download") +
          "&category=" +
          (currentRoute.query.category || "") +
          "&domain=" +
          (currentRoute.query.domain || "")
      )
        .then(response => {
          if (response.data.code == 0) {
            this.$store.commit("scripts/updateScripts", response.data);
          } else {
            this.$store.commit("scripts/updateScripts", { list: [], total: 0 });
          }
        })
        .catch(error => {
          this.$store.commit("scripts/updateScripts", { list: [], total: 0 });
        });
    }
  },
  methods: {
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
    GerRecommond() {
      this.get(
        "/scripts?page=1&count=10&keyword=&sort=today_download&category=&domain="
      )
        .then(response => {
          if (response.data.msg === "ok") {
            if (process.env.CLIENT) {
              if (response.data.code === 0) {
                this.recommondlist.download = response.data.list;
              }
            }
          }
        })
        .catch(error => {});
      this.get("/scripts?page=1&count=10&keyword=&sort=score&category=&domain=")
        .then(response => {
          if (response.data.msg === "ok") {
            if (process.env.CLIENT) {
              if (response.data.code === 0) {
                this.recommondlist.score = response.data.list;
              }
            }
          }
        })
        .catch(error => {});
      this.get(
        "/scripts?page=1&count=10&keyword=&sort=updatetime&category=&domain="
      )
        .then(response => {
          if (response.data.msg === "ok") {
            if (process.env.CLIENT) {
              if (response.data.code === 0) {
                this.recommondlist.new = response.data.list;
              }
            }
          }
        })
        .catch(error => {});
    },
    GetSciprtList() {
      this.GerRecommond();
    }
  },
  data() {
    return {
      iconcolorlist: [
        "#ff981b",
        "#FF8F1C",
        "#6AC25E",
        "#7CCB6D",
        "#BD76E3",
        "#BE78E4",
        "#23B4EA",
        "#1EB1E9",
        "#EB7182",
        "#EB7282",
      ],
      recommondlist: {
        download: [],
        score: [],
        new: []
      },
      count: 20, //每次获取条数
      keyword: "",
      page: 1
    };
  },
  created() {
    this.keyword = this.$route.query.keyword;
    this.page = parseInt(this.$route.query.page);
    if (isNaN(this.page)) {
      this.page = 1;
    }
    this.GetSciprtList();
  }
};
</script>
<style lang="scss" scoped>
$seprewidth: 250px;

.Script-Block {
  padding: 16px;
  .Head {
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
.show-recommod-text {
  max-width: 240px;
  overflow: hidden;
  display: flex;
    a{
flex: 1 1 0;
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;
text-decoration: none;
color: black;
  }

}
.recommond-icon {
  flex-shrink: 0;
  display: inline-block;
  width: 16.7px;
  height: 17px;
  text-align: center;
  // background-color: #ff981b;
  color: white;
  border-radius: 3px;
  line-height: 18.4px;
  font-size: 12.1px;
  margin-right: 5px;
}
.setting-wrap-status{
  flex-wrap: nowrap;
}
@media screen and (max-width: 800px) {
  .setting-wrap-status{
  flex-wrap: wrap;
}
.show-recommod-text[data-v-4da00568] {
    max-width: 100%;
}
}
@media screen and (max-width: 800px) {
  .main-scrip-page {
    width: 100% !important;
  }
  .show-mess-page {
    width: 100% !important;
    padding-left: 0px !important;
    margin-top: 20px;
  }
}
.pagination-input {
  max-width: 50px;
  margin: 0px 5px;
}
.page-main {
  margin-bottom: 20px;
  margin-top: 30px;
  .main-scrip-page {
    width: calc(100% - #{$seprewidth});
  }
  .show-mess-page {
    min-width: $seprewidth;
    padding-left: 10px;
    .q-card {
      margin-bottom: 10px;
    }
  }
}
</style>
