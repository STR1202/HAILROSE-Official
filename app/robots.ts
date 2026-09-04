import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/libs/site';

/**
 * /robots.txt を生成する。
 *
 * robots.txt が無くてもクロールは「全許可」と解釈されるため、これ自体で
 * インデックスが増えるわけではない。目的は Sitemap 行を置くこと。
 * 検索エンジンは robots.txt を必ず読みに来るので、ここから sitemap.xml を
 * 指しておくと Search Console へ登録する前でもサイトマップを見つけてもらえる。
 *
 * /api/ を除外しているのは、唯一のエンドポイント /api/contact が
 * POST 専用のフォーム送信先で、クロールされても検索結果に載る中身が無いため。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
