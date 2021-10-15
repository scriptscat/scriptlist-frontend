<template>
  <div class="page-padding padding-normal setting-wrap-status flex page-main">
    <div class="shadow-5 main-scrip-page">
      <div v-if="ScriptList.length !== 0">
        <div>
          <div class="Script-Block" v-for="(item, index) in ScriptList" :key="index">
            <q-card class="my-card shadow-2" bordered>
              <q-item >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="'https://scriptcat.org/api/v1/user/avatar/' + item.uid">
                  </q-avatar>
                </q-item-section>

                <q-item-section style="margin-top:12px ">
                  <q-item-label >
                    <a href="">{{item.username}}</a>
                    </q-item-label>
                  <div class="text-body1"><b>{{item.name}}</b>
                    <q-btn
                      v-on:click="go_install(item.id)"
                      flat color="primary"
                      icon="directions"/>
                  </div>
                </q-item-section>
                <q-item-section side bottom>
                    <div class="text-caption text-center text-grey">脚本评分:{{item.score}}分</div>
                    <q-rating 
                      size="20px" 
                      v-on:click="to_score(item.id)" 
                      :value="item.score" 
                      :max="5" 
                      color="primary"/>
                </q-item-section>
              </q-item>
              
              <q-separator />

              <q-card-section>
                <q-card-section class="q-pt-none">
                  <div v-if="item.updatetime !== 0" class="text-grey-7">
                    今日安装:{{ item.today_install }}　总安装量:{{ item.total_install }}
                  　创建日期:{{ item.createtime | formatDate }}　最近更新:{{ item.updatetime | formatDate }}
                  </div>
                  <div v-else class="text-grey-7">
                    今日安装:{{ item.today_install }}　总安装量:{{ item.total_install }}
                  　创建日期:{{ item.createtime | formatDate }}　最近更新:{{ item.createtime | formatDate }}
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pt-none" style="margin-top:10px">{{item.description}}
                </q-card-section>
              </q-card-section>
            </q-card>
            <q-separator />
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
        <div class="flex items-center justify-center column"style="margin-top:80px;">
          <span style="font-size:20px;">暂无相关脚本搜索结果</span>
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
      <q-list bordered class="rounded-borders" style="padding-top:5px; width:300px;">
        <q-expansion-item
          default-opened
          dense
          dense-toggle
          expand-separator
          caption="安装量推荐"
        >
          <q-card>
            <q-card-section>
              <div v-for="(item, index) in recommondlist.download" :key="index">
                <span class="show-recommod-text">
                  <span
                    :style="{ backgroundColor: iconcolorlist[index] }"
                    class="recommond-icon"
                    >{{ index + 1 }}
                    </span>
                    <a class="text-caption" :href="'/script-show-page/'+item.id"> {{ item.name }}</a>
                </span>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-expansion-item
          default-opened
          dense
          dense-toggle
          expand-separator
          caption="评分推荐"
        >
          <q-card>
            <q-card-section>
              <div v-for="(item, index) in recommondlist.score" :key="index">
                <span class="show-recommod-text"
                  ><span
                    :style="{ backgroundColor: iconcolorlist[index] }"
                    class="recommond-icon"
                    >{{ index + 1 }}</span
                  ><a class="text-caption" :href="'/script-show-page/'+item.id"> {{ item.name }}</a></span
                >
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-expansion-item
          default-opened
          dense
          dense-toggle
          expand-separator
          caption="最新脚本"
        >
          <q-card>
            <q-card-section>
                <div v-for="(item, index) in recommondlist.new" :key="index">
                  <span class="show-recommod-text"
                    ><span
                      :style="{backgroundColor: iconcolorlist[index] }"
                      class="recommond-icon"
                      >{{ index + 1 }}</span
                    ><a class="text-caption" :href="'/script-show-page/'+item.id"> {{ item.name }}</a></span
                  >
                </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
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
    to_score(id){
      window.open('/script-show-page/' + id+'/comment')
    },
    go_install(id){
      window.open('/script-show-page/' + id)
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
  .my-card {
    a{
      color:rgb(40, 86, 172);
      text-decoration: none;
    }
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
  max-width: 300px;
  padding-left:4px;
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

.page-main {
  margin-bottom: 20px;
  margin-top: 30px;
  .main-scrip-page {
    width: calc(100% - #{$seprewidth});
  }
  .show-mess-page {
    min-width: $seprewidth;
    padding-left: 30px;
    .q-card {
      margin-bottom: 10px;
    }
  }
}
</style>
