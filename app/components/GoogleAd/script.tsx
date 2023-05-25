import { useNavigate } from '@remix-run/react';
import { useEffect } from 'react';

const GoogleAdScript: React.FC = () => {
  const nav = useNavigate();
  console.log('nav', nav);
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
