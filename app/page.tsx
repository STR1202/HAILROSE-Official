// app/page.tsx
import DesktopPage from '@/components/DesktopPage';
import MobilePage from '@/components/MobilePage';

export default function TopPage() {
  return (
    <>
      {/*
        スマホ・タブレット縦向け（〜1023px）とPC（1024px〜）でトップページを出し分ける。

        以前は User-Agent（/mobile|android|iphone|ipad|ipod/）で判定していたが、
        ヘッダーと背景は layout.tsx の CSS ブレークポイントで切り替わるため、
        iPad では「本文はモバイル版・ヘッダーはPC版」という食い違いが起きていた。
        判定を lg (1024px) の1系統に統一して両者を必ず一致させる。

        副次的な利点として headers() を使わなくなるため、このページが
        動的レンダリング（ƒ）から静的生成（○）に戻る。

        両方をレンダリングしても、非表示側は display:none で画面外扱いになり
        loading="lazy" の画像が取得されないため、通信量は増えない。
      */}
      <div className="lg:hidden">
        <MobilePage />
      </div>
      <div className="hidden lg:block">
        <DesktopPage />
      </div>
    </>
  );
}
