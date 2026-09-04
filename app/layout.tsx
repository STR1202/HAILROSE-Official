// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import BackgroundVideo from '@/components/BackgroundVideo';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  X_HANDLE,
} from '@/libs/site';

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
  // 相対パスの canonical / OGP 画像を絶対 URL に展開する基準。
  // これが無いと alternates.canonical や openGraph.images に相対パスを書けず、
  // 開発中は localhost が焼き込まれた URL が出力されてしまう。
  metadataBase: new URL(SITE_URL),

  // default はトップページの <title>。サイト名だけにする。
  // template は下層ページ用で「MUSIC | HAILROSE」の形になる。
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'HAILROSE',
    'ヘイルローズ',
    'ヘイルローズ バンド',
    'HAILROSE 公式',
    'ライブ',
    'ライブスケジュール',
    'ミュージックビデオ',
    'バンド',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // 各ページは alternates.canonical に自分のパスを設定して上書きする。
  // canonical が無いと、末尾スラッシュ有無・クエリ付きの URL（SNS の
  // ?fbclid=... など）が別ページとして扱われ、評価が分散する。
  alternates: { canonical: '/' },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // 既定ではサムネイルが小さく切られる。大きい画像・長いスニペットを
      // 許可しておくと検索結果での占有面積が増える。
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} ロゴ`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: X_HANDLE,
    creator: X_HANDLE,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },

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

/**
 * 構造化データ（JSON-LD）。
 *
 * meta タグは「このページは何か」しか伝えられないが、構造化データは
 * 「HAILROSE という音楽グループが実体としてあり、その公式サイトがここで、
 * SNS アカウントはこれら」という関係を明示できる。同名の別物と混同されにくくなり、
 * ナレッジパネルやサイトリンクの対象にもなる。
 *
 * @graph に複数のエンティティを入れ、@id で相互参照する形が推奨される書き方。
 * 記載するのはサイト上で実際に確認できる事実のみ（ジャンルやメンバー構成などの
 * 裏取りできない項目は、誤りが構造化データとして固定されるので入れない）。
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MusicGroup',
      '@id': `${SITE_URL}/#musicgroup`,
      name: SITE_NAME,
      alternateName: 'ヘイルローズ',
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      image: `${SITE_URL}/og-image.png`,
      logo: `${SITE_URL}/og-image.png`,
      // 「この名前の実体はこれらのアカウントと同一」という宣言。
      sameAs: SOCIAL_LINKS.map((link) => link.href),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'ja-JP',
      publisher: { '@id': `${SITE_URL}/#musicgroup` },
    },
  ],
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
          構造化データ。値はすべてこのファイル内の定数なので外部入力は混ざらないが、
          JSON.stringify は </script> を無害化しないため、'<' はエスケープしておく。
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />

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
