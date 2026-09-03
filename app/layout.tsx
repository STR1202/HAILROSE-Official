// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import BackgroundVideo from '@/components/BackgroundVideo';

// アイコンは app/ の file convention（app/apple-icon.png など）ではなく
// ここで明示的に指定している。file convention が出力する href には
// キャッシュバスター用のクエリが付く（例: /apple-icon.png?apple-icon.2rsi-ah_zh2rs.png）が、
// Safari はこの形式の apple-touch-icon を取りこぼすことがあり、
// その際はルート直下の /apple-touch-icon.png へフォールバックする。
// 画像を public/ に置いてクエリなしの絶対パスで指す形にすると、
// link タグ経由・ルート直下フォールバックのどちらでも同じ画像が使われる。
//
// 注意: metadata.icons を明示すると app/ 配下の icon / apple-icon ファイルは
// link タグに合流しなくなる（favicon.ico だけは常に先頭へ差し込まれる）。
// そのため apple-icon.png は app/ に残さず public/apple-touch-icon.png へ移動済み。
export const metadata: Metadata = {
  title: 'HAILROSE',
  description: 'HAILROSE Official Website',
  icons: {
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
};

// viewport-fit=cover を指定しないと env(safe-area-inset-*) が常に 0 を返し、
// ノッチ／ホームインジケータを避けるための余白指定がすべて無効になる。
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // suppressHydrationWarning は <html> タグ自身の属性差分だけを黙らせる。
  //
  // ブラウザの拡張機能などが React の起動前に <html> へ独自の属性
  // （例: __gcrremoteframetoken="..."）を書き込むと、サーバーが返した HTML と
  // 一致せずハイドレーション警告が出る。閲覧者の環境次第で発生し、こちら側では
  // 防ぎようがない一方、表示には影響しない。
  //
  // 効果は「この要素の属性とテキスト」の1階層のみで子孫には及ばないため、
  // 本当のハイドレーション不一致はこれまでどおり検出できる。
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-black text-white font-sans selection:bg-red-600 selection:text-white antialiased">
        {/*
          背景：スマホは静止画（bg-image.jpg）、PC は動画。

          高さを lvh（最大ビューポート高）で固定しているのは、アドレスバーが
          出入りしても背景の下端に隙間ができないようにするため。

          priority を付けていないのは意図的。loading="lazy" のままにしておくと
          md 以上では display:none で画面に入らないため PC 側は取得せず、
          スマホでは初期表示領域にあるので即座に読み込まれる。
        */}
        <div className="lg:hidden fixed inset-x-0 top-0 h-lvh z-0 overflow-hidden pointer-events-none">
          <Image
            src="/bg-image.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <BackgroundVideo />

        {/* ナビゲーション：スマホは右上の三点リーダー、PC は横並びバー */}
        <div className="lg:hidden">
          <MobileHeader />
        </div>
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* ページコンテンツ */}
        <div className="relative z-10 w-full">{children}</div>
      </body>
    </html>
  );
}
