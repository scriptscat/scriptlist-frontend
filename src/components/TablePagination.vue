<template>
  <div class="flex">
    <div class="show-pag">
          <q-pagination
    
      :value="currentpage"
      @input="ChangePage"
      :max="maxpage"
      :max-pages="maxlens"
      direction-links
    />

    </div>
    <div class="flex justify-center items-center show-input-block">
      <span>跳至</span>
      <q-input
        outlined
        v-model="toPage"
        class="pagination-input"
        @keyup.enter.native="refreshTableData(toPage)"
      ></q-input>
      <span> 页</span>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      toPage: "" // 跳转至
    };
  },
  created() {
    console.log("88", this.currentpage, this.maxpage, this.maxlens);
    let tempnum = parseInt(this.currentpage);
    if (isNaN(tempnum)) {
      this.UpdateCurrentAndEmit(1);
    } else {
      if (tempnum > this.maxpage) {
        this.UpdateCurrentAndEmit(this.maxpage);
      }
    }
  },
  props: {
    currentpage: {
      type: Number
    },
    maxpage: {
      type: Number
    },
    maxlens: {
      type: Number
    }
  },
  methods: {
    ChangePage(value) {
      this.UpdateCurrentAndEmit(value);
    },
    UpdateCurrentAndEmit(cur) {
      let tempnum = parseInt(cur);
      this.$emit("update:currentpage", tempnum);
      this.$emit("UpdatePage", tempnum);
    },
    refreshTableData(val) {
      var r = /^\+?[1-9][0-9]*$/;
      if (r.test(val) && parseInt(val) <= this.maxpage) {
        this.UpdateCurrentAndEmit(val);
      } else {
        let num=parseInt(val)
        if(!isNaN(num)){
          if(num<1)
          {
            this.UpdateCurrentAndEmit(1);

          }else{
            this.UpdateCurrentAndEmit(this.maxpage);
          }
        }
      }
      this.toPage = "";
    }
  }
};
</script>
<style lang="scss" scoped>
@media screen and (max-width: 500px) {
.show-input-block{
  width:100%
}
.show-pag{
  width:100%;
  display: flex;
  justify-content: center;
}

}
</style>
