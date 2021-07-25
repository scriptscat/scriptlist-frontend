<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal bordered class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="links"
          ><a href="/">ScriptCat</a></q-toolbar-title
        >
        <q-tabs
          class="links"
          align="left"
          indicator-color="transparent"
          active-color="white"
        >
          <q-tab label="首页" onclick="window.open('/','_self')"> </q-tab>
          <q-tab
            label="油猴论坛"
            onclick="window.open('https://bbs.tampermonkey.net.cn/','_blank')"
          >
          </q-tab>
          <q-tab
            label="脚本列表"
            onclick="window.open('/search?page=1','_self')"
          >
          </q-tab>
          <q-tab
            v-if="islogin"
            :label="user.username"
            onclick="window.open('/','_self')"
          >
          </q-tab>
          <q-tab v-else label="登录" @click="gotoLogin"></q-tab>
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style >
.links a {
  color: #fff;
  text-decoration: none;
}
.q-tabs.links .q-tab {
  width: 80px;
}
</style>

<script>
import { Cookies } from "quasar";

export default {
  preFetch({
    store,
    currentRoute,
    previousRoute,
    redirect,
    ssrContext,
    urlPath,
    publicPath,
  }) {
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch("user/loginUserInfo", cookies, ssrContext.res);
  },
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
    user() {
      return this.$store.state.user.user;
    },
  },
  data() {
    return {
      tab: "",
    };
  },
  methods: {
    BackRootPage() {
      this.$router.push({ path: "/" });
    },
    gotoLogin() {
      window.open(
        "https://bbs.tampermonkey.net.cn/plugin.php?id=codfrm_oauth2:oauth&client_id=80mfto0y3b8v&scope=user&response_type=code&redirect_uri=https%3A%2F%2Fscriptcat.org%2Fapi%2Fv1%2Flogin%2Foauth%3Fredirect_uri%3D" +
          encodeURIComponent(this.$route.path),
        "_self"
      );
    },
  },
};
</script>
