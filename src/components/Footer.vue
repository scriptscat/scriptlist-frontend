<template>
  <q-footer reveal class="flex-center footer" bordered>
      <q-card-section class="text-center">
        <div class="col-12">
          <q-btn type='a' href="https://github.com/scriptscat/scriptlist-frontend" icon="fab fa-github" flat dense color="grey-8"></q-btn>
          <q-btn type='a' href="https://t.me/scriptscat" icon="fab fa-telegram" flat dense color="grey-8"></q-btn>
          <q-btn type='a' href="https://jq.qq.com/?_wv=1027&k=nSHs0eBN" icon="fas fa-users" flat dense color="grey-8"></q-btn>
          <q-btn type='a' href="https://docs.scriptcat.org/" icon="fas fa-question-circle" flat dense color="grey-8"></q-btn>
        </div>
        <div class="text-body1 col-12 q-mt-sm text-grey-8 text-weight-bold">
          © 2021 ScriptCat. All rights reserved.
        </div>
      </q-card-section>
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
  width: 100%;
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