// @ts-nocheck

const AmpAD: React.FC<{
  adClient: string;
  adSlot: string;
}> = ({ adClient, adSlot }) => {
  return (
    <amp-ad
      width="100vw"
      height="320"
      type="adsense"
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-auto-format="rspv"
      data-full-width=""
    >
      <div overflow=""></div>
    </amp-ad>
  );
};

export default AmpAD;
