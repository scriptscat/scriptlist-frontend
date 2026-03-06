'use client';

import { Checkbox, Form } from 'antd';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface AgreeTermsCheckboxProps {
  className?: string;
}

export default function AgreeTermsCheckbox({
  className,
}: AgreeTermsCheckboxProps) {
  const t = useTranslations('login');

  return (
    <Form.Item
      name="agree_terms"
      valuePropName="checked"
      className={className}
      rules={[
        {
          validator: (_, value) =>
            value
              ? Promise.resolve()
              : Promise.reject(new Error(t('agree_terms_required'))),
        },
      ]}
    >
      <Checkbox>
        <span className="text-xs">
          {t('agree_terms_prefix')}
          <Link
            href="/terms-of-service"
            target="_blank"
            className="text-[rgb(var(--primary-500))]"
          >
            {t('terms_of_service_link')}
          </Link>
          {t('agree_terms_separator')}
          <Link
            href="/privacy-policy"
            target="_blank"
            className="text-[rgb(var(--primary-500))]"
          >
            {t('privacy_policy_link')}
          </Link>
          {t('agree_terms_and')}
          <Link
            href="/disclaimer"
            target="_blank"
            className="text-[rgb(var(--primary-500))]"
          >
            {t('disclaimer_link')}
          </Link>
        </span>
      </Checkbox>
    </Form.Item>
  );
}
