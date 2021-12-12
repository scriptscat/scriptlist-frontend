<template>
  <div class="page-padding padding-normal page-wrap">
    <div class="show-mess-page">
      <q-card>
        <q-card-section>
          <q-no-ssr>
            <SubmitCode></SubmitCode>
          </q-no-ssr>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SubmitCode from '@Components/Script/SubmitCode.vue';

export default defineComponent({
  components: {
    SubmitCode,
  },
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
  },
  created() {
    if (process.env.CLIENT) {
      if (!this.islogin) {
        this.$q.notify({
          message: '当前尚未登陆!',
          position: 'top',
        });
        void this.$router.push({ path: '/' });
        return;
      }
      //this.id = this.$route.query.id;
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