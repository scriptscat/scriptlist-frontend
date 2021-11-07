<template>
  <div class="page-padding padding-normal page-wrap">
    <div class="show-mess-page">
      <q-card>
        <q-card-section>
          <div class="text-h4" style="margin-top: 20px; text-align: center">
            {{ this.username }}
          </div>
          <div v-if="scriptList.length !== 0">
            <div
              class="Script-Block"
              v-for="(item, index) in scriptList"
              :key="index"
            >
              <q-card class="my-card" flat bordered>
                <q-item>
                  <q-item-section avatar>
                    <q-avatar>
                      <img
                        :src="
                          'https://scriptcat.org/api/v1/user/avatar/' + item.uid
                        "
                      />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>
                      <a
                        style="color: rgb(40, 86, 172)"
                        target="_blank"
                        :href="'/users/' + item.uid"
                      >
                        {{ item.username }}
                      </a>
                    </q-item-label>
                    <div class="text-body1">
                      <a
                        class="text-black"
                        target="_blank"
                        :href="'/script-show-page/' + item.id"
                      >
                        <b>{{ item.name }}</b>
                      </a>
                    </div>
                  </q-item-section>
                  <q-item-section side bottom>
                    <div
                      class="text-caption text-center text-primary"
                      style="font-size: 18px"
                    >
                      {{ ((item.score * 2) / 10).toFixed(1) }}
                    </div>
                    <q-rating
                      size="20px"
                      v-on:click="to_score(item.id)"
                      :value="item.score / 10"
                      :max="5"
                      color="primary"
                    />
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-card-section>
                  <q-card-section class="q-pt-none">
                    <div v-if="item.updatetime !== 0" class="text-grey-7">
                      今日安装：{{ item.today_install }} 总安装量：{{
                        item.total_install
                      }}
                      创建日期：{{ item.createtime | formatDate }} 最近更新：{{
                        item.updatetime | formatDate
                      }}
                    </div>
                    <div v-else class="text-grey-7">
                      今日安装：{{ item.today_install }} 总安装量：{{
                        item.total_install
                      }}
                      创建日期：{{ item.createtime | formatDate }} 最近更新：{{
                        item.createtime | formatDate
                      }}
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-section class="q-pt-none" style="margin-top: 10px"
                    >{{ item.description }}
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  meta() {
    return {
      title: this.username,
    };
  },

  components: {},

  preFetch({
    store,
    currentRoute,
    previousRoute,
    redirect,
    ssrContext,
    urlPath,
    publicPath,
  }) {
    return new Promise(async (resolve) => {
      await store.dispatch("user/fetchUserInfo", currentRoute.params.id);
      await store.dispatch(
        "scripts/fetchScriptList",
        "/user/scripts/" + currentRoute.params.id + "?&page=1&count=20"
      );
      resolve();
    });
  },

  computed: {
    maxpage: function () {
      let max = Math.ceil(this.totalnums / this.count);
      if (max < 1) {
        max = 1;
      }
      return max;
    },
    username() {
      return this.$store.state.user.userInfo.username;
    },
    scriptList() {
      return this.$store.state.scripts.scripts;
    },
  },
  data() {
    return {};
  },

  methods: {
    JumpBtnToTarget(item) {
      this.$router.push({
        path: item.href,
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
  },
};
</script>
<style lang="scss" scoped>
.page-wrap {
  max-width: 1100px;
  margin-bottom: 20px;
  margin-top: 20px;
}
.my-card {
  a {
    text-decoration: none;
  }
}
.Script-Block {
  padding: 16px;
}
</style>
