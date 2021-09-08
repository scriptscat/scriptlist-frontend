<template>
  <div></div>
</template>

<script>
export default {
    props: {
    id: {
      type: Number | String
    }
  },
    data() {
        return {
            
        }
    },
    methods: {
      GetScriptHistory(){
              this.get("/scripts/" + this.id+'/versions')
        .then(response => {
          console.log(response, "response");
          if (response.data.code=== 0) {

          }
        })
        .catch(error => {});
      },
        
    },
    created() {
      this.GetScriptHistory();
        
    },

}
</script>

<style lang="scss" scoped>

</style>