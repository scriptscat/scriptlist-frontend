'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

const GoogleAdScript: React.FC = () => {
  const pathname = usePathname();

  // 如果pathname匹配/script-show-page/\d+/
  if (!/\/script-show-page\/\d+[/]?$/.test(pathname)) {
    return <></>;
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8009073269666226"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default GoogleAdScript;
