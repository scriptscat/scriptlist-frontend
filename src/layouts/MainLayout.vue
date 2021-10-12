<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal bordered class="bg-primary text-white shadow-4">
      <q-toolbar>
        <q-toolbar-title class="links">
          <a href="/">ScriptCat</a>
          </q-toolbar-title>
        <q-tabs
          class="links mobile-hide"
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
          ></q-tab>
          <q-tab
            v-if="islogin"
            label="脚本管理"
            onclick="window.open('/managescript','_self')"
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
        <q-btn
          class="btn-control"
          dense
          flat
          round
          icon="menu"
          @click="right = !right"
        />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="right" side="right" bordered>
      <div v-for="(item, index) in itemlist" :key="index">
        <q-item @click="JumpToPage(item)" clickable v-ripple>
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{
              item.name === "登陆"
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
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style>
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
  meta: {
    titleTemplate: (title) => `${title} - ScriptCat`,
    meta: {
      description: {
        name: "description",
        content: "脚本猫脚本站,在这里你可以与全世界分享你的用户脚本",
      },
      keywords: { name: "keywords", content: "ScriptCat UserScript 用户脚本" },
    },
  },
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
      itemlist: [
        {
          name: "登陆",
          icon: "account_circle",
          sep: true,
        },
        {
          name: "首页",
          icon: "home",

          sep: false,
        },
        {
          name: "油猴论坛",
          icon: "language",

          sep: false,
        },
        {
          name: "脚本列表",
          icon: "description",

          sep: false,
        },
      ],
      right: false,
      tab: "",
    };
  },
  methods: {
    JumpToPage(item) {
      if (item.name === "登陆") {
        this.tryloginmess();
        return;
      }
      if (item.name === "首页") {
        window.open("/", "_self");
        return;
      }
      if (item.name === "油猴论坛") {
        window.open("https://bbs.tampermonkey.net.cn/", "_blank");
        return;
      }
      if (item.name === "脚本列表") {
        window.open("/search?page=1", "_self");
        return;
      }
    },
    tryloginmess() {
      debugger;
      if (this.islogin) {
        window.open("/", "_self");
      } else {
        this.gotoLogin();
      }
    },
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
<style lang="scss" scoped>
@media screen and (min-width: 554px) {
  .btn-control {
    display: none;
  }
}
@media screen and (max-width: 554px) {
  .mobile-hide {
    display: none;
  }
}
.links .q-tab{
  min-width: 100px;
}
</style>
