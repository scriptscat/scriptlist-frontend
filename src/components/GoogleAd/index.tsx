import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const GoogleAd: React.FC<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  useEffect(() => {
    let cnt = 0;
    let t: NodeJS.Timeout | null = setInterval(() => {
      try {
        // 确保 Google AdSense 脚本已加载
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          if (t) {
            clearInterval(t);
            t = null;
          }
        } else {
          throw new Error('AdSense script not loaded');
        }
      } catch (error) {
        cnt++;
        if (cnt > 10) {
          // 增加重试次数
          console.warn(
            'Google AdSense failed to load after 10 attempts:',
            error,
          );
          if (t) {
            clearInterval(t);
            t = null;
          }
        }
      }
    }, 500);

    return () => {
      if (t) {
        clearInterval(t);
      }
    };
  }, []);

  return (
    <div
      className="ad"
      style={{
        // width: width === '100%' ? '100%' : width,
        // height,
        maxHeight: height,
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-8009073269666226"
        data-ad-slot="5802101414"
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default GoogleAd;
