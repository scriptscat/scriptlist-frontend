<template>
  <q-layout>
    <q-page-container view="hHh lpR fFf" class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Cookies } from 'quasar';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'MainLayout',
  setup() {
    return {};
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
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
    user() {
      return this.$store.state.user.user;
    },
  },
});
</script>
