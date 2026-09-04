// app/page.tsx
import DesktopPage from '@/components/DesktopPage';
import MobilePage from '@/components/MobilePage';

export default function TopPage() {
  return (
    <>
      {/*
        トップページは中身がロゴ画像だけで、クローラから見ると
        テキストが1文字も無いページになる。h1 を1つ置いて
        「このページは何なのか」を伝える。sr-only は視覚的には
        見えないがスクリーンリーダーと検索エンジンからは読める。

        Desktop / Mobile は両方 DOM に出るため h1 をそれぞれに置くと
        1ページに2つ並ぶ。ここに1つだけ置いて重複を避ける。
      */}
      <h1 className="sr-only">HAILROSE（ヘイルローズ）オフィシャルサイト</h1>

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
