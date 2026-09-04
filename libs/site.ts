import type { Metadata } from 'next';

/**
 * サイト全体で共有する定数。
 *
 * canonical URL・OGP・sitemap.xml・robots.txt・構造化データはいずれも
 * 「サイトの絶対 URL」を必要とする。ここを唯一の出どころにしておかないと、
 * 一箇所だけ古いドメインが残って canonical と sitemap が食い違う、といった
 * 検索エンジン側にしか現れない不整合を起こす。
 */

/** 本番の絶対 URL。末尾スラッシュは付けない（`${SITE_URL}/music` の形で連結するため）。 */
export const SITE_URL = 'https://hailrose.com';

export const SITE_NAME = 'HAILROSE';

/** 検索結果・SNS カードに出る既定の説明文。 */
export const SITE_DESCRIPTION =
  'HAILROSE（ヘイルローズ）Official Website';

/**
 * SNS の公式アカウント。
 *
 * トップページ（PC / スマホ）のリンクと、構造化データの sameAs で同じものを使う。
 * sameAs は「この名前の実体はこれらのアカウントと同一である」と検索エンジンに
 * 伝えるための項目なので、実際にサイトから貼っているリンクと一致している必要がある。
 */
export const SOCIAL_LINKS = [
  { name: 'YouTube', href: 'https://www.youtube.com/@hailrose_droid' },
  { name: 'X (Twitter)', href: 'https://x.com/HAILROSE_droid' },
  { name: 'Instagram', href: 'https://www.instagram.com/nudigitalhcjp/' },
  {
    name: 'Spotify',
    href: 'https://open.spotify.com/intl-ja/artist/4Y8fSqvFWOtl3lWwZJh91p',
  },
  {
    name: 'Apple Music',
    href: 'https://music.apple.com/jp/artist/hailrose/1517272909',
  },
] as const;

/** X のアカウント名。Twitter カードの site / creator に使う。 */
export const X_HANDLE = '@HAILROSE_droid';

/** OGP 画像（1200x630）。public/og-image.png。 */
export const OG_IMAGE = '/og-image.png';

/**
 * 各ページのメタデータを組み立てる。
 *
 * openGraph / twitter は「入れ子のオブジェクトごと後勝ちで置き換わる」仕様で、
 * ページ側で openGraph を書くとレイアウトの images まで消える。逆にページ側で
 * 何も書かないと og:title がトップページのものを引き継いでしまい、どのページを
 * シェアしても同じタイトルのカードになる。
 * そのため各ページで openGraph / twitter を毎回すべて指定する必要があり、
 * その繰り返しをここに集約している。
 *
 * @param title ページ名（`HAILROSE｜%s` のテンプレートに入る短い文字列）
 * @param description そのページ固有の説明文
 * @param path 先頭スラッシュ付きのパス。canonical と og:url に使う
 */
export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const pageTitle = `${SITE_NAME}｜${title}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      siteName: SITE_NAME,
      url: `${SITE_URL}${path}`,
      title: pageTitle,
      description,
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} ロゴ` },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: X_HANDLE,
      creator: X_HANDLE,
      title: pageTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}
