import NextTopLoader from 'nextjs-toploader';

export default function NavigationProgress() {
  return (
    <NextTopLoader
      color="#1890ff"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #1890ff,0 0 5px #1890ff"
      template='<div class="bar" role="bar"><div class="peg"></div></div> 
      <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
      zIndex={9999}
      showAtBottom={false}
    />
  );
}
