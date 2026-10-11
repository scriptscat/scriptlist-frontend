import { getLocale } from 'next-intl/server';
import AdSlot from '@/components/AdSlot';
import { prefetchAd } from '@/lib/api/services/advertise';

/**
 * 首页横幅广告的服务端预取。
 *
 * 单独拆成一个 async 组件，是为了让它能被 `<Suspense>` 包住：`prefetchAd` 打的是
 * 广告服务，一旦变慢，写在 `page.tsx` 顶层的 `await` 会把**全站流量最高的路由**
 * 的首字节一起拖住。放进 Suspense 之后页面骨架先流出，广告后到。
 */
export default async function HomeBannerAd() {
  const locale = await getLocale();
  const bannerAd = await prefetchAd('home-banner', locale);

  return <AdSlot slot="home-banner" variant="banner" initialData={bannerAd} />;
}
