<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from "vue";
Vue.use(ElementUI);
export default {
  name: 'App'
}
</script>
