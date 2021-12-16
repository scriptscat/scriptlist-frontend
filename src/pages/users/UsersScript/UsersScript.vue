<template>
  <div class="flex flex-center padding-normal">
    <q-card-section
      flat
      bordered
      class="scriptshow"
    >
      <q-card v-if="self.uid == User.uid" bordered flat>
          <q-btn
            dense
            flat
            icon="home"
            label="个人主页"
            class="text-body1"
          />
        <q-card-actions>
          <q-btn-group flat>
          <q-btn
            dense
            color="primary"
            to="/users/script/new"
            label="发布编写的脚本"
            class="text-body"
          />
          <q-btn
            outline
            dense
            label="设置webhook"
            class="text-body"
            to="/users/webhook"
            style="margin-left:10px"
          />
          </q-btn-group>
        </q-card-actions>
      </q-card>
      <div class="author flex flex-center">
        <q-avatar>
          <img :src="'https://scriptcat.org/api/v1/user/avatar/' + User.uid" />
        </q-avatar>
        <div class="text-h4">&nbsp;{{ User.username }}编写的脚本</div>
      </div>
      <Filter
        :sort="$route.query.sort"
        :category="$route.query.category"
        @sortChange="sortChange"
        @categoryChange="categoryChange"
      />
      <q-card
        class="single"
        flat
        bordered
        v-for="(item, index) in ScriptList"
        v-bind:key="index"
      >
        <q-card bordered flat>
          <q-item>
            <q-item-section>
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
          </q-item>
          <q-separator />
          <q-card-section class="q-pt-none" style="margin: 10px 0px 0px 0px"
            >{{ item.description }}
          </q-card-section>
          <q-separator />
          <q-item class="block text-left">
            <q-item-label class="row" caption>
              <span class="col">今日安装</span>
              <span class="col">总安装量</span>
              <span class="col">创建日期</span>
              <span class="col">最近更新</span>
              <span class="col">评分</span>
            </q-item-label>
            <q-item-label
              class="row text-caption text-black"
              style="font-weight: bold"
            >
              <span class="col">{{ item.today_install }}</span>
              <span class="col">{{ item.total_install }}</span>
              <span class="col">{{ dateformat(item.createtime * 1000) }}</span>
              <span v-if="item.updatetime !== 0" class="col">{{
                dateformat(item.updatetime * 1000)
              }}</span>
              <span v-else class="col">{{
                dateformat(item.createtime * 1000)
              }}</span>
              <span v-if="item.score != 0" class="col"
                >{{ ((item.score * 2) / 10).toFixed(1) }} 分</span
              >
              <span v-else class="col">暂无评分</span>
            </q-item-label>
          </q-item>
          <q-separator />
          <q-item-label style="margin: 5px 5px 5px 0px">
            <ScriptCardAction :id="item.id" :name="item.name" />
          </q-item-label>
        </q-card>
      </q-card>
      <div v-if="maxPage > 1" class="flex flex-center">
        <TablePagination
          v-bind="page"
          :reloadPage="reload"
          :maxpage="maxPage"
          :maxlens="6"
          :max="10"
        />
      </div>
    </q-card-section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import format from 'date-fns/format';
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router';
import Filter from '@Components/Filter.vue';
import TablePagination from '@Components/TablePagination.vue';
import { fetchUserScriptList } from '@App/apis/scripts';
import { Cookies, useMeta } from 'quasar';
import { useStore } from '@App/store';
import ScriptCardAction from '@Components/Script/ScriptCardAction.vue';

export default defineComponent({
  components: {
    Filter,
    ScriptCardAction,
    TablePagination,
  },
  computed: {
    dateformat: () => {
      return (value: number | Date) => {
        return format(value, 'yyyy-MM-dd');
      };
    },
    maxPage() {
      return Math.ceil(this.$store.state.scripts.total / 20);
    },
    self() {
      return this.$store.state.user.user;
    },
    User() {
      return this.$store.state.user.userInfo;
    },
    ScriptList() {
      return this.$store.state.scripts.scripts;
    },
  },
  async preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    await store.dispatch('user/fetchUserInfo', {
      uid: (currentRoute.params.id || '').toString(),
      cookies: cookies,
    });
    await store.dispatch('scripts/fetchUserScriptList', {
      uid: parseInt(<string>currentRoute.params.id || '0'),
      cookies: cookies,
      page: currentRoute.query.page || 1,
      count: 20,
      keyword: encodeURIComponent(<string>currentRoute.query.keyword || ''),
      sort: currentRoute.query.sort || 'today_download',
      category: currentRoute.query.category || '',
      domain: currentRoute.query.domain || '',
    });
  },
  created() {
    console.log(this.User.uid, this.self.uid);
  },
  setup() {
    useMeta({
      title: useStore().state.user.userInfo.username,
    });
    const route = useRoute();
    const page = ref(Number(route.query.page) || 1);

    return {
      page,
    };
  },
  methods: {
    reload(currentRoute: RouteLocationNormalizedLoaded) {
      fetchUserScriptList({
        uid: parseInt(<string>currentRoute.params.id || '0'),
        page: parseInt(<string>currentRoute.query.page || '1'),
        count: 20,
        keyword: encodeURIComponent(<string>currentRoute.query.keyword || ''),
        sort: <string>currentRoute.query.sort || 'today_download',
        category: <string>currentRoute.query.category || '',
        domain: <string>currentRoute.query.domain || '',
      })
        .then((response) => {
          console.log(response);
          if (response.data.code == 0) {
            this.$store.commit('scripts/updateScripts', response.data);
          } else {
            this.$store.commit('scripts/updateScripts', { list: [], total: 0 });
          }
        })
        .catch((e) => {
          console.log(e);
          this.$store.commit('scripts/updateScripts', { list: [], total: 0 });
        });
    },
    sortChange(val: { value: string }) {
      void this.$router.replace({
        query: {
          sort: val.value,
        },
      });
    },
    categoryChange(val: string[]) {
      void this.$router.replace({
        query: {
          category: val.join(','),
        },
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.author {
  margin: 10px 0px 20px 0px;
}
.scriptshow {
  padding: 15px;
  width: 1000px;
  a {
    text-decoration: none;
  }
}
.single {
  margin: 20px 0px 20px 0px;
}
</style>
