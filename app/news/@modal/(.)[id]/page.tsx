// app/news/@modal/(.)[id]/page.tsx
import { notFound } from 'next/navigation';
import NewsArticle from '@/components/NewsArticle';
import NewsModal from '@/components/NewsModal';
import { getNewsItem } from '@/libs/news';

// 記事ページ（app/news/[id]/page.tsx）と同じ内容を出すので更新間隔も揃える。
export const revalidate = 60;

/** aria-labelledby でモーダルと見出しを結ぶための id。 */
const TITLE_ID = 'news-detail-title';

/**
 * 一覧から /news/[id] へ遷移したときに、その遷移を横取りして
 * 一覧の上にモーダルとして記事を重ねる（Intercepting Routes）。
 *
 * `(.)` は「同じ階層のセグメントを横取りする」指定。@modal はスロットであって
 * ルートセグメントではないため、ここから見た [id] は同階層になる。
 *
 * 中身は記事ページとまったく同じ NewsArticle を使う。片方だけ本文の出し方が
 * 変わると、モーダルで読んだ内容と共有リンクの内容が食い違うことになる。
 *
 * なお <title> は children スロット（＝一覧ページ）のものが残るため、
 * モーダルを開いている間のタブ名は「HAILROSE｜NEWS」のまま。検索エンジンが
 * 見るのは横取りの起きない記事ページなので、インデックスには影響しない。
 */
export default async function InterceptedNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNewsItem(id);

  if (!item) notFound();

  return (
    <NewsModal titleId={TITLE_ID}>
      <NewsArticle item={item} headingLevel="h2" titleId={TITLE_ID} />
    </NewsModal>
  );
}
