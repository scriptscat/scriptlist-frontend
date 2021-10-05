<template>
  <div>
    <div class="title-wrap">
      屏蔽脚本
    </div>
    <div>
      当你选择屏蔽此脚本后，仅有你与管理员可以查看此脚本。
      你可以在接下来的日子里撤销此操作
    </div>
    <div style="margin:10px 0;">
      您想如何对待已经安装过此脚本的用户？
    </div>
    <div>
      <div>
        <q-radio v-model="installval" val="1" label="保留当前内容" />
      </div>
      <div>
        <q-radio
          v-model="installval"
          val="2"
          label="自动更新为无意义代码脚本"
        />
      </div>
      <div>
          
        <q-radio v-model="installval" val="3" label="重定向你的指向脚本" />
      </div>
    </div>
    <div v-if="installval==='3'">
            <div class="title-wrap">
      重定向地址
    </div>
            <q-input
      outlined
      v-model="address"
      label=""
      dense
    >
    </q-input>



    </div>
        <q-btn :loading="loading.uniteloading" style="margin-top:10px;" label="屏蔽" color="primary" />
    <div>
            <div class="title-wrap">
      删除脚本
    </div>
    <div>
        在七日后永久删除该脚本，在期间可以撤销此操作，如没有撤销，则任何人无法恢复此脚本的数据。
    </div>
    <q-btn :loading="loading.uniteloading" style="margin-top:10px;" label="永久删除" color="primary" />


    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
              loading: {
        uniteloading: false
      },
      installval: "",
      address:'',

    };
  }
};
</script>
<style lang="scss" scoped>
.title-wrap {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
