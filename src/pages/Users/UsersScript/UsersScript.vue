<template>
  <div class="flex flex-center padding-normal">
    <q-card-section flat bordered class="scriptshow">
      <q-card v-if="self.uid == User.uid" bordered flat>
        <q-btn dense flat icon="home" label="个人主页" class="text-body1" />
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
              style="margin-left: 10px"
            />
            <q-btn
              outline
              dense
              label="通知设置"
              class="text-body"
              to="/users/notify"
              style="margin-left: 10px"
            />
          </q-btn-group>
        </q-card-actions>
      </q-card>
      <div class="author flex flex-center">
        <a
          :href="'https://bbs.tampermonkey.net.cn/?' + User.uid"
          target="_blank"
        >
          <q-avatar>
            <img
              :src="'https://scriptcat.org/api/v1/user/avatar/' + User.uid"
            />
          </q-avatar>
        </a>
        <a
          :href="'https://bbs.tampermonkey.net.cn/?' + User.uid"
          target="_blank"
          style="color: #000000"
          class="text-h4"
          >&nbsp;{{ User.username }}</a
        ><span class="text-h4"> 编写的脚本 </span>
      </div>
      <div class="flex flex-center">
        <span
          >{{ followNum.following }} 关注 {{ followNum.followers }} 粉丝</span
        >
        <div v-if="self.uid && self.uid != User.uid">
          <q-btn
            v-if="isfollow"
            size="xs"
            color="blue"
            style="margin-left: 10px"
            @click="unfollowEvent"
            >取消关注</q-btn
          >
          <q-btn
            v-else
            size="xs"
            color="blue"
            style="margin-left: 10px"
            @click="followEvent"
            >+关注</q-btn
          >
        </div>
      </div>
      <!-- <Filter
        :sort="$route.query.sort"
        :category="$route.query.category"
        @sortChange="sortChange"
        @categoryChange="categoryChange"
      /> -->
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
          <ScriptDataInfo :script="item" />
          <q-separator />
          <q-item-label style="margin: 5px 5px 5px 0px">
            <ScriptCardAction :id="item.id" :name="item.name" />
          </q-item-label>
        </q-card>
      </q-card>
      <!-- <div v-show="maxPage > 1" class="flex flex-center">
        <TablePagination
          v-bind="page"
          :reloadPage="reload"
          :maxpage="maxPage"
          :maxlens="6"
          :max="10"
        />
      </div> -->
    </q-card-section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router';
// import Filter from '@App/components/ScriptFilter.vue';
// import TablePagination from '@Components/TablePagination.vue';
import { fetchUserScriptList } from '@App/apis/scripts';
import { Cookies, useMeta } from 'quasar';
import { StateInterface, useStore } from '@App/store';
import ScriptCardAction from '@Components/Script/ScriptCardAction.vue';
import { formatDate, goToLoginUrl } from '@App/utils/utils';
import { follow, isFollow, unfollow } from '@App/apis/user';
import ScriptDataInfo from '@App/components/Script/ScriptDataInfo.vue';

export default defineComponent({
  components: {
    // Filter,
    ScriptCardAction,
    // TablePagination,
    ScriptDataInfo,
  },
  computed: {
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
    followNum() {
      return this.$store.state.user.follow;
    },
  },
  async preFetch({ store, currentRoute, ssrContext, redirect }) {
    if (!ssrContext) {
      return;
    }
    if (!(<StateInterface>store.state).user.islogin) {
      return redirect(goToLoginUrl(currentRoute.path));
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    await store.dispatch('user/fetchUserInfo', {
      uid: (currentRoute.params.id || '').toString(),
      cookies: cookies,
    });
    await store.dispatch('scripts/fetchUserScriptList', {
      uid: parseInt(<string>currentRoute.params.id || '0'),
      cookies: cookies,
      // page: currentRoute.query.page || 1,
      // count: 20,
      // keyword: encodeURIComponent(<string>currentRoute.query.keyword || ''),
      sort: currentRoute.query.sort || 'today_download',
      category: currentRoute.query.category || '',
      domain: currentRoute.query.domain || '',
    });
  },
  setup() {
    useMeta({
      title: useStore().state.user.userInfo.username,
    });
    const route = useRoute();
    const page = ref(Number(route.query.page) || 1);
    return {
      page,
      dateformat: formatDate,
    };
  },
  data() {
    return {
      isfollow: false,
    };
  },
  async created() {
    if (process.env.SERVER || !this.self.uid) {
      return;
    }
    if ((await isFollow(this.User.uid)).data.data) {
      this.isfollow = true;
    }
  },
  methods: {
    followEvent() {
      void follow(this.User.uid);
      this.isfollow = true;
      this.$q.notify('关注成功');
    },
    unfollowEvent() {
      void unfollow(this.User.uid);
      this.isfollow = false;
      this.$q.notify('取消关注成功');
    },
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
