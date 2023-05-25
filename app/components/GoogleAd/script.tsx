import { useLocation, useNavigate, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';

const GoogleAdScript: React.FC = () => {
  const location = useLocation();
  // 如果pathname匹配/script-show-page/367/
  if (!/\/script-show-page\/\d+[\/]$/.test(location.pathname)) {
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

export default GoogleAdScript;
