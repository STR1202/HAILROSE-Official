// app/news/page.tsx
import Image from 'next/image';
import NewsList from './NewsList';
import { getNewsList } from '@/libs/news';
import { buildPageMetadata, SITE_DESCRIPTION } from '@/libs/site';

export const metadata = buildPageMetadata({
  title: 'NEWS',
  description: SITE_DESCRIPTION,
  path: '/news',
});

// microCMS の更新をサイトに反映させるための ISR（再検証）設定。
// 未指定だと build 時に一度だけ生成され、再デプロイするまで内容が固定される。
// 60 秒を過ぎた後の最初のアクセスをきっかけに裏側で再生成し、
// その完了以降のアクセスが新しい内容になる（生成中も古い内容を即座に返す）。
export const revalidate = 60;

export default async function NewsPage() {
  const newsList = await getNewsList();

  return (
    <main className="relative w-full min-h-screen pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* 1. 背景画像エリア */}
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

      {/* 2. NEWS コンテンツエリア */}
      <section className="relative z-10 w-full pt-[calc(6.5rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] px-4 md:px-8 pb-20 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center">
          
          {/* NEWS タイトル & 破線セパレーター */}
          <div className="w-full flex items-center gap-4 mb-10 md:mb-14">
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">NEWS</h1>
            <div className="grow border-b border-dashed border-white/60"></div>
          </div>

          {/* 一覧（タイトルのみ）とタップ時の全画面詳細。
              取得はサーバー側で完結させ、開閉の状態管理だけをクライアントに渡す。 */}
          <NewsList items={newsList} />

        </div>
      </section>

    </main>
  );
}
