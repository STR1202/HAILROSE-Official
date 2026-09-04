import { client, type NewsItem } from '@/libs/microcms';

/**
 * NEWS 一覧を公開日の降順で取得する。
 *
 * 一覧ページ・記事ページの generateStaticParams・sitemap.xml の3箇所から呼ぶ。
 * 取得に失敗しても呼び出し側は「お知らせなし」として描画を続けられるよう、
 * 例外は投げず空配列を返す（microCMS の一時的な不調でページ全体を
 * 500 にしてしまわないため）。
 */
export async function getNewsList(): Promise<NewsItem[]> {
  try {
    const data = await client.get({
      endpoint: 'news',
      queries: { orders: '-publishedAt', limit: 100 },
    });
    return data.contents;
  } catch (error) {
    console.error('microCMS Fetch Error (news):', error);
    return [];
  }
}

/**
 * NEWS 記事を1件取得する。存在しない ID なら null。
 *
 * microCMS は未知の contentId に対して 404 を投げるので、
 * 「取得失敗」と「記事が無い」を呼び出し側で区別せず notFound() に倒す。
 */
export async function getNewsItem(id: string): Promise<NewsItem | null> {
  try {
    return await client.get({ endpoint: 'news', contentId: id });
  } catch (error) {
    console.error(`microCMS Fetch Error (news/${id}):`, error);
    return null;
  }
}

/** 一覧・記事で共通の日付表記（例: 2026.09.02）。 */
export function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/**
 * 本文から meta description 用の要約を作る。
 *
 * 本文はプレーンテキストなので、改行と連続空白を潰して先頭を切り出す。
 * 検索結果に出るのは概ね 120 文字前後なので、それを超える分は捨てて末尾に省略記号を付ける。
 * 本文が空の記事もあるため、その場合はタイトルから組み立てる。
 */
export function buildNewsDescription(item: NewsItem): string {
  const body = item.word?.replace(/\s+/g, ' ').trim();
  if (!body) return `${item.title}｜HAILROSE（ヘイルローズ）からのお知らせ。`;
  return body.length > 120 ? `${body.slice(0, 119)}…` : body;
}
