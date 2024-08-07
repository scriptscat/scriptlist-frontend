import React, { useEffect, useRef } from 'react';
import { theme, Input } from 'antd';
import { TextAreaProps, TextAreaRef } from 'antd/es/input/TextArea';

const TextArea: React.ForwardRefRenderFunction<TextAreaRef, TextAreaProps> = (
  props,
  _ref
) => {
  const { token } = theme.useToken();
  const ref = useRef<TextAreaRef>(null);

  useEffect(() => {
    if (ref.current && ref.current.resizableTextArea) {
      ref.current.resizableTextArea.textArea.style.backgroundColor =
        token.colorBgContainer;
      ref.current.resizableTextArea.textArea.style.color = token.colorText;
    }
  }, [ref, token.colorBgContainer]);

  let style = Object.assign(
    {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      color: token.colorText,
    },
    props.style
  );

  return <Input.TextArea {...props} style={style} ref={ref} />;
};

export default React.forwardRef(TextArea);
