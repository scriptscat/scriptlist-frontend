<template>
  <q-layout view="lHh Lpr fff">
    <q-header elevated class="bg-primary text-white" height-hint="64">
      <q-toolbar>
        <q-toolbar-title class="links">
          <span href="/" class="q-ml-sm">ScriptCat</span>
          </q-toolbar-title>
        <q-tabs
          class="links mobile-hide"
          align="left"
          indicator-color="transparent"
          active-color="white"
        >
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
            onclick="window.open('/search?page=1','_self')"
            label="脚本列表"
            icon="menu"
            class="q-mx-md"
          />
          <q-btn
            flat
            dense
            v-if="islogin"
            onclick="window.open('/managescript','_self')"
            label="管理脚本"
            icon="add"
            class="q-mx-md"
          />
          <q-btn round flat
            v-if="islogin"
            onclick="window.open('/','_self')"
          >
            <q-avatar size="26px">
              <img v-bind:src="avatar + user.uid">
            </q-avatar>
            <q-tooltip>{{user.username}}</q-tooltip>
          </q-btn>

          <q-btn round flat
            v-else
            @click="gotoLogin"
          >
            <q-avatar size="26px">
              <img :src="DefaultAvatar">
            </q-avatar>
            <div class="q-mx-md">用户未登陆</div>
            <q-tooltip>请点击登陆</q-tooltip>
          </q-btn>

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
      DefaultAvatar: require('../assets/defaultavatar.png'),
      avatar: "https://scriptcat.org/api/v1/user/avatar/",
      Account:"请点击登陆",
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
        "https://bbs.tampermonkey.net.cn/plugin.php?id=codfrm_oauth2:oauth&client_id=80mfto0y3b8v&scope=user&response_type=code&redirect_uri=" +
          encodeURIComponent(process.env.VUE_APP_HTTP_HOST) +
          "%2Flogin%2Foauth%3Fredirect_uri%3D" +
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
.links .q-tab {
  min-width: 100px;
}
</style>
