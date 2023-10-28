import React from 'react';
import { theme } from 'antd';
import { TextAreaRef } from 'antd/es/input/TextArea';
import AntdTextArea, { TextAreaProps } from 'antd/lib/input/TextArea';

const TextArea: React.ForwardRefRenderFunction<TextAreaRef, TextAreaProps> = (
  props,
  ref
) => {
  const { token } = theme.useToken();

  let style = Object.assign(
    {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      color: token.colorText,
    },
    props.style
  );

  return <AntdTextArea {...props} style={style} ref={ref} />;
};

export default React.forwardRef(TextArea);
