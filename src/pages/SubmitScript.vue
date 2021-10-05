<template>
  <div class="page-padding padding-normal page-wrap">
    <div class="show-mess-page">
      <q-card>
        <q-card-section> 
          <ScriptSubmit :id="id"></ScriptSubmit>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import ScriptSubmit from 'components/ScriptComponents/ScriptSubmit.vue'
export default {
  components:{
    ScriptSubmit

  },
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    }
  },
  data() {
    return {
      id:undefined,
    }
  },
  created() {
    if (process.env.CLIENT) {
      if (!this.islogin) {
        this.$q.notify({
          position: "top-right",
          message: "当前尚未登陆！",
          position: "top"
        });
        this.$router.push({ path: "/" });
        return;
      }
      //this.id = this.$route.query.id;
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  margin-bottom: 20px;
  margin-top: 20px;
}
</style>
