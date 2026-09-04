// app/news/[id]/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsArticle from '@/components/NewsArticle';
import { buildNewsDescription, getNewsItem, getNewsList } from '@/libs/news';
import { OG_IMAGE, SITE_NAME, SITE_URL, X_HANDLE } from '@/libs/site';

// 一覧と同じ間隔で更新を取り込む（microCMS の記事修正が最大1分で反映される）。
export const revalidate = 60;

/**
 * ビルド時に既存の記事ぶんの静的ページを作る。
 *
 * ここに載らなかった ID（ビルド後に追加された記事）も、Next.js の既定
 * （dynamicParams: true）により初回アクセス時に生成されてキャッシュされる。
 * つまり記事を追加しても再デプロイは要らない。
 */
export async function generateStaticParams() {
  const items = await getNewsList();
  return items.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsItem(id);

  // 記事が無い場合はページ側で notFound() に倒れる。
  // ここで robots に noindex を立て、404 になる URL が検索結果に残らないようにする。
  if (!item) {
    return { title: 'お知らせが見つかりません', robots: { index: false } };
  }

  const description = buildNewsDescription(item);
  const url = `${SITE_URL}/news/${id}`;
  // アイキャッチがある記事はそれを、無ければサイト共通の OGP 画像を使う。
  const image = item.photo?.url ?? OG_IMAGE;

  return {
    title: item.title,
    description,
    alternates: { canonical: `/news/${id}` },
    openGraph: {
      // 記事なので website ではなく article。公開日・更新日を添えられる。
      type: 'article',
      locale: 'ja_JP',
      siteName: SITE_NAME,
      url,
      title: `${SITE_NAME}｜${item.title}`,
      description,
      publishedTime: item.publishedAt,
      modifiedTime: item.revisedAt,
      images: [{ url: image, alt: item.title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: X_HANDLE,
      creator: X_HANDLE,
      title: `${SITE_NAME}｜${item.title}`,
      description,
      images: [image],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNewsItem(id);

  if (!item) notFound();

  /*
    記事の構造化データ。

    publisher / author はレイアウトで宣言済みの MusicGroup を @id で参照するだけに留める。
    同じ実体を2度定義すると別物として扱われうるため、参照で繋ぐのが正しい書き方。
  */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: buildNewsDescription(item),
    datePublished: item.publishedAt,
    dateModified: item.revisedAt,
    ...(item.photo?.url ? { image: [item.photo.url] } : {}),
    author: { '@id': `${SITE_URL}/#musicgroup` },
    publisher: { '@id': `${SITE_URL}/#musicgroup` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${id}`,
    },
  };

  return (
    <main className="relative w-full min-h-screen pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // 本文は microCMS の入力なので、</script> で閉じられないよう '<' を退避する。
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* 1. 背景画像エリア（一覧ページと同じ敷き方） */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <Image
          src="/bg-image.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* 2. 記事本文エリア */}
      <section className="relative z-10 w-full pt-[calc(6.5rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] px-4 md:px-8 pb-20 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center">
          <NewsArticle item={item} />

          {/* 共有リンクから直接来た場合の導線。クローラにとっても一覧への内部リンクになる。 */}
          <div className="w-full max-w-3xl mx-auto mt-12 md:mt-16">
            <Link
              href="/news"
              className="
                inline-flex items-center gap-2 min-h-11 px-6 py-2.5
                border border-white/30 bg-white/10 rounded-full backdrop-blur-sm
                text-xs md:text-sm font-bold tracking-widest uppercase
                hover:bg-white hover:text-black transition-all duration-300
                touch-manipulation
              "
            >
              ← NEWS 一覧へ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
