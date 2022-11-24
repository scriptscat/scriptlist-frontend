// @ts-nocheck

const AmpAD: React.FC<{
  width: string;
  height: string;
}> = ({ width, height }) => {
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
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8009073269666226"
        crossorigin="anonymous"
      ></script>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: width, height: height }}
        data-ad-client="ca-pub-8009073269666226"
        data-ad-slot="5564381007"
      ></ins>
      <script
        dangerouslySetInnerHTML={{
          __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
        }}
      ></script>
    </div>
  );
};

export default AmpAD;
