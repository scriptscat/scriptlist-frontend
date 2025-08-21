'use client';

import type { NextRouter } from 'next/router';
import { withRouter } from 'next/router';

const GoogleAdScript: React.FC<{ router: NextRouter }> = ({ router }) => {
  // 如果pathname匹配/script-show-page/\d+/
  if (!/\/script-show-page\/\d+[/]?$/.test(router.pathname)) {
    return <></>;
  }
  return (
    <>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8009073269666226"
        crossOrigin="anonymous"
      ></script>
    </>
  );
};

export default withRouter(GoogleAdScript);
