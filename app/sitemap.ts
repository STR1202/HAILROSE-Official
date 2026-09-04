import type { MetadataRoute } from 'next';
import { client } from '@/libs/microcms';
import { getNewsList } from '@/libs/news';
import { SITE_URL } from '@/libs/site';

// サイトマップ自体も静的生成される。microCMS を毎リクエスト叩かないよう
// 1時間ごとの再生成にしている（lastmod は分単位の精度を要求されない）。
export const revalidate = 3600;

/**
 * microCMS の該当エンドポイントで最後に更新された日時を取得する。
 *
 * `revisedAt` は「公開中の内容が最後に更新された日時」で、下書き保存では動かない。
 * `updatedAt` は下書きの保存でも進むため、公開ページの lastmod には revisedAt が適切。
 *
 * 取得に失敗しても sitemap 全体は返したいので、null を返して lastmod を省く。
 * lastmod は任意項目なので、無くてもサイトマップとしては妥当なまま。
 */
async function getLastModified(endpoint: string): Promise<Date | null> {
  try {
    const data = await client.get({
      endpoint,
      queries: { orders: '-revisedAt', limit: 1, fields: 'revisedAt' },
    });

    // profile はオブジェクト形式（単一コンテンツ）、他はリスト形式で返る。
    const revisedAt: unknown = Array.isArray(data?.contents)
      ? data.contents[0]?.revisedAt
      : data?.revisedAt;

    if (typeof revisedAt !== 'string') return null;

    const date = new Date(revisedAt);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error(`sitemap: microCMS Fetch Error (${endpoint}):`, error);
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [[news, live, music, videos, profile], newsItems] = await Promise.all([
    Promise.all(['news', 'live', 'music', 'videos', 'profile'].map(getLastModified)),
    getNewsList(),
  ]);

  // NEWS の各記事（/news/[id]）。記事は一覧からのリンクでも辿れるが、
  // サイトマップに載せておくと新着が見つかるまでの時間が短くなる。
  const newsEntries: MetadataRoute.Sitemap = newsItems.map((item) => ({
    url: `${SITE_URL}/news/${item.id}`,
    lastModified: new Date(item.revisedAt),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  // 静的ページ（トップ / MERCH / CONTACT）には lastModified を付けない。
  // ビルド時刻を入れると、内容が変わっていないのにデプロイのたびに
  // 「更新された」と申告することになり、lastmod の信頼度を下げるため。
  // lastmod は任意項目なので、省いても不完全なサイトマップにはならない。
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${SITE_URL}/news`,
      lastModified: news ?? undefined,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/live`,
      lastModified: live ?? undefined,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/music`,
      lastModified: music ?? undefined,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/videos`,
      lastModified: videos ?? undefined,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/profile`,
      lastModified: profile ?? undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/merch`, changeFrequency: 'monthly', priority: 0.3 },
    ...newsEntries,
  ];
}
