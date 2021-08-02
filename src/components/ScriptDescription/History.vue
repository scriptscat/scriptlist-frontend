<template>
  <div></div>
</template>

<script>
export default {
  computed: {
    id() {
      return this.$route.params.id;
    },
  },
  data() {
    return {};
  },
  methods: {
    GetScriptHistory() {
      this.get("/scripts/" + this.id + "/versions")
        .then((response) => {
          console.log(response, "response");
          if (response.data.msg === "ok") {
          }
        })
        .catch((error) => {});
    },
  },
  created() {
    this.GetScriptHistory();
  },
};
</script>

<style lang="scss" scoped>
</style>