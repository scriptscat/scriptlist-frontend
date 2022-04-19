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
    return {
      editor: <
        {
          code?: CodeMirror.EditorFromTextArea;
        }
      >{
        code: undefined,
      },
    };
  },
  unmounted() {
    if (!this.editor.code) {
      return;
    }
    this.editor.code.setValue('');
    this.editor.code.clearHistory();
    this.editor.code.toTextArea();
    this.editor.code = undefined;
  },
  mounted() {
    void this.$nextTick(() => {
      getScriptInfo(this.id, true)
        .then(async (response) => {
          if (response.data.code === 0) {
            this.editor.code = (await CodeMirror()).default.fromTextArea(
              <HTMLTextAreaElement>this.$refs.code,
              {
                readOnly: true,
                lineWrapping: true,
                mode: 'javascript',
                theme: 'neo', // 主日样式
                lineNumbers: true, // 显示行号
              }
            );
            this.editor.code.setValue(response.data.data.script.code);
            let scollinfo = this.editor.code.getScrollInfo();
            if (scollinfo.height < 1400) {
              this.editor.code.setSize(scollinfo.width, scollinfo.height + 100);
            } else {
              this.editor.code.setSize(scollinfo.width, 1400);
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
