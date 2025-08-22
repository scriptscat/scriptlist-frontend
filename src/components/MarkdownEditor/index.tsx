'use client';

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useTheme } from '@/contexts/ThemeClientContext';
import { resourceService } from '@/lib/api';
import { message } from 'antd';
import { useTranslations } from 'next-intl';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import './toast-ui-theme.css'; // 自定义主题样式
import Prism from 'prismjs';
import '../MarkdownView/prism.css';

// 类型定义
interface ToastUIEditor {
  getMarkdown(): string;
  setMarkdown(markdown: string): void;
  destroy(): void;
}

interface MarkdownEditorProps {
  initialValue?: string;
  placeholder?: string;
  height?: string;
  rows?: number; // 向后兼容，会转换为 height
  className?: string;
  autoFocus?: boolean; // 是否自动获取焦点
  addImageBlobHook?: (
    blob: Blob | File,
    callback: (url: string, text?: string) => void,
  ) => void;
  comment:
    | 'create-script'
    | 'create-issue'
    | 'update-script'
    | 'comment'
    | 'avatar'; // 上传图片的注释
  linkId?: number; // 关联ID
}

export interface MarkdownEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  getEditor: () => ToastUIEditor | null;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  (
    {
      initialValue = '',
      placeholder,
      height,
      rows,
      className = '',
      autoFocus = false, // 默认不自动获取焦点
      comment,
      linkId = 0,
    },
    ref,
  ) => {
    const t = useTranslations('components.markdown_editor');
    const editorRef = useRef<HTMLDivElement>(null);
    const editorInstanceRef = useRef<ToastUIEditor | null>(null);
    const { themeMode } = useTheme();
    const [isClient, setIsClient] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    // 计算编辑器高度：优先使用 height，否则根据 rows 计算
    const editorHeight = height || (rows ? `${rows * 24 + 100}px` : '400px');

    // 设置默认placeholder
    const defaultPlaceholder = placeholder || t('placeholder');

    useImperativeHandle(ref, () => ({
      getValue: () => editorInstanceRef.current?.getMarkdown() || '',
      setValue: (value: string) =>
        editorInstanceRef.current?.setMarkdown(value),
      getEditor: () => editorInstanceRef.current,
    }));

    // 确保在客户端环境下运行
    useEffect(() => {
      setIsClient(true);
      // 确保 Prism 在全局可用
      if (typeof window !== 'undefined') {
        (window as any).Prism = Prism;
      }
    }, []);

    // 创建编辑器的函数
    const createEditor = useCallback(
      async (initialValue: string = '') => {
        if (!editorRef.current || !isClient) return;

        try {
          // 动态导入 Toast UI Editor
          // @ts-expect-error - Toast UI Editor 类型声明问题
          const { Editor } = await import('@toast-ui/editor');

          // 尝试加载代码语法高亮插件
          let plugins: any[] = [];
          try {
            const codeSyntaxHighlight = await import(
              '@toast-ui/editor-plugin-code-syntax-highlight'
            );

            // 确保 Prism 在全局可用
            if (typeof window !== 'undefined') {
              (window as any).Prism = Prism;
            }

            plugins = [
              [
                codeSyntaxHighlight.default,
                {
                  highlighter: Prism,
                },
              ],
            ];
          } catch (pluginError) {
            console.warn(
              'Code syntax highlight plugin failed to load:',
              pluginError,
            );
            // 继续创建编辑器，但不使用语法高亮插件
          }

          const editor = new Editor({
            el: editorRef.current,
            height: editorHeight,
            initialEditType: 'markdown',
            previewStyle: 'tab',
            initialValue: initialValue,
            placeholder: defaultPlaceholder,
            theme: themeMode.theme === 'dark' ? 'dark' : 'default',
            plugins,
            autofocus: autoFocus, // 使用传入的 autoFocus 属性
            hooks: {
              addImageBlobHook: async (
                blob: Blob | File,
                callback: (url: string, text?: string) => void,
              ) => {
                setImageLoading(true);
                try {
                  const resp = await resourceService.uploadImage(
                    blob,
                    comment,
                    linkId,
                  );

                  // 构建完整的图片URL
                  const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/v2/resource/image/${resp.id}`;
                  const fileName = blob instanceof File ? blob.name : 'image';
                  callback(imageUrl, fileName);
                } catch (error) {
                  console.error(t('image_upload_failed') + ':', error);
                  message.error(t('image_upload_failed'));
                } finally {
                  setImageLoading(false);
                }
                return false;
              },
            },
          });

          editorInstanceRef.current = editor;
        } catch (error) {
          console.error('Failed to create editor:', error);
        }
      },
      [
        isClient,
        editorHeight,
        defaultPlaceholder,
        themeMode.theme,
        autoFocus,
        comment,
        linkId,
        t,
      ],
    );

    // 初始化编辑器
    useEffect(() => {
      if (isClient) {
        createEditor(initialValue);
      }

      return () => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.destroy();
          editorInstanceRef.current = null;
        }
      };
    }, [isClient, createEditor]);

    // 监听主题变化
    useEffect(() => {
      if (editorInstanceRef.current && isClient) {
        // Toast UI Editor 不直接支持动态主题切换，需要重新创建实例
        const currentValue = editorInstanceRef.current.getMarkdown();
        editorInstanceRef.current.destroy();
        createEditor(currentValue);
      }
    }, [themeMode.theme, isClient, createEditor]);

    // 监听值变化
    useEffect(() => {
      if (
        editorInstanceRef.current &&
        initialValue !== editorInstanceRef.current.getMarkdown()
      ) {
        editorInstanceRef.current.setMarkdown(initialValue);
      }
    }, [initialValue]);

    // 在服务器端或客户端未就绪时显示加载状态
    if (!isClient) {
      return (
        <div className={className}>
          <div
            style={{ height: editorHeight }}
            className="flex items-center justify-center border border-app-primary rounded-lg bg-app-elevated theme-transition"
          >
            <div className="text-app-secondary">{t('loading_editor')}</div>
          </div>
        </div>
      );
    }

    return (
      <div className={`${className} theme-transition relative`}>
        {imageLoading && (
          <div className="absolute top-2 right-2 z-10 bg-app-elevated border border-app-primary rounded px-2 py-1 text-sm text-app-secondary">
            {t('uploading_image')}
          </div>
        )}
        <div ref={editorRef} />
      </div>
    );
  },
);

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
