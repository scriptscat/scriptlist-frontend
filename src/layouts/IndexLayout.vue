<template>
  <q-layout>
    <q-header bordered class="bg-grey-1 text-black" height-hint="64">
      <q-toolbar class="GNL__toolbar">
        <q-toolbar-title shrink class="row items-center no-wrap">
          <a
            href="/"
            class="row no-wrap"
            style="text-decoration: none; color: #000"
          >
            <img
              :src="require('src/assets/cat.png')"
              style="
                width: 36px;
                vertical-align: middle;
                margin: 0px 10px 0px 12px;
              "
            />
            <div class="logo-title">ScriptCat</div>
          </a>
        </q-toolbar-title>

        <q-space />

        <q-drawer v-model="right" side="right" bordered>
          <div v-for="(item, index) in itemlist" :key="index">
            <q-item @click="JumpToPage(item)" clickable v-ripple>
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>
                {{
                  item.name === '登陆'
                    ? islogin === true
                      ? user.username
                      : item.name
                    : item.name
                }}
              </q-item-section>
            </q-item>
            <q-separator v-if="item.sep" />
          </div>
        </q-drawer>
        <div class="q-gutter-sm row items-center no-wrap">
          <div class="pc">
            <q-btn
              flat
              dense
              onclick="window.open('/','_self')"
              label="首页"
              icon="home"
              class="q-mx-md"
            />
            <q-btn
              flat
              dense
              onclick="window.open('https://bbs.tampermonkey.net.cn/','_blank')"
              label="油猴论坛"
              icon="chat"
              class="q-mx-md"
            />
            <q-btn
              flat
              dense
              onclick="window.open('/search','_self')"
              label="脚本列表"
              icon="apps"
              class="q-mx-md"
            />
            <q-btn
              flat
              dense
              v-if="islogin"
              onclick="window.open('/managescript','_self')"
              label="管理脚本"
              icon="menu"
              class="q-mx-md"
            />
            <q-btn round dense flat color="grey-8" icon="notifications">
              <!-- <q-badge color="red" text-color="white" floating>
              2
            </q-badge> -->
              <q-tooltip>通知-🚧建设中</q-tooltip>
            </q-btn>
            <q-btn v-if="islogin" round flat>
              <q-avatar size="26px">
                <img
                  :src="'https://scriptcat.org/api/v1/user/avatar/' + user.uid"
                />
              </q-avatar>
              <q-tooltip>{{ user.username }}</q-tooltip>
            </q-btn>
            <q-btn v-else round flat @click="gotoLogin">
              <q-avatar size="26px">
                <img :src="require('src/assets/defaultavatar.png')" />
              </q-avatar>
              <q-tooltip>暂未登录</q-tooltip>
            </q-btn>
          </div>
          <q-btn
            style="display: none"
            class="btn-control"
            dense
            flat
            round
            icon="menu"
            @click="right = !right"
          />
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container view="hHh lpR fFf">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { Cookies, useMeta } from 'quasar';
import { fasGlobeAmericas, fasFlask } from '@quasar/extras/fontawesome-v5';
export default defineComponent({
  name: 'IndexLayout',
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
    user() {
      return this.$store.state.user.user;
    },
  },
  preFetch({ store, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch('user/loginUserInfo', {
      cookies: cookies,
      res: ssrContext.res,
    });
  },
  setup() {
    useMeta({
      titleTemplate: (title: string) => `${title} - ScriptCat`,
      meta: {
        description: {
          name: 'description',
          content: '脚本猫脚本站,在这里你可以与全世界分享你的用户脚本',
        },
        keywords: {
          name: 'keywords',
          content: 'ScriptCat UserScript 用户脚本',
        },
      },
    });
    const leftDrawerOpen = ref(false);
    const search = ref('');
    const showAdvanced = ref(false);
    const showDateOptions = ref(false);
    const exactPhrase = ref('');
    const hasWords = ref('');
    const excludeWords = ref('');
    const byWebsite = ref('');
    const byDate = ref('Any time');
    function onClear() {
      exactPhrase.value = '';
      hasWords.value = '';
      excludeWords.value = '';
      byWebsite.value = '';
      byDate.value = 'Any time';
    }
    function changeDate(option: string) {
      byDate.value = option;
      showDateOptions.value = false;
    }
    return {
      leftDrawerOpen,
      search,
      showAdvanced,
      showDateOptions,
      exactPhrase,
      hasWords,
      excludeWords,
      byWebsite,
      byDate,
      right: ref(false),
      links1: [
        { icon: 'web', text: 'Top stories' },
        { icon: 'person', text: 'For you' },
        { icon: 'star_border', text: 'Favourites' },
        { icon: 'search', text: 'Saved searches' },
      ],
      links2: [
        { icon: 'flag', text: 'Canada' },
        { icon: fasGlobeAmericas, text: 'World' },
        { icon: 'place', text: 'Local' },
        { icon: 'domain', text: 'Business' },
        { icon: 'memory', text: 'Technology' },
        { icon: 'local_movies', text: 'Entertainment' },
        { icon: 'directions_bike', text: 'Sports' },
        { icon: fasFlask, text: 'Science' },
        { icon: 'fitness_center', text: 'Health ' },
      ],
      links3: [
        { icon: '', text: 'Language & region' },
        { icon: '', text: 'Settings' },
        { icon: 'open_in_new', text: 'Get the Android app' },
        { icon: 'open_in_new', text: 'Get the iOS app' },
        { icon: '', text: 'Send feedback' },
        { icon: 'open_in_new', text: 'Help' },
      ],
      onClear,
      changeDate,
    };
  },
});
</script>

<style lang="sass">
.GNL
  &__toolbar
    height: 64px
  &__toolbar-input
    width: 55%
  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px
    .q-item__section--avatar
      .q-icon
        color: #5f6368
    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem
  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem
    &:hover
      color: #000
</style>

<style lang="scss" scoped>
.GNL__toolbar-input {
  width: 875px;
  margin-left: 9%;
}
@media screen and (max-width: 554px) {
  .GNL__toolbar-input {
    width: 100%;
    margin-left: 0px;
  }
  .logo-title {
    display: none;
  }
  .btn-control {
    display: show;
  }
  .pc {
    display: none;
  }
}
</style>
