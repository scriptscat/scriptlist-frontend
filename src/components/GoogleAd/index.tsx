/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect } from 'react';

const GoogleAd: React.FC<{
  width: string;
  height: string;
}> = ({ height }) => {
  useEffect(() => {
    let cnt = 0;
    let t = setInterval(() => {
      try {
        // @ts-expect-error
        (adsbygoogle = window.adsbygoogle || []).push({});
        clearInterval(t);
        // @ts-expect-error
        t = null;
      } catch {
        cnt++;
        if (cnt > 10) {
          clearInterval(t);
          // @ts-ignore
          t = null;
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
        width: '100%',
        maxHeight: height,
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8009073269666226"
        data-ad-slot="5802101414"
        data-ad-format="horizontal"
      ></ins>
    </div>
  );
};

export default GoogleAd;
