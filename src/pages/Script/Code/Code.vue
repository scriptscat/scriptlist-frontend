<template>
  <div class="code-wrap">
    <textarea ref="code"></textarea>
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';
import { getScriptInfo } from 'src/apis/scripts';
const CodeMirror = async () => await import('codemirror');

if (process.env.CLIENT) {
  require('codemirror/lib/codemirror.css');
  require('codemirror/mode/javascript/javascript');
  require('codemirror/theme/base16-light.css');
  require('codemirror/theme/neo.css');
}

const editor = <
  {
    code?: CodeMirror.EditorFromTextArea;
  }
>{
  code: undefined,
};

export default defineComponent({
  computed: {
    id() {
      return parseInt(<string>this.$route.params.id);
    },
    // script() {
    //   return this.$store.state.scripts.script || <DTO.Script>{};
    // },
  },
  setup() {
    useMeta({
      title: '代码',
    });
    return {};
  },
  unmounted() {
    if (!editor.code) {
      return;
    }
    editor.code.setValue('');
    editor.code.clearHistory();
    editor.code.toTextArea();
    editor.code = undefined;
  },
  created() {
    if (process.env.CLIENT) {
      void this.$nextTick(() => {
        getScriptInfo(this.id, true)
          .then(async (response) => {
            if (response.data.code === 0) {
              editor.code = (await CodeMirror()).default.fromTextArea(
                <HTMLTextAreaElement>this.$refs.code,
                {
                  readOnly: true,
                  lineWrapping: true,
                  mode: 'javascript',
                  theme: 'neo', // 主日样式
                  lineNumbers: true, // 显示行号
                }
              );
              editor.code.setValue(response.data.data.script.code);
              let scollinfo = editor.code.getScrollInfo();
              if (scollinfo.height < 1400) {
                editor.code.setSize(scollinfo.width, scollinfo.height + 100);
              } else {
                editor.code.setSize(scollinfo.width, 1400);
              }
            }
          })
          .catch((error) => {
            console.log(error);
            this.$q.notify({
              message: '系统错误!',
              position: 'top',
            });
          });
      });
    }
  },
});
</script>

<style lang="scss" scoped>
.code-wrap {
  ::v-deep .CodeMirror {
    height: 0px;
  }
}
</style>