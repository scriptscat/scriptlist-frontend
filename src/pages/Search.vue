<template>
  <div class="page-padding padding-normal flex page-main">
    <div class="shadow-5 main-scrip-page">
      <div>
        <div
          class="Script-Block"
          v-for="(item, index) in ScriptList"
          :key="index"
        >
          <div class="Head">
            <div>
              <a :href="'/script-show-page?id=' + item.id" target="_black">{{
                item.name
              }}</a>
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
              <span v-if="item.description !== ''">{{ item.description }}</span>
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
    <div class="show-mess-page">
      <q-card>
        <div class="bg-primary text-white" style="padding: 5px">
          <div class="text-subtitle2">今日推荐</div>
        </div>

        <q-separator />

        <q-card-actions> </q-card-actions>
      </q-card>
      <q-card>
        <div class="bg-primary text-white" style="padding: 5px">
          <div class="text-subtitle2">最高安装</div>
        </div>

        <q-separator />

        <q-card-actions> </q-card-actions>
      </q-card>
      <q-card>
        <div class="bg-primary text-white" style="padding: 5px">
          <div class="text-subtitle2">最新脚本</div>
        </div>

        <q-separator />

        <q-card-actions> </q-card-actions>
      </q-card>
    </div>
  </div>
</template>
<script>
import TablePagination from "components/TablePagination.vue";

export default {
  meta: {
    title: "ScriptCat - 用户脚本列表"
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
        encodeURIComponent(currentRoute.query.keyword || "")
    );
  },
  watch: {
    $route(currentRoute, from) {
      this.page = parseInt(this.$route.query.page);
      this.get(
        "/scripts?page=" +
          (currentRoute.query.page || 1) +
          "&count=20&keyword=" +
          encodeURIComponent(currentRoute.query.keyword || "")
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
      return ret;
    }
  },
  data() {
    return {
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
