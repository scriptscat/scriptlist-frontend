<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal bordered class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div class="page-padding">
            <span @click="BackRootPage" style="cursor: pointer;"
              >油猴中文网</span
            >
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    BackRootPage() {
      this.$router.push({ path: "/" });
    }
  }
};
</script>
