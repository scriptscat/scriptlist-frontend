<template>
  <div class="page-padding padding-normal">
    <q-card style="margin: 30px 0px">
      <q-card-actions>
        <div>
          <div class="title-wrap">
            Webhook
          </div>
          <div style="white-space: pre-line;">
            <span
              >与 脚本猫 绑定的
              Webhook（网页通知事件）可以基于代码仓库的更新而自动更新 网站
              上对应的脚本。脚本猫 支持 GitHub
              的“push（推送）”事件和 GitHub的“release（发布）”事件。
              要使用该功能，你必须在 脚本猫
              设定通过地址同步脚本的功能。你可以通过 导入脚本到 脚本猫
              来添加，或从已提交脚本的“管理”页面来设定同步。
              你的脚本在收到第一次自动推送的事件之前，脚本的同步类型还是会显示为“自动”或“手动”。</span
            >
          </div>


        <div class="title-wrap">
          GitHub
        </div>
        <div style="margin-bottom:10px;">
          在Github上设置webhook，访问github仓库并去设置，webhooks，添加webhook，输入下方数据
        </div>
        <div>
          有效url
        </div>
        <div class="padding-left">
          敬请期待
        </div>
                <div>
          内容类型
        </div>
        <div class="padding-left">
          application/json
        </div>        <div>
          Secret
        </div>
        <div class="padding-left" style="margin:5px 0">
                <q-btn
        label="生成"
        color="primary"
      />
        </div>        <div>
          您喜欢哪个事件触发Webhook？
        </div>
        <div class="padding-left" style="white-space: pre-line;">To update ScriptCat on all pushes, choose "Just the push event".
To update ScriptCat only on releases, choose "Let me select individual events", uncheck "Pushes", and check "Releases".</div>        <div>
          行为
        </div>
        <div class="padding-left">
          (Checked)
        </div>
                </div>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.title-wrap {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}
.padding-left {
  padding-left: 20px;
}
</style>
