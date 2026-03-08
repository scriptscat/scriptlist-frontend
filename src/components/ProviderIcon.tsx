'use client';

import { Icon } from '@iconify/react';
import { LoginOutlined } from '@ant-design/icons';

interface ProviderIconProps {
  icon?: string;
  name?: string;
  size?: number;
  className?: string;
}

/**
 * Renders a provider icon from either a URL or an Iconify icon name.
 * - Starts with "http" → <img>
 * - Otherwise (e.g. "mdi:github") → Iconify <Icon>
 * - Empty/undefined → fallback <LoginOutlined>
 */
export default function ProviderIcon({
  icon,
  name,
  size = 18,
  className,
}: ProviderIconProps) {
  if (!icon) {
    return <LoginOutlined className={className} />;
  }

  if (icon.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- External provider icons with dynamic URLs
      <img
        src={icon}
        alt={name || ''}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return <Icon icon={icon} width={size} height={size} className={className} />;
}
