'use client';

import { LockOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import type { Rule } from 'antd/es/form';

/**
 * 生成密码校验规则
 * @param t - 翻译函数，需要提供以下 key:
 *   - password_required / new_password_required
 *   - password_min_length
 *   - password_max_length (可选)
 *   - password_complexity
 */
export function getPasswordRules(
  t: (key: string) => string,
  requiredKey = 'password_required',
): Rule[] {
  return [
    { required: true, message: t(requiredKey) },
    { min: 6, message: t('password_min_length') },
    { max: 32, message: t('password_max_length') },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
      message: t('password_complexity'),
    },
  ];
}

/**
 * 生成确认密码校验规则
 * @param passwordField - 密码字段名
 * @param t - 翻译函数
 * @param requiredKey - 必填提示翻译 key
 * @param mismatchKey - 不一致提示翻译 key
 */
export function getConfirmPasswordRules(
  passwordField: string,
  t: (key: string) => string,
  requiredKey = 'confirm_password_required',
  mismatchKey = 'password_mismatch',
): Rule[] {
  return [
    { required: true, message: t(requiredKey) },
    ({ getFieldValue }: { getFieldValue: (name: string) => string }) => ({
      validator(_: unknown, value: string) {
        if (!value || getFieldValue(passwordField) === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(t(mismatchKey)));
      },
    }),
  ];
}

interface PasswordFormItemsProps {
  /** 翻译函数 */
  t: (key: string) => string;
  /** 密码字段名，默认 "new_password" */
  passwordField?: string;
  /** 确认密码字段名，默认 "confirm_password" */
  confirmField?: string;
  /** 是否显示确认密码项，默认 true */
  showConfirm?: boolean;
  /** 密码 label */
  passwordLabel?: string;
  /** 确认密码 label */
  confirmLabel?: string;
  /** 密码 placeholder key */
  passwordPlaceholderKey?: string;
  /** 确认密码 placeholder key */
  confirmPlaceholderKey?: string;
  /** 密码 required 翻译 key */
  passwordRequiredKey?: string;
  /** 确认密码 required 翻译 key */
  confirmRequiredKey?: string;
  /** 密码不一致翻译 key */
  mismatchKey?: string;
  /** Input 额外 className */
  inputClassName?: string;
}

/**
 * 密码 + 确认密码表单项组件，封装通用校验规则和 i18n
 */
export default function PasswordFormItems({
  t,
  passwordField = 'new_password',
  confirmField = 'confirm_password',
  showConfirm = true,
  passwordLabel,
  confirmLabel,
  passwordPlaceholderKey = 'new_password_placeholder',
  confirmPlaceholderKey = 'confirm_password_placeholder',
  passwordRequiredKey = 'new_password_required',
  confirmRequiredKey = 'confirm_password_required',
  mismatchKey = 'password_mismatch',
  inputClassName,
}: PasswordFormItemsProps) {
  return (
    <>
      <Form.Item
        name={passwordField}
        label={passwordLabel ?? t('new_password')}
        rules={getPasswordRules(t, passwordRequiredKey)}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t(passwordPlaceholderKey)}
          className={inputClassName}
        />
      </Form.Item>

      {showConfirm && (
        <Form.Item
          name={confirmField}
          label={confirmLabel ?? t('confirm_password')}
          dependencies={[passwordField]}
          rules={getConfirmPasswordRules(
            passwordField,
            t,
            confirmRequiredKey,
            mismatchKey,
          )}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t(confirmPlaceholderKey)}
            className={inputClassName}
          />
        </Form.Item>
      )}
    </>
  );
}
