<template>
  <div>
    <div class="title-wrap">
      推荐脚本
    </div>
    <div>
      在安装该脚本后向安装者推荐您所输入的脚本。
    </div>
    <div class="title-wrap">
      推荐脚本网址
    </div>
    <q-input
      outlined
      v-model="recommendaddress"
      label=""
      style="margin-bottom:10px"
      dense
    >
    </q-input>
    <div>
      <q-btn
        :loading="loading.uniteloading"
        label="设置推荐脚本"
        color="primary"
      />
    </div>
    <q-separator style="margin:10px 0" />
    <div class="title-wrap">
      源代码同步
    </div>
    <div style="margin-bottom:10px">
      自动从输入的地址中进行源代码同步操作。
    </div>
    <q-input
      outlined
      v-model="intervalgetscript"
      label=""
      style="margin-bottom:10px"
      dense
    >
    </q-input>
    <div>
      脚本同步方式
    </div>
    <div>
      <div>
        <q-radio
          v-model="intervalmethod"
          val="auto"
          label="自动，系统将在未来时间内定期进行更新检查"
        />
      </div>
      <div>
        <q-radio
          v-model="intervalmethod"
          val="person"
          label="手动，仅在你手动点击按钮的时候进行更新检查"
        />
      </div>
    </div>
    <div>
      同步脚本附加信息
    </div>
    <div style="margin:10px 0;">
      默认的附加信息，匹配@name语言(强制markdown)
    </div>
    <div>
      <q-input
        outlined
        v-model="addtext"
        label=""
        style="margin-bottom:10px"
        dense
      >
      </q-input>
    </div>
    <div>
      <q-btn
        :loading="loading.uniteloading"
        label="更新设置并且立刻同步"
        color="primary"
      />
    </div>
    <q-separator style="margin:10px 0" />
    <div class="title-wrap">
      作者
    </div>
    <div style="margin-bottom:10px">
      您可以邀请其他作者共同开发并管理脚本，注意开放管理权限对于一些存在道德问题的人是危险的。
    </div>
    <q-input
      outlined
      v-model="author"
      label=""
      style="margin-bottom:10px"
      dense
    >
    </q-input>
    <q-btn :loading="loading.uniteloading" label="发送邀请" color="primary" />
    <div class="title-wrap">
      管理日志
    </div>
    <div>
      暂未开放
    </div>
    <div class="title-wrap">
      与另一脚本比较
    </div>
    <div style="margin-bottom:10px;">
      要比较的脚本地址
    </div>
    <q-input
      outlined
      v-model="compareaddress"
      label=""
      style="margin-bottom:10px"
      dense
    >
    </q-input>
        <div style="margin-bottom:10px;">
      上下文行数
    </div>
        <q-input
        dense
      v-model.number="compareline"
      type="number"
      outlined
      style="max-width: 200px"
    />
    <q-btn :loading="loading.uniteloading" style="margin-top:10px;" label="比较" color="primary" />
    
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: {
        uniteloading: false
      },
      recommendaddress: "",
      intervalgetscript: "",
      intervalmethod: "",
      addtext: "",
      author: "",
      compareaddress: "",
      compareline:3,
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
