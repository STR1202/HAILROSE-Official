// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import BackgroundVideo from '@/components/BackgroundVideo';

// アイコンは app/ の file convention（app/icon.*, app/apple-icon.*, app/favicon.ico）
// ではなく、画像を public/ に置いてここで明示的に指定している。理由は2つ。
//
// 1. file convention が出力する href にはキャッシュバスター用のクエリが付く
//    （例: /apple-icon.png?apple-icon.2rsi-ah_zh2rs.png）。Safari はこの形式の
//    apple-touch-icon を取りこぼすことがあり、その際はルート直下の
//    /apple-touch-icon.png へフォールバックする。public/ にクエリなしで置けば
//    link タグ経由・ルート直下フォールバックのどちらでも同じ画像に到達する。
//    /favicon.ico も同様にルート直下を直接叩かれても 200 で返る。
//
// 2. iOS Safari のタブ一覧はタブのファビコン（rel="icon"）を使うが、WebKit は
//    ICO よりも PNG のファビコンの方が確実に表示される。app/favicon.ico を置いた
//    ままだと Next.js が ICO の link タグを rel="icon" の先頭に必ず差し込むため、
//    それを避けるべく favicon.ico も public/ へ移し、link タグは PNG のみにした。
//    ICO はファイル自体を残してあるので、ルート直下 /favicon.ico を前提にする
//    古いブラウザやクローラからは引き続き取得できる。
//
// 画像はいずれも同一の元データ（黒地に HAILROSE ロゴ）から生成した正方形。
export const metadata: Metadata = {
  title: 'HAILROSE',
  description: 'HAILROSE（ヘイルローズ） Official Website',
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
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
