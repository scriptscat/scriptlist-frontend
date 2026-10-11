import { Suspense } from 'react';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import HomeClient from './components/HomeClient';
import HomeBannerAd from './components/HomeBannerAd';

/** 横幅广告的占位高度，与 `AdSlot` banner 变体的 `max-h-[120px]` 对齐。 */
const BANNER_SLOT_HEIGHT = 120;

export default async function HomePage() {
  return (
    <PageIntlProvider namespaces={['home', 'script', 'ads']}>
      <HomeClient
        banner={
          // 广告接口慢不该拖住首页首字节；占位保持横幅高度，
          // 广告到达时下面的功能网格不会被顶下去。
          <Suspense
            fallback={
              <div
                style={{ height: BANNER_SLOT_HEIGHT }}
                className="w-full"
                aria-hidden
              />
            }
          >
            <HomeBannerAd />
          </Suspense>
        }
      />
    </PageIntlProvider>
  );
}
