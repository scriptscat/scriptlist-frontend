<template>
  <div style="padding: 10px">
    <SubmitCode :id="id" :content="script.content"></SubmitCode>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SubmitCode from '@Components/Script/SubmitCode.vue';
export default defineComponent({
  components: {
    SubmitCode,
  },
  data() {
    return {
      id: parseInt(<string>this.$route.params.id),
    };
  },
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
    script() {
      return this.$store.state.scripts.script || <DTO.Script>{};
    },
  },
  mounted() {
    if (!this.id) {
      this.$q.notify({
        message: '来路错误!',
        position: 'top',
      });
      void this.$router.push({ path: '/' });
    }
  },
});
</script>

<style lang="scss" scoped>
.page-wrap {
  margin-bottom: 20px;
  margin-top: 20px;
}
</style>
