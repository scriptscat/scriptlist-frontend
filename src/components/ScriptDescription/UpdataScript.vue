<template>
  <div>
    <ScriptSubmit :id="id"></ScriptSubmit>
  </div>
</template>

<script>
import ScriptSubmit from "components/ScriptComponents/ScriptSubmit.vue";
export default {
  components: {
    ScriptSubmit
  },
  data() {
    return {
      id: undefined
    };
  },
  created() {
    this.id = this.$route.query.id;
    if (this.id === undefined) {
      this.$q.notify({
        position: "top-right",
        message: "来路错误！",
        position: "top"
      });
      this.$router.push({ path: "/" });
      return;
    }
  }
};
</script>
<style lang="scss" scoped></style>
