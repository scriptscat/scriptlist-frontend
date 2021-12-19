<template>
  <q-footer class="flex-center column footer">
    <div class="flex flex-center top box">
      <a
        style="margin-right: 20px; text-decoration: none"
        href="https://docs.scriptcat.org/"
        >Docs</a
      >
      <img :src="cat" width="36px;" />
      <a
        style="margin-left: 20px; text-decoration: none"
        href="https://github.com/scriptscat/"
        >Github</a
      >
    </div>
    <div class="flex flex-center" style="padding: 5px 0px 15px 0px">
      <span>@2020-2021 最终解释权归ScriptCat所有</span>
    </div>
  </q-footer>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Fliter',
  data() {
    return {
      cat: require('../assets/cat.png'),
    };
  },
});
</script>
<style>
.footer {
  background: #fff;
  color: #000;
  width: 60%;
  margin: 0 auto;
}

.footer a {
  text-decoration: none;
  color: #1296db;
}

.footer .top {
  border-top: 1px solid #d0d7de;
  margin-top: 40px;
}
.footer .box {
  width: 100%;
  text-align: center;
  padding: 4px;
}
</style>