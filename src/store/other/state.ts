// 其它一些杂的 例如markdown编辑器的内容
export interface OtherStateInterface {
  markdown: { [key: string]: string }
}

function state(): OtherStateInterface {
  return {
    markdown: {}
  }
};

export default state;
