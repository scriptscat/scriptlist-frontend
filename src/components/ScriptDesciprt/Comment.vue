<template>
  <div>
      <div class="q-pa-md">
    <q-rating
      v-model="ratingpost"
      size="2em"
      :max="5"
      color="primary"
    />
  </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
          ratingpost:3
            
        }
    },
    methods: {
        
    },
    created() {
        
    },

}
</script>

<style lang="scss" scoped>

</style>